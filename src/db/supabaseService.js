// Supabase database configuration for Netlify deployment
import { createClient } from '@supabase/supabase-js';
import { emailService } from '../services/emailService';
import bcrypt from 'bcryptjs';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Authentication helpers
export const authHelpers = {
  async login(username, password) {
    try {
      // First check if user exists with this username
      const { data: users, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      if (userError || !users) {
        throw new Error('Gebruikersnaam of wachtwoord is onjuist');
      }

      // Check if this is admin login with environment variable
      if (users.role === 'admin') {
        const adminPassword = process.env.REACT_APP_ADMIN_PASSWORD;
        if (!adminPassword) {
          throw new Error('Admin wachtwoord niet geconfigureerd');
        }

        if (password === adminPassword) {
          return await this.completeLogin(users);
        } else {
          throw new Error('Gebruikersnaam of wachtwoord is onjuist');
        }
      } else {
        // Regular user login - check hashed password
        const isPasswordValid = await bcrypt.compare(password, users.password_hash);

        if (isPasswordValid) {
          // Check if account is activated
          if (!users.is_active) {
            throw new Error('Je account is nog niet geactiveerd. Controleer je email voor de activatielink.');
          }

          return await this.completeLogin(users);
        } else {
          throw new Error('Gebruikersnaam of wachtwoord is onjuist');
        }
      }
    } catch (error) {
      console.error('Login error:', error.message);
      throw new Error(error.message || 'Login mislukt');
    }
  },

  async register(userData) {
    try {
      const { username, email, password } = userData;

      // Check if username already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('username')
        .eq('username', username)
        .single();

      if (existingUser) {
        throw new Error('Gebruikersnaam is al in gebruik');
      }

      // Check if email already exists
      const { data: existingEmail } = await supabase
        .from('users')
        .select('email')
        .eq('email', email)
        .single();

      if (existingEmail) {
        throw new Error('Email adres is al in gebruik');
      }

      // Hash the password securely
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Generate activation token
      const activationToken = this.generateActivationToken();
      const activationExpires = new Date();
      activationExpires.setHours(activationExpires.getHours() + 24); // 24 hours from now

      // Create new user (inactive by default)
      const { data: newUser, error } = await supabase
        .from('users')
        .insert([{
          username,
          email,
          password_hash: hashedPassword,
          role: 'user',
          is_active: false,
          activation_token: activationToken,
          activation_expires_at: activationExpires.toISOString()
        }])
        .select()
        .single();

      if (error) {
        throw new Error('Fout bij aanmaken account: ' + error.message);
      }

      // Send activation email
      await this.sendActivationEmail(email, username, activationToken);

      return {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        isActive: newUser.is_active,
        needsActivation: true
      };
    } catch (error) {
      throw new Error(error.message || 'Registratie mislukt');
    }
  },

  generateActivationToken() {
    // Generate a secure random token
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 32; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  },

  async sendActivationEmail(email, username, token) {
    try {
      // Create activation link
      const baseUrl = window.location.origin;
      const activationLink = `${baseUrl}/activate?token=${token}`;

      // Use the email service to send activation email
      const result = await emailService.sendActivationEmail(email, username, activationLink);

      return result.success;
    } catch (error) {
      console.error('Error sending activation email:', error.message);
      return false;
    }
  },

  async activateAccount(token) {
    try {
      // Find user with this activation token
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('activation_token', token)
        .single();

      if (userError || !user) {
        throw new Error('Ongeldige activatietoken');
      }

      // Check if token has expired
      const now = new Date();
      const expiresAt = new Date(user.activation_expires_at);

      if (now > expiresAt) {
        throw new Error('Activatietoken is verlopen. Vraag een nieuwe aan.');
      }

      // Check if account is already activated
      if (user.is_active) {
        throw new Error('Account is al geactiveerd');
      }

      // Activate the account
      const { error: updateError } = await supabase
        .from('users')
        .update({
          is_active: true,
          activation_token: null,
          activation_expires_at: null
        })
        .eq('id', user.id);

      if (updateError) {
        throw new Error('Fout bij activeren account');
      }

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: true
      };
    } catch (error) {
      throw new Error(error.message || 'Account activatie mislukt');
    }
  },

  async resendActivationEmail(email) {
    try {
      // Find user by email
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (userError || !user) {
        throw new Error('Gebruiker niet gevonden');
      }

      if (user.is_active) {
        throw new Error('Account is al geactiveerd');
      }

      // Generate new activation token
      const newToken = this.generateActivationToken();
      const newExpires = new Date();
      newExpires.setHours(newExpires.getHours() + 24);

      // Update user with new token
      const { error: updateError } = await supabase
        .from('users')
        .update({
          activation_token: newToken,
          activation_expires_at: newExpires.toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        throw new Error('Fout bij genereren nieuwe token');
      }

      // Send new activation email
      await this.sendActivationEmail(user.email, user.username, newToken);

      return true;
    } catch (error) {
      throw new Error(error.message || 'Kon activatie email niet opnieuw verzenden');
    }
  },

  async completeLogin(user) {
    // Update last login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    // Store user in localStorage for session management
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    };

    localStorage.setItem('user', JSON.stringify(userData));
    return userData;
  },

  async sendWelcomeEmail(email, username) {
    try {
      // Use the real email service
      const result = await emailService.sendWelcomeEmail(email, username);

      if (result.success) {
        return true;
      } else {
        console.warn('⚠️ Failed to send welcome email:', result.error);
        // Don't throw error - registration should still succeed even if email fails
        return false;
      }
    } catch (error) {
      console.error('❌ Error in sendWelcomeEmail:', error);
      // Don't throw error - registration should still succeed
      return false;
    }
  },

  generatePassword(length = 12) {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    const allChars = lowercase + uppercase + numbers + symbols;

    let password = '';

    // Ensure at least one character from each category
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  },

  validatePassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password);

    const errors = [];

    if (password.length < minLength) {
      errors.push(`Wachtwoord moet minimaal ${minLength} karakters lang zijn`);
    }
    if (!hasUpperCase) {
      errors.push('Wachtwoord moet minimaal één hoofdletter bevatten');
    }
    if (!hasLowerCase) {
      errors.push('Wachtwoord moet minimaal één kleine letter bevatten');
    }
    if (!hasNumbers) {
      errors.push('Wachtwoord moet minimaal één cijfer bevatten');
    }
    if (!hasSpecialChar) {
      errors.push('Wachtwoord moet minimaal één speciaal teken bevatten');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  logout() {
    localStorage.removeItem('user');
  },

  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated() {
    return this.getCurrentUser() !== null;
  },

  isAdmin() {
    const user = this.getCurrentUser();
    return user && user.role === 'admin';
  },

  async getMetrics() {
    if (!this.isAdmin()) {
      throw new Error('Geen toegang tot metrics');
    }

    try {
      // Get total number of users
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Get total number of quizzes
      const { count: totalQuizzes } = await supabase
        .from('quizzes')
        .select('*', { count: 'exact', head: true });

      // Get quizzes created this month
      const currentDate = new Date();
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

      const { count: quizzesThisMonth } = await supabase
        .from('quizzes')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', firstDayOfMonth.toISOString());

      // Get total teams
      const { count: totalTeams } = await supabase
        .from('teams')
        .select('*', { count: 'exact', head: true });

      return {
        totalUsers: totalUsers || 0,
        totalQuizzes: totalQuizzes || 0,
        quizzesThisMonth: quizzesThisMonth || 0,
        totalTeams: totalTeams || 0
      };
    } catch (error) {
      throw new Error('Kon metrics niet ophalen');
    }
  }
};

// Database helpers adapted for Supabase
export const dbHelpers = {
  // Quiz operations
  async createQuiz(quizData) {
    // Get current user
    const currentUser = authHelpers.getCurrentUser();
    if (!currentUser) {
      throw new Error('Je moet ingelogd zijn om een quiz aan te maken');
    }

    // Add user_id to quiz data
    const quizWithUser = {
      ...quizData,
      user_id: currentUser.id
    };

    const { data, error } = await supabase
      .from('quizzes')
      .insert([quizWithUser])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async getAllQuizzes() {
    // Get current user
    const currentUser = authHelpers.getCurrentUser();
    if (!currentUser) {
      throw new Error('Je moet ingelogd zijn om quizzen te bekijken');
    }

    // Admin can see all quizzes, regular users only their own
    let query = supabase.from('quizzes').select('*');

    if (currentUser.role !== 'admin') {
      query = query.eq('user_id', currentUser.id);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  },

  async getQuiz(id) {
    // Get current user
    const currentUser = authHelpers.getCurrentUser();
    if (!currentUser) {
      throw new Error('Je moet ingelogd zijn');
    }

    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);

    // Check if user has access to this quiz
    if (currentUser.role !== 'admin' && data.user_id !== currentUser.id) {
      throw new Error('Je hebt geen toegang tot deze quiz');
    }

    return data;
  },

  async deleteQuiz(quizId) {
    // Get current user
    const currentUser = authHelpers.getCurrentUser();
    if (!currentUser) {
      throw new Error('Je moet ingelogd zijn');
    }

    // Check if user owns this quiz (or is admin)
    const quiz = await this.getQuiz(quizId);
    if (currentUser.role !== 'admin' && quiz.user_id !== currentUser.id) {
      throw new Error('Je kunt alleen je eigen quizzen verwijderen');
    }

    const { error } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', quizId);

    if (error) throw new Error(error.message);
    return true;
  },

  // Team operations
  async createTeam(quizId, teamName) {
    // Get next team number
    const { count } = await supabase
      .from('teams')
      .select('*', { count: 'exact', head: true })
      .eq('quiz_id', quizId);

    const { data, error } = await supabase
      .from('teams')
      .insert([{
        quiz_id: quizId,
        name: teamName,
        team_number: (count || 0) + 1
      }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async getTeamsByQuiz(quizId) {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('quiz_id', quizId)
      .order('team_number');

    if (error) throw new Error(error.message);
    
    // Map snake_case database fields to camelCase for frontend consistency
    return data.map(team => ({
      id: team.id,
      quizId: team.quiz_id,
      name: team.name,
      teamNumber: team.team_number,
      createdAt: team.created_at
    }));
  },

  // Score operations
  async saveScore(quizId, teamId, round, points) {
    const { data, error } = await supabase
      .from('scores')
      .upsert({ quiz_id: quizId, team_id: teamId, round, points })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async getScoresByQuiz(quizId) {
    const { data, error } = await supabase
      .from('scores')
      .select('*')
      .eq('quiz_id', quizId)
      .order('team_id')
      .order('round');

    if (error) throw new Error(error.message);

    // Map snake_case database fields to camelCase for frontend consistency
    return data.map(score => ({
      id: score.id,
      quizId: score.quiz_id,
      teamId: score.team_id,
      round: score.round,
      points: score.points,
      createdAt: score.created_at
    }));
  },

  async calculateTotalScores(quizId) {
    // This would need to be implemented with Supabase queries
    // or computed on the client side
    const teams = await this.getTeamsByQuiz(quizId);
    const scores = await this.getScoresByQuiz(quizId);

    return teams.map(team => {
      const teamScores = scores.filter(score => score.teamId === team.id); // Use camelCase teamId
      const totalPoints = teamScores.reduce((sum, score) => sum + (score.points || 0), 0);

      return {
        ...team,
        totalPoints,
        scores: teamScores
      };
    }).sort((a, b) => b.totalPoints - a.totalPoints);
  },

  // Additional helper methods
  async createTeamsBulk(quizId, teams) {
    const teamsToInsert = teams.map((team, index) => ({
      quiz_id: quizId,
      name: team.name || team,
      team_number: index + 1
    }));

    const { data, error } = await supabase
      .from('teams')
      .insert(teamsToInsert)
      .select();

    if (error) throw new Error(error.message);
    return data;
  },

  async updateScore(quizId, teamId, round, newPoints) {
    return this.saveScore(quizId, teamId, round, newPoints);
  },

  async getDetailedQuizResults(quizId) {
    try {
      const quiz = await this.getQuiz(quizId);
      const teams = await this.getTeamsByQuiz(quizId);
      const scores = await this.getScoresByQuiz(quizId);

      const results = teams.map(team => {
        const teamResult = {
          id: team.id,
          teamNumber: team.teamNumber, // Use the mapped camelCase field
          name: team.name,
          roundScores: {},
          totalPoints: 0
        };

        // Initialize all rounds with 0
        for (let round = 1; round <= quiz.rounds; round++) {
          teamResult.roundScores[round] = 0;
        }

        // Fill in actual scores
        const teamScores = scores.filter(score => score.teamId === team.id); // Use camelCase teamId
        teamScores.forEach(score => {
          teamResult.roundScores[score.round] = score.points || 0;
          teamResult.totalPoints += score.points || 0;
        });

        return teamResult;
      });

      // Sort by total points (highest first)
      results.sort((a, b) => b.totalPoints - a.totalPoints);

      return {
        quiz,
        teams: results,
        totalRounds: quiz.rounds
      };
    } catch (error) {
      console.error('Error getting detailed quiz results:', error);
      throw new Error('Kon gedetailleerde resultaten niet ophalen');
    }
  },

  async isQuizCompleted(quizId) {
    try {
      const quiz = await this.getQuiz(quizId);
      const teams = await this.getTeamsByQuiz(quizId);
      const scores = await this.getScoresByQuiz(quizId);

      if (!quiz || teams.length === 0) {
        return false;
      }

      const expectedScores = teams.length * quiz.rounds;
      const actualScores = scores.length;

      return actualScores >= expectedScores;
    } catch (error) {
      console.error('Error checking if quiz completed:', error);
      return false;
    }
  }
};

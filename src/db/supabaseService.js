// Supabase database configuration for Netlify deployment
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database helpers adapted for Supabase
export const dbHelpers = {
  // Quiz operations
  async createQuiz(quizData) {
    const { data, error } = await supabase
      .from('quizzes')
      .insert([quizData])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async getAllQuizzes() {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  },

  async getQuiz(id) {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async deleteQuiz(quizId) {
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
    return data;
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
    return data;
  },

  async calculateTotalScores(quizId) {
    // This would need to be implemented with Supabase queries
    // or computed on the client side
    const teams = await this.getTeamsByQuiz(quizId);
    const scores = await this.getScoresByQuiz(quizId);

    return teams.map(team => {
      const teamScores = scores.filter(score => score.team_id === team.id);
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
          teamNumber: team.team_number,
          name: team.name,
          roundScores: {},
          totalPoints: 0
        };

        // Initialize all rounds with 0
        for (let round = 1; round <= quiz.rounds; round++) {
          teamResult.roundScores[round] = 0;
        }

        // Fill in actual scores
        const teamScores = scores.filter(score => score.team_id === team.id);
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

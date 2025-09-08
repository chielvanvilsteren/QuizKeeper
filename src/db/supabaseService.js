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
      .order('createdAt', { ascending: false });

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
      .eq('quizId', quizId);

    const { data, error } = await supabase
      .from('teams')
      .insert([{
        quizId,
        name: teamName,
        teamNumber: (count || 0) + 1
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
      .eq('quizId', quizId)
      .order('teamNumber');

    if (error) throw new Error(error.message);
    return data;
  },

  // Score operations
  async saveScore(quizId, teamId, round, points) {
    const { data, error } = await supabase
      .from('scores')
      .upsert({ quizId, teamId, round, points })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async getScoresByQuiz(quizId) {
    const { data, error } = await supabase
      .from('scores')
      .select('*')
      .eq('quizId', quizId)
      .order('teamId')
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
      const teamScores = scores.filter(score => score.teamId === team.id);
      const totalPoints = teamScores.reduce((sum, score) => sum + (score.points || 0), 0);

      return {
        ...team,
        totalPoints,
        scores: teamScores
      };
    }).sort((a, b) => b.totalPoints - a.totalPoints);
  }
};

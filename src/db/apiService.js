// API service for communicating with backend - supports both local and Render
const API_BASE_URL = process.env.REACT_APP_API_URL || (
  process.env.NODE_ENV === 'production'
    ? '/api'  // Relative URL for production (same domain)
    : 'http://localhost:10000/api'  // Localhost for development
);

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Quiz operations
  async createQuiz(quizData) {
    return this.request('/quizzes', {
      method: 'POST',
      body: quizData,
    });
  }

  async getQuiz(id) {
    return this.request(`/quizzes/${id}`);
  }

  async getAllQuizzes() {
    return this.request('/quizzes');
  }

  async deleteQuiz(quizId) {
    return this.request(`/quizzes/${quizId}`, {
      method: 'DELETE',
    });
  }

  // Team operations
  async createTeam(quizId, teamName) {
    return this.request('/teams', {
      method: 'POST',
      body: { quizId, name: teamName },
    });
  }

  async createTeamsBulk(quizId, teams) {
    return this.request('/teams/bulk', {
      method: 'POST',
      body: { quizId, teams },
    });
  }

  async getTeamsByQuiz(quizId) {
    return this.request(`/teams/quiz/${quizId}`);
  }

  // Score operations
  async saveScore(quizId, teamId, round, points) {
    return this.request('/scores', {
      method: 'POST',
      body: { quizId, teamId, round, points },
    });
  }

  async updateScore(quizId, teamId, round, newPoints) {
    // For SQLite backend, saveScore handles both insert and update
    return this.saveScore(quizId, teamId, round, newPoints);
  }

  async getScoresByQuiz(quizId) {
    return this.request(`/scores/quiz/${quizId}`);
  }

  async calculateTotalScores(quizId) {
    return this.request(`/scores/quiz/${quizId}/totals`);
  }

  // Additional helper methods that combine API calls
  async getDetailedQuizResults(quizId) {
    try {
      const quiz = await this.getQuiz(quizId);
      const teams = await this.getTeamsByQuiz(quizId);
      const scores = await this.getScoresByQuiz(quizId);

      // Create matrix of scores per team per round
      const results = teams.map(team => {
        const teamResult = {
          id: team.id,
          teamNumber: team.teamNumber,
          name: team.name,
          roundScores: {},
          totalPoints: 0
        };

        // Initialize all rounds with 0
        for (let round = 1; round <= quiz.rounds; round++) {
          teamResult.roundScores[round] = 0;
        }

        // Fill in actual scores
        const teamScores = scores.filter(score => score.teamId === team.id);
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
  }

  async isQuizCompleted(quizId) {
    try {
      const quiz = await this.getQuiz(quizId);
      const teams = await this.getTeamsByQuiz(quizId);
      const scores = await this.getScoresByQuiz(quizId);

      if (!quiz || teams.length === 0) {
        return false;
      }

      // Calculate expected total scores (teams * rounds)
      const expectedScores = teams.length * quiz.rounds;
      const actualScores = scores.length;

      return actualScores >= expectedScores;
    } catch (error) {
      console.error('Error checking if quiz completed:', error);
      return false;
    }
  }
}

// Create and export singleton instance
export const apiService = new ApiService();

// Export helper functions that match the existing database interface
export const dbHelpers = {
  createQuiz: (quizData) => apiService.createQuiz(quizData),
  getQuiz: (id) => apiService.getQuiz(id),
  getAllQuizzes: () => apiService.getAllQuizzes(),
  deleteQuiz: (quizId) => apiService.deleteQuiz(quizId),

  createTeam: (quizId, teamName) => apiService.createTeam(quizId, teamName),
  getTeamsByQuiz: (quizId) => apiService.getTeamsByQuiz(quizId),

  saveScore: (quizId, teamId, round, points) => apiService.saveScore(quizId, teamId, round, points),
  updateScore: (quizId, teamId, round, newPoints) => apiService.updateScore(quizId, teamId, round, newPoints),
  getScoresByQuiz: (quizId) => apiService.getScoresByQuiz(quizId),
  calculateTotalScores: (quizId) => apiService.calculateTotalScores(quizId),
  getDetailedQuizResults: (quizId) => apiService.getDetailedQuizResults(quizId),
  isQuizCompleted: (quizId) => apiService.isQuizCompleted(quizId),
};

export default apiService;

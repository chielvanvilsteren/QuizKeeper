// Database setup using Dexie for IndexedDB
import Dexie from 'dexie';

export class PubQuizDatabase extends Dexie {
  constructor() {
    super('PubQuizDatabase');

    // Define database schema
    this.version(1).stores({
      quizzes: '++id, name, date, location, rounds, createdAt',
      teams: '++id, quizId, name, teamNumber, createdAt',
      scores: '++id, quizId, teamId, round, points, createdAt'
    });

    // Add error handling for database opening
    this.open().catch(function (error) {
      console.error('Failed to open database:', error);
    });
  }
}

// Create database instance
export const db = new PubQuizDatabase();

// Database helper functions
export const dbHelpers = {
  // Quiz operations
  async createQuiz(quizData) {
    try {
      const quiz = {
        ...quizData,
        createdAt: new Date()
      };
      return await db.quizzes.add(quiz);
    } catch (error) {
      console.error('Error creating quiz:', error);
      throw new Error('Kon quiz niet aanmaken');
    }
  },

  async getQuiz(id) {
    try {
      return await db.quizzes.get(id);
    } catch (error) {
      console.error('Error getting quiz:', error);
      throw new Error('Kon quiz niet ophalen');
    }
  },

  async getAllQuizzes() {
    try {
      return await db.quizzes.orderBy('createdAt').reverse().toArray();
    } catch (error) {
      console.error('Error getting all quizzes:', error);
      throw new Error('Kon quizzes niet ophalen');
    }
  },

  // Team operations
  async createTeam(quizId, teamName) {
    try {
      // Get existing teams for this quiz to determine next team number
      const existingTeams = await db.teams.where('quizId').equals(quizId).toArray();
      const teamNumber = existingTeams.length + 1;

      const team = {
        quizId,
        name: teamName,
        teamNumber,
        createdAt: new Date()
      };
      return await db.teams.add(team);
    } catch (error) {
      console.error('Error creating team:', error);
      throw new Error('Kon team niet aanmaken');
    }
  },

  async getTeamsByQuiz(quizId) {
    try {
      return await db.teams.where('quizId').equals(quizId).sortBy('teamNumber');
    } catch (error) {
      console.error('Error getting teams:', error);
      throw new Error('Kon teams niet ophalen');
    }
  },

  // Score operations
  async saveScore(quizId, teamId, round, points) {
    try {
      console.log('Saving score:', { quizId, teamId, round, points });

      // Validate input parameters
      if (!quizId || !teamId || !round || points === undefined || points === null) {
        throw new Error('Ongeldige parameters voor score opslaan');
      }

      // Check if score already exists for this team and round
      const existingScore = await db.scores
        .where({ quizId: quizId, teamId: teamId, round: round })
        .first();

      if (existingScore) {
        // Update existing score
        console.log('Updating existing score:', existingScore.id);
        return await db.scores.update(existingScore.id, { points: parseInt(points) });
      } else {
        // Create new score
        const score = {
          quizId: parseInt(quizId),
          teamId: parseInt(teamId),
          round: parseInt(round),
          points: parseInt(points),
          createdAt: new Date()
        };
        console.log('Creating new score:', score);
        return await db.scores.add(score);
      }
    } catch (error) {
      console.error('Error saving score:', error);
      throw new Error(`Kon score niet opslaan: ${error.message}`);
    }
  },

  async getScoresByQuiz(quizId) {
    try {
      return await db.scores.where('quizId').equals(quizId).toArray();
    } catch (error) {
      console.error('Error getting scores:', error);
      throw new Error('Kon scores niet ophalen');
    }
  },

  // Update an existing score
  async updateScore(quizId, teamId, round, newPoints) {
    try {
      console.log('Updating score:', { quizId, teamId, round, newPoints });

      // Validate input parameters
      if (!quizId || !teamId || !round || newPoints === undefined || newPoints === null) {
        throw new Error('Ongeldige parameters voor score update');
      }

      // Find the existing score
      const existingScore = await db.scores
        .where({ quizId: parseInt(quizId), teamId: parseInt(teamId), round: parseInt(round) })
        .first();

      if (existingScore) {
        // Update existing score
        console.log('Updating existing score:', existingScore.id, 'with new points:', newPoints);
        return await db.scores.update(existingScore.id, { points: parseInt(newPoints) });
      } else {
        // If no existing score, create a new one
        console.log('No existing score found, creating new score');
        const score = {
          quizId: parseInt(quizId),
          teamId: parseInt(teamId),
          round: parseInt(round),
          points: parseInt(newPoints),
          createdAt: new Date()
        };
        return await db.scores.add(score);
      }
    } catch (error) {
      console.error('Error updating score:', error);
      throw new Error(`Kon score niet bijwerken: ${error.message}`);
    }
  },

  // Calculate total scores for all teams in a quiz
  async calculateTotalScores(quizId) {
    try {
      const teams = await dbHelpers.getTeamsByQuiz(quizId);
      const scores = await dbHelpers.getScoresByQuiz(quizId);

      return teams.map(team => {
        const teamScores = scores.filter(score => score.teamId === team.id);
        const totalPoints = teamScores.reduce((sum, score) => sum + (score.points || 0), 0);

        return {
          ...team,
          totalPoints,
          scores: teamScores
        };
      }).sort((a, b) => b.totalPoints - a.totalPoints); // Sort by highest score first
    } catch (error) {
      console.error('Error calculating total scores:', error);
      throw new Error('Kon totaalscores niet berekenen');
    }
  },

  // Delete quiz and all related data
  async deleteQuiz(quizId) {
    try {
      console.log('Deleting quiz and all related data for quiz:', quizId);

      // Delete all scores for this quiz
      await db.scores.where('quizId').equals(quizId).delete();
      console.log('Deleted scores for quiz:', quizId);

      // Delete all teams for this quiz
      await db.teams.where('quizId').equals(quizId).delete();
      console.log('Deleted teams for quiz:', quizId);

      // Delete the quiz itself
      await db.quizzes.delete(quizId);
      console.log('Deleted quiz:', quizId);

      return true;
    } catch (error) {
      console.error('Error deleting quiz:', error);
      throw new Error(`Kon quiz niet verwijderen: ${error.message}`);
    }
  },

  // Get detailed quiz results with scores per round per team
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
  },

  // Check if quiz is completely finished (all rounds completed)
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
};

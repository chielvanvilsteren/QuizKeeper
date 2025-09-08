// Zustand store for pub quiz state management
import { create } from 'zustand';
import { dbHelpers } from '../db/database.js';

export const useQuizStore = create((set, get) => ({
  // Current quiz state
  currentQuiz: null,
  teams: [],
  scores: [],
  currentRound: 1,
  currentTeamIndex: 0,
  isQuizStarted: false,
  showLeaderboard: false,
  showRoundCompleteModal: false,

  // Quiz actions
  setCurrentQuiz: (quiz) => set({ currentQuiz: quiz }),

  loadQuiz: async (quizId) => {
    try {
      const quiz = await dbHelpers.getQuiz(quizId);
      const teams = await dbHelpers.getTeamsByQuiz(quizId);
      const scores = await dbHelpers.getScoresByQuiz(quizId);

      set({
        currentQuiz: quiz,
        teams: Array.isArray(teams) ? teams : [],
        scores: Array.isArray(scores) ? scores : [],
        currentRound: 1,
        currentTeamIndex: 0,
        isQuizStarted: false
      });
    } catch (error) {
      console.error('Error loading quiz:', error);
      // Set safe defaults on error
      set({
        currentQuiz: null,
        teams: [],
        scores: [],
        currentRound: 1,
        currentTeamIndex: 0,
        isQuizStarted: false
      });
      throw error; // Re-throw to let calling component handle it
    }
  },

  // Team actions
  addTeam: async (teamName) => {
    const { currentQuiz, teams } = get();
    if (!currentQuiz) return;

    const teamId = await dbHelpers.createTeam(currentQuiz.id, teamName);
    const newTeam = {
      id: teamId,
      quizId: currentQuiz.id,
      name: teamName,
      teamNumber: teams.length + 1
    };

    set({ teams: [...teams, newTeam] });
  },

  loadTeams: async (quizId) => {
    try {
      const teams = await dbHelpers.getTeamsByQuiz(quizId);
      // Ensure teams is always an array, even if API returns something else
      set({ teams: Array.isArray(teams) ? teams : [] });
    } catch (error) {
      console.error('Error loading teams:', error);
      // Set empty array on error to prevent crashes
      set({ teams: [] });
    }
  },

  // Quiz flow actions
  startQuiz: () => set({
    isQuizStarted: true,
    currentRound: 1,
    currentTeamIndex: 0
  }),

  // Stop/exit quiz
  exitQuiz: () => set({
    isQuizStarted: false,
    currentRound: 1,
    currentTeamIndex: 0,
    showLeaderboard: false,
    showRoundCompleteModal: false
  }),

  // Continue existing quiz (for when quiz is already started)
  continueQuiz: () => set({ isQuizStarted: true }),

  // Score actions
  saveCurrentScore: async (points) => {
    const { currentQuiz, teams, currentRound, currentTeamIndex } = get();

    console.log('saveCurrentScore called with:', {
      points,
      currentQuiz: currentQuiz?.id,
      currentRound,
      currentTeamIndex,
      team: teams[currentTeamIndex]?.id
    });

    if (!currentQuiz) {
      throw new Error('Geen actieve quiz gevonden');
    }

    if (!teams[currentTeamIndex]) {
      throw new Error('Geen geldig team gevonden');
    }

    if (points === undefined || points === null || isNaN(points)) {
      throw new Error('Ongeldige punten waarde');
    }

    try {
      const team = teams[currentTeamIndex];
      console.log('Saving score for team:', team);

      await dbHelpers.saveScore(currentQuiz.id, team.id, currentRound, points);
      console.log('Score saved successfully');

      // Reload scores to update state
      const scores = await dbHelpers.getScoresByQuiz(currentQuiz.id);
      set({ scores });
      console.log('Scores reloaded:', scores.length);

    } catch (error) {
      console.error('Error in saveCurrentScore:', error);
      throw new Error(`Fout bij opslaan: ${error.message}`);
    }
  },

  nextTeam: () => {
    const { teams, currentTeamIndex, currentRound, currentQuiz } = get();
    const nextIndex = currentTeamIndex + 1;

    if (nextIndex >= teams.length) {
      // All teams completed for this round - show round complete modal
      set({ showRoundCompleteModal: true });

      // Move to next round after a delay or user confirmation
      const nextRound = currentRound + 1;
      if (nextRound <= currentQuiz.rounds) {
        // Will be handled by the modal confirmation
      } else {
        // Quiz completed
        set({ isQuizStarted: false });
      }
    } else {
      set({ currentTeamIndex: nextIndex });
    }
  },

  // Handle round complete modal
  setShowRoundCompleteModal: (show) => set({ showRoundCompleteModal: show }),

  proceedToNextRound: () => {
    const { currentRound, currentQuiz } = get();
    const nextRound = currentRound + 1;

    if (nextRound <= currentQuiz.rounds) {
      set({
        currentRound: nextRound,
        currentTeamIndex: 0,
        showRoundCompleteModal: false
      });
    } else {
      // Quiz completed
      set({
        isQuizStarted: false,
        showRoundCompleteModal: false
      });
    }
  },

  // Leaderboard actions
  toggleLeaderboard: () => set((state) => ({
    showLeaderboard: !state.showLeaderboard
  })),

  // Calculate current standings
  getCurrentStandings: async () => {
    const { currentQuiz } = get();
    if (!currentQuiz) return [];

    return await dbHelpers.calculateTotalScores(currentQuiz.id);
  },

  // Get scores for current round
  getCurrentRoundScores: async () => {
    const { currentQuiz, teams, currentRound } = get();
    if (!currentQuiz || !teams.length) return [];

    try {
      const allScores = await dbHelpers.getScoresByQuiz(currentQuiz.id);
      const currentRoundScores = allScores.filter(score => score.round === currentRound);

      // Create overview of teams with their scores for current round
      return teams.map(team => {
        const teamScore = currentRoundScores.find(score => score.teamId === team.id);
        return {
          ...team,
          hasScore: !!teamScore,
          points: teamScore ? teamScore.points : null,
          scoreId: teamScore ? teamScore.id : null
        };
      });
    } catch (error) {
      console.error('Error getting current round scores:', error);
      return [];
    }
  },

  // Check if team already has score for current round
  hasTeamScoreForRound: async (teamId) => {
    const { currentQuiz, currentRound } = get();
    if (!currentQuiz) return false;

    try {
      const scores = await dbHelpers.getScoresByQuiz(currentQuiz.id);
      return scores.some(score =>
        score.teamId === teamId &&
        score.round === currentRound
      );
    } catch (error) {
      console.error('Error checking team score:', error);
      return false;
    }
  },

  // Save score for specific team (non-sequential)
  saveScoreForTeam: async (teamId, points) => {
    const { currentQuiz, currentRound } = get();
    if (!currentQuiz) throw new Error('Geen actieve quiz');

    try {
      await dbHelpers.saveScore(currentQuiz.id, teamId, currentRound, points);

      // Reload scores to update state
      const scores = await dbHelpers.getScoresByQuiz(currentQuiz.id);
      set({ scores });
    } catch (error) {
      console.error('Error saving score for team:', error);
      throw error;
    }
  },

  // Reset quiz state
  resetQuiz: () => set({
    currentQuiz: null,
    teams: [],
    scores: [],
    currentRound: 1,
    currentTeamIndex: 0,
    isQuizStarted: false,
    showLeaderboard: false
  }),

  // Check if quiz has been started (has any scores)
  hasQuizStarted: async (quizId) => {
    try {
      const scores = await dbHelpers.getScoresByQuiz(quizId);
      return scores.length > 0;
    } catch (error) {
      console.error('Error checking if quiz started:', error);
      return false;
    }
  },

  // Get current progress for continuing quiz
  getCurrentProgress: async (quizId) => {
    try {
      const scores = await dbHelpers.getScoresByQuiz(quizId);
      const teams = await dbHelpers.getTeamsByQuiz(quizId);

      if (scores.length === 0) {
        return { round: 1, teamIndex: 0 };
      }

      // Find the highest round and determine next team
      const maxRound = Math.max(...scores.map(s => s.round));
      const scoresInMaxRound = scores.filter(s => s.round === maxRound);

      if (scoresInMaxRound.length === teams.length) {
        // Round complete, start next round
        return { round: maxRound + 1, teamIndex: 0 };
      } else {
        // Continue in current round
        return { round: maxRound, teamIndex: scoresInMaxRound.length };
      }
    } catch (error) {
      console.error('Error getting current progress:', error);
      return { round: 1, teamIndex: 0 };
    }
  },

  // Check if all teams have scores for current round and proceed to next round
  proceedToNextRoundWithCheck: async () => {
    const { currentQuiz, currentRound } = get();
    if (!currentQuiz) return { success: false, error: 'Geen actieve quiz' };

    try {
      const roundScores = await get().getCurrentRoundScores();
      const teamsWithoutScore = roundScores.filter(team => !team.hasScore);

      return {
        success: true,
        allTeamsHaveScores: teamsWithoutScore.length === 0,
        teamsWithoutScore,
        roundScores
      };
    } catch (error) {
      console.error('Error checking round scores:', error);
      return { success: false, error: error.message };
    }
  },

  // Assign 0 points to teams without scores and proceed to next round
  proceedToNextRoundWithZeroPoints: async () => {
    const { currentQuiz, currentRound } = get();
    if (!currentQuiz) throw new Error('Geen actieve quiz');

    try {
      const roundScores = await get().getCurrentRoundScores();
      const teamsWithoutScore = roundScores.filter(team => !team.hasScore);

      // Assign 0 points to teams without scores
      for (const team of teamsWithoutScore) {
        await dbHelpers.saveScore(currentQuiz.id, team.id, currentRound, 0);
      }

      // Reload scores
      const scores = await dbHelpers.getScoresByQuiz(currentQuiz.id);

      // Proceed to next round
      const nextRound = currentRound + 1;
      if (nextRound <= currentQuiz.rounds) {
        set({
          currentRound: nextRound,
          currentTeamIndex: 0,
          scores
        });
        return { success: true, isQuizComplete: false };
      } else {
        // Quiz is complete
        set({
          isQuizStarted: false,
          scores
        });
        return { success: true, isQuizComplete: true };
      }
    } catch (error) {
      console.error('Error proceeding to next round:', error);
      throw error;
    }
  },
}));

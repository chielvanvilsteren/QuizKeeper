// Quiz Start Page - Score input and quiz management
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FormField, Button, Card } from '../components/FormComponents';
import { Modal, ScoreTable, QuizCompletionModal, DetailedResultsTable, RoundManagementModal, NextRoundConfirmationModal, RoundEditTable, AlertModal, ConfirmModal } from '../components/Modal';
import { useQuizStore } from '../store/quizStore';
import { dbHelpers } from '../db/database';

export const QuizStartPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const {
    currentQuiz,
    teams,
    currentRound,
    isQuizStarted,
    showLeaderboard,
    loadQuiz,
    startQuiz,
    continueQuiz,
    exitQuiz,
    toggleLeaderboard,
    getCurrentStandings,
    getCurrentRoundScores,
    hasTeamScoreForRound,
    saveScoreForTeam,
    getCurrentProgress,
    proceedToNextRoundWithCheck,
    proceedToNextRoundWithZeroPoints
  } = useQuizStore();

  const [points, setPoints] = useState('');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [standings, setStandings] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [quizWasStarted, setQuizWasStarted] = useState(false);
  const [showQuizCompleteModal, setShowQuizCompleteModal] = useState(false);
  const [showDetailedResults, setShowDetailedResults] = useState(false);
  const [showRoundManagement, setShowRoundManagement] = useState(false);
  const [showRoundCompleteModal, setShowRoundCompleteModal] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  const [roundScores, setRoundScores] = useState([]);
  const [quickTeamNumber, setQuickTeamNumber] = useState('');
  const [quickPoints, setQuickPoints] = useState('');
  const [quickSubmitting, setQuickSubmitting] = useState(false);
  const [showNextRoundModal, setShowNextRoundModal] = useState(false);
  const [nextRoundData, setNextRoundData] = useState(null);
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  const [showFinalStandings, setShowFinalStandings] = useState(false);
  const [showCompletionConfirmation, setShowCompletionConfirmation] = useState(false);
  const [showRoundEditModal, setShowRoundEditModal] = useState(false);
  const [selectedRoundForEdit, setSelectedRoundForEdit] = useState(1);

  useEffect(() => {
    initializeQuiz();
  }, [quizId]);

  useEffect(() => {
    if (showLeaderboard) {
      loadStandings();
    }
  }, [showLeaderboard, currentRound]);

  const initializeQuiz = async () => {
    try {
      await loadQuiz(parseInt(quizId));

      // Check if quiz was already started and set progress accordingly
      const scores = await dbHelpers.getScoresByQuiz(parseInt(quizId));
      const wasStarted = scores.length > 0;
      setQuizWasStarted(wasStarted);

      if (wasStarted) {
        const progress = await getCurrentProgress(parseInt(quizId));
        const quiz = await dbHelpers.getQuiz(parseInt(quizId));

        // Check if quiz is completed (all rounds finished)
        const isQuizCompleted = progress.round > quiz.rounds;

        // Also check if all teams have scores for all rounds
        const teams = await dbHelpers.getTeamsByQuiz(parseInt(quizId));
        const allScores = await dbHelpers.getScoresByQuiz(parseInt(quizId));

        // Count scores per round
        const scoresPerRound = {};
        allScores.forEach(score => {
          if (!scoresPerRound[score.round]) {
            scoresPerRound[score.round] = 0;
          }
          scoresPerRound[score.round]++;
        });

        // Check if all rounds have scores for all teams
        let allRoundsComplete = true;
        for (let round = 1; round <= quiz.rounds; round++) {
          if ((scoresPerRound[round] || 0) < teams.length) {
            allRoundsComplete = false;
            break;
          }
        }

        if (isQuizCompleted || allRoundsComplete) {
          // Quiz is completed, show results immediately
          const results = await dbHelpers.getDetailedQuizResults(parseInt(quizId));
          setQuizResults(results);
          setShowQuizCompleteModal(true);
          setIsQuizFinished(true);
        } else {
          // Quiz is in progress, continue where left off
          useQuizStore.setState({
            currentRound: progress.round,
            currentTeamIndex: progress.teamIndex,
            isQuizStarted: true
          });
        }
      }
    } catch (error) {
      console.error('Error loading quiz:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const loadStandings = async () => {
    try {
      const currentStandings = await getCurrentStandings();
      setStandings(currentStandings);
    } catch (error) {
      console.error('Error loading standings:', error);
    }
  };

  const loadRoundScores = async () => {
    try {
      const scores = await getCurrentRoundScores();
      setRoundScores(scores);
    } catch (error) {
      console.error('Error loading round scores:', error);
    }
  };

  useEffect(() => {
    if (isQuizStarted && currentQuiz) {
      loadRoundScores();
    }
  }, [isQuizStarted, currentQuiz, currentRound]);

  const handleStartQuiz = () => {
    startQuiz();
    setPoints('');
  };

  const handleContinueQuiz = () => {
    continueQuiz();
    setPoints('');
  };

  const handleExitQuiz = () => {
    if (window.confirm('Weet je zeker dat je de quiz wilt verlaten? Je voortgang wordt bewaard.')) {
      exitQuiz();
      navigate('/');
    }
  };

  const handleSubmitScore = async (e) => {
    e.preventDefault();

    if (!selectedTeam) {
      alert('Selecteer eerst een team');
      return;
    }

    const pointsValue = parseInt(points);
    if (isNaN(pointsValue) || pointsValue < 0) {
      alert('Voer een geldig aantal punten in (0 of hoger)');
      return;
    }

    setSubmitting(true);
    try {
      // Check if team already has score for this round
      const hasScore = await hasTeamScoreForRound(selectedTeam.id);

      if (hasScore) {
        const confirmed = window.confirm(
          `Team ${selectedTeam.teamNumber} (${selectedTeam.name}) heeft al een score voor ronde ${currentRound}.\n\nWil je de bestaande score overschrijven?`
        );

        if (!confirmed) {
          setSubmitting(false);
          return;
        }
      }

      await saveScoreForTeam(selectedTeam.id, pointsValue);

      // Reset form
      setSelectedTeam(null);
      setPoints('');

      // Reload round scores
      await loadRoundScores();

      // Check if all teams have scores for this round
      const updatedScores = await getCurrentRoundScores();
      const allTeamsHaveScores = updatedScores.every(team => team.hasScore);

      if (allTeamsHaveScores) {
        if (currentRound === currentQuiz.rounds) {
          // Quiz is complete
          const results = await dbHelpers.getDetailedQuizResults(currentQuiz.id);
          setQuizResults(results);
          setShowQuizCompleteModal(true);
        } else {
          // Round is complete, ask to proceed to next round
          const confirmed = window.confirm(
            `Ronde ${currentRound} is voltooid! Alle teams hebben punten.\n\nWil je doorgaan naar ronde ${currentRound + 1}?`
          );

          if (confirmed) {
            useQuizStore.setState({ currentRound: currentRound + 1 });
          }
        }
      }

    } catch (error) {
      console.error('Error submitting score:', error);
      alert(`Fout bij opslaan van score: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickScore = async (e) => {
    e.preventDefault();

    const teamNumberValue = parseInt(quickTeamNumber);
    const pointsValue = parseInt(quickPoints);

    if (isNaN(teamNumberValue) || teamNumberValue < 1 || teamNumberValue > teams.length) {
      alert('Voer een geldig team nummer in');
      return;
    }

    if (isNaN(pointsValue) || pointsValue < 0) {
      alert('Voer een geldig aantal punten in (0 of hoger)');
      return;
    }

    setQuickSubmitting(true);
    try {
      // Find the team by number
      const team = teams.find(t => t.teamNumber === teamNumberValue);

      if (!team) {
        alert('Team niet gevonden');
        return;
      }

      // Check if team already has score for this round
      const hasScore = await hasTeamScoreForRound(team.id);

      if (hasScore) {
        const confirmed = window.confirm(
          `Team ${team.teamNumber} (${team.name}) heeft al een score voor ronde ${currentRound}.\n\nWil je de bestaande score overschrijven?`
        );

        if (!confirmed) {
          setQuickSubmitting(false);
          return;
        }
      }

      await saveScoreForTeam(team.id, pointsValue);

      alert('Score succesvol opgeslagen');

      // Reset quick score form
      setQuickTeamNumber('');
      setQuickPoints('');

      // Reload round scores
      await loadRoundScores();
    } catch (error) {
      console.error('Error submitting quick score:', error);
      alert(`Fout bij opslaan van score: ${error.message}`);
    } finally {
      setQuickSubmitting(false);
    }
  };

  const handleRoundManagement = () => {
    setShowRoundManagement(true);
  };

  const handleScoreUpdate = (team) => {
    setSelectedTeam(team);
    setPoints(team.hasScore ? team.points.toString() : '');
    setShowRoundManagement(false);
  };

  const handleShowDetailedResults = () => {
    setShowQuizCompleteModal(false);
    setShowDetailedResults(true);
  };

  const handleCloseQuizComplete = () => {
    setShowQuizCompleteModal(false);
    navigate('/');
  };

  const handleCloseDetailedResults = () => {
    setShowDetailedResults(false);
    navigate('/');
  };

  const handleRoundComplete = () => {
    setShowRoundCompleteModal(false);
    useQuizStore.setState({ currentRound: currentRound + 1 });
  };

  // New handlers for "Next Round" functionality
  const handleNextRound = async () => {
    try {
      const result = await proceedToNextRoundWithCheck();

      if (!result.success) {
        alert(`Fout: ${result.error}`);
        return;
      }

      setNextRoundData(result);
      setShowNextRoundModal(true);
    } catch (error) {
      console.error('Error checking round:', error);
      alert('Er is een fout opgetreden bij het controleren van de ronde');
    }
  };

  const handleConfirmNextRound = async () => {
    try {
      const result = await proceedToNextRoundWithZeroPoints();

      if (result.success) {
        setShowNextRoundModal(false);
        setNextRoundData(null);

        if (result.isQuizComplete) {
          // Quiz is complete, show completion modal
          const results = await dbHelpers.getDetailedQuizResults(currentQuiz.id);
          setQuizResults(results);
          setShowQuizCompleteModal(true);

          // Update the quiz state to reflect completion
          useQuizStore.setState({
            isQuizStarted: false,
            currentRound: currentQuiz.rounds + 1 // Set to beyond last round
          });
        } else {
          // Moved to next round, reload scores
          await loadRoundScores();
        }
      }
    } catch (error) {
      console.error('Error proceeding to next round:', error);
      alert('Er is een fout opgetreden bij het doorgaan naar de volgende ronde');
    }
  };

  const handleCancelNextRound = () => {
    setShowNextRoundModal(false);
    setNextRoundData(null);
  };

  // New handlers for final standings and completion confirmation
  const handleShowFinalStandings = async () => {
    try {
      await loadStandings();
      setShowFinalStandings(true);
    } catch (error) {
      console.error('Error loading final standings:', error);
      alert('Fout bij laden van de eindstand');
    }
  };

  const handleConfirmQuizCompletion = async () => {
    try {
      const results = await dbHelpers.getDetailedQuizResults(currentQuiz.id);
      setQuizResults(results);
      setShowCompletionConfirmation(false);
      setShowQuizCompleteModal(true);
      setIsQuizFinished(true);

      // Update quiz state to completed
      useQuizStore.setState({
        isQuizStarted: false,
        currentRound: currentQuiz.rounds + 1
      });
    } catch (error) {
      console.error('Error completing quiz:', error);
      alert('Fout bij afronden van de quiz');
    }
  };

  const handleEditRound = (roundNumber) => {
    setSelectedRoundForEdit(roundNumber);
    setShowRoundEditModal(true);
  };

  const handleRoundEditScoreUpdate = async (teamId, newScore, roundNumber) => {
    try {
      await dbHelpers.updateScore(currentQuiz.id, teamId, roundNumber, newScore);

      // Reload round scores if editing current round
      if (roundNumber === currentRound) {
        await loadRoundScores();
      }

      // Reload standings
      await loadStandings();

      alert('Score succesvol bijgewerkt');
    } catch (error) {
      console.error('Error updating score:', error);
      alert('Fout bij bijwerken van score');
    }
  };

  const isQuizComplete = currentRound > currentQuiz?.rounds || isQuizFinished;

  // Show results when quiz is finished
  if (isQuizFinished && showQuizCompleteModal) {
    return (
      <div className="min-h-screen bg-gray-50">
        <QuizCompletionModal
          isOpen={true}
          onClose={handleCloseQuizComplete}
          onShowDetailed={handleShowDetailedResults}
          results={quizResults}
        />


        {/* Leaderboard Modal */}
        <Modal
          isOpen={showLeaderboard}
          onClose={toggleLeaderboard}
          title="📊 Eindstand"
          size="large"
        >
          <ScoreTable teams={standings} currentRound={currentRound} />

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-4">
              Eindstand van de pubquiz - Alle {currentQuiz.rounds} rondes voltooid
            </p>
            <Button onClick={toggleLeaderboard} variant="primary">
              Sluiten
            </Button>
          </div>
        </Modal>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Quiz laden...</p>
        </div>
      </div>
    );
  }

  if (!currentQuiz || teams.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Quiz niet gevonden of geen teams
          </h2>
          <p className="text-gray-600 mb-4">
            Controleer of de quiz bestaat en teams heeft
          </p>
          <Button onClick={() => navigate('/')} variant="primary">
            Terug naar Home
          </Button>
        </Card>
      </div>
    );
  }

  if (isQuizComplete) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="text-center">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                🎉 Quiz Voltooid!
              </h2>
              <p className="text-gray-600">
                Alle {currentQuiz.rounds} rondes zijn afgerond
              </p>
            </div>

            <div className="space-y-4">
              <Button
                onClick={async () => {
                  await loadStandings();
                  toggleLeaderboard();
                }}
                variant="primary"
                className="w-full"
              >
                📊 Eindstand Bekijken
              </Button>
              <Button
                onClick={() => navigate('/')}
                variant="secondary"
                className="w-full"
              >
                Terug naar Home
              </Button>
            </div>
          </Card>
        </div>

        {/* Leaderboard Modal for Quiz Complete */}
        <Modal
          isOpen={showLeaderboard}
          onClose={toggleLeaderboard}
          title="📊 Eindstand"
          size="large"
        >
          <ScoreTable teams={standings} currentRound={currentRound} />

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-4">
              Eindstand van de pubquiz - Alle {currentQuiz.rounds} rondes voltooid
            </p>
            <Button onClick={toggleLeaderboard} variant="primary">
              Sluiten
            </Button>
          </div>
        </Modal>
      </div>
    );
  }

  if (!isQuizStarted) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {currentQuiz.name}
            </h1>

            {quizWasStarted && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                  ⏸️ Quiz Gepauzeerd
                </h3>
                <p className="text-yellow-700">
                  Deze quiz was al gestart. Je kunt verdergaan waar je gebleven was.
                </p>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Quiz Overzicht</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-blue-700"><strong>Locatie:</strong> {currentQuiz.location}</p>
                  <p className="text-blue-700"><strong>Rondes:</strong> {currentQuiz.rounds}</p>
                </div>
                <div>
                  <p className="text-blue-700"><strong>Teams:</strong> {teams.length}</p>
                  <p className="text-blue-700"><strong>Datum:</strong> {new Date(currentQuiz.date).toLocaleDateString('nl-NL')}</p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-lg font-medium text-gray-900 mb-3">Deelnemende Teams:</h4>
              <div className="grid gap-2 max-h-60 overflow-y-auto">
                {teams.map((team) => (
                  <div key={team.id} className="flex items-center justify-center p-2 bg-gray-50 rounded">
                    <span className="font-medium">Team {team.teamNumber}: {team.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={quizWasStarted ? handleContinueQuiz : handleStartQuiz}
                variant="success"
                className="text-xl px-8 py-4 w-full"
              >
                {quizWasStarted ? "📋 Ga verder met Quiz" : "🚀 Start Pubquiz!"}
              </Button>

              {quizWasStarted && (
                <Button
                  onClick={() => navigate('/')}
                  variant="secondary"
                  className="w-full"
                >
                  Terug naar Home
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Round Header with Controls */}
        <div className="bg-blue-600 text-white rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold">
                Ronde {currentRound} van {currentQuiz.rounds}
              </h2>
              <p className="text-blue-100 mt-1">
                {currentQuiz.name}
              </p>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={handleRoundManagement}
                variant="secondary"
                className="bg-green-600 hover:bg-green-700 focus:ring-green-500 text-sm"
              >
                📝 Beheer Ronde
              </Button>
              <Button
                onClick={handleExitQuiz}
                variant="secondary"
                className="bg-red-600 hover:bg-red-700 focus:ring-red-500 text-sm"
              >
                🚪 Verlaten
              </Button>
            </div>
          </div>
        </div>

        {/* Team Selection and Score Input */}
        <Card>
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Score Invoeren - Ronde {currentRound}
            </h3>

            {/* Quick Score Entry */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h4 className="text-md font-medium text-gray-900 mb-3">⚡ Snelle Score Invoer</h4>
              <form onSubmit={handleQuickScore} className="flex gap-3">
                <div className="flex-1">
                  <input
                    type="number"
                    value={quickTeamNumber}
                    onChange={(e) => setQuickTeamNumber(e.target.value)}
                    placeholder="Team #"
                    min={1}
                    max={teams.length}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="number"
                    value={quickPoints}
                    onChange={(e) => setQuickPoints(e.target.value)}
                    placeholder="Punten"
                    min={0}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <Button
                  type="submit"
                  variant="success"
                  disabled={quickSubmitting}
                  className="px-6"
                >
                  {quickSubmitting ? '💾' : '⚡'}
                </Button>
              </form>
              <p className="text-xs text-green-700 mt-2">
                Voer team nummer en punten in voor directe opslag
              </p>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">OF</span>
              </div>
            </div>

            {selectedTeam ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold mr-4">
                    {selectedTeam.teamNumber}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-medium text-gray-900">{selectedTeam.name}</h4>
                    <p className="text-sm text-gray-600">Team {selectedTeam.teamNumber}</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedTeam(null);
                      setPoints('');
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selecteer Team
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {teams.map((team) => {
                    const teamScore = roundScores.find(rs => rs.id === team.id);
                    const hasScore = teamScore?.hasScore;

                    return (
                      <button
                        key={team.id}
                        onClick={() => setSelectedTeam(team)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          hasScore 
                            ? 'border-green-300 bg-green-50 hover:bg-green-100' 
                            : 'border-gray-300 bg-white hover:bg-gray-50'
                        } hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      >
                        <div className="flex items-center space-x-2">
                          <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                            {team.teamNumber}
                          </div>
                          <div className="flex-1 text-left">
                            <p className="text-sm font-medium text-gray-900 truncate">{team.name}</p>
                            {hasScore && (
                              <p className="text-xs text-green-600">✅ {teamScore.points} pts</p>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {selectedTeam && (
            <form onSubmit={handleSubmitScore} className="space-y-6">
              <FormField
                label="Aantal Punten"
                type="number"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                placeholder="0"
                min={0}
                required
              />

              <Button
                type="submit"
                variant="primary"
                disabled={submitting}
                className="w-full text-lg py-3"
              >
                {submitting ? 'Opslaan...' : '💾 Score Opslaan'}
              </Button>
            </form>
          )}

          {/* Progress Summary */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Voortgang Ronde {currentRound}</span>
              <span className="text-sm font-medium text-gray-900">
                {roundScores.filter(t => t.hasScore).length} / {teams.length} teams
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${teams.length > 0 ? (roundScores.filter(t => t.hasScore).length / teams.length) * 100 : 0}%`
                }}
              />
            </div>

            {/* Round Edit Buttons */}
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Ronde Beheer</h4>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {Array.from({ length: currentQuiz.rounds }, (_, i) => i + 1).map((roundNum) => (
                  <Button
                    key={roundNum}
                    onClick={() => handleEditRound(roundNum)}
                    variant={roundNum === currentRound ? "primary" : "secondary"}
                    className={`text-sm py-2 ${
                      roundNum <= currentRound ? 'opacity-100' : 'opacity-50'
                    }`}
                    disabled={roundNum > currentRound}
                  >
                    📝 Ronde {roundNum}
                  </Button>
                ))}
              </div>
            </div>

            {/* Current Standings Button */}
            <div className="mb-4">
              <Button
                onClick={handleShowFinalStandings}
                variant="secondary"
                className="w-full bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white"
              >
                📊 Huidige Eindstand Bekijken
              </Button>
            </div>

            {/* Next Round Button */}
            {currentRound < currentQuiz?.rounds ? (
              <div className="mt-4">
                <Button
                  onClick={handleNextRound}
                  variant="primary"
                  className="w-full bg-orange-600 hover:bg-orange-700 focus:ring-orange-500"
                >
                  🔄 Ga naar Ronde {currentRound + 1}
                </Button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Controleer welke teams nog geen score hebben
                </p>
              </div>
            ) : (
              <div className="mt-4">
                <Button
                  onClick={handleNextRound}
                  variant="primary"
                  className="w-full bg-green-600 hover:bg-green-700 focus:ring-green-500"
                >
                  🏁 Rond pubquiz af en bekijk uitslag
                </Button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Controleer welke teams nog geen score hebben
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Round Management Modal */}
      <RoundManagementModal
        isOpen={showRoundManagement}
        onClose={() => setShowRoundManagement(false)}
        currentRound={currentRound}
        roundScores={roundScores}
        onScoreUpdate={handleScoreUpdate}
      />

      {/* Quiz Completion Modal */}
      <QuizCompletionModal
        isOpen={showQuizCompleteModal}
        onClose={handleCloseQuizComplete}
        onShowDetailed={handleShowDetailedResults}
        results={quizResults}
      />

      {/* Detailed Results Modal */}
      <Modal
        isOpen={showDetailedResults}
        onClose={handleCloseDetailedResults}
        title="📊 Gedetailleerde Resultaten"
        size="xl"
      >
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {quizResults?.quiz?.name} - Alle Resultaten
          </h3>
          <p className="text-gray-600">
            Punten per ronde voor alle teams
          </p>
        </div>

        <DetailedResultsTable results={quizResults} />

        <div className="mt-6 text-center">
          <Button onClick={handleCloseDetailedResults} variant="primary">
            Sluiten
          </Button>
        </div>
      </Modal>

      {/* Round Complete Modal */}
      <Modal
        isOpen={showRoundCompleteModal}
        onClose={() => {}} // Prevent closing by clicking outside
        title={`🎉 Ronde ${currentRound} Voltooid!`}
        size="medium"
      >
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Alle teams hebben punten voor ronde {currentRound}!
          </h3>

          {currentRound < currentQuiz?.rounds ? (
            <>
              <p className="text-gray-600 mb-6">
                Klaar om door te gaan naar ronde {currentRound + 1}?
              </p>

              <div className="space-y-3">
                <Button
                  onClick={() => {
                    loadStandings();
                    toggleLeaderboard();
                    setShowRoundCompleteModal(false);
                  }}
                  variant="secondary"
                  className="w-full"
                >
                  📊 Eerst Tussenstand Bekijken
                </Button>

                <Button
                  onClick={handleRoundComplete}
                  variant="primary"
                  className="w-full"
                >
                  ➡️ Ga naar Ronde {currentRound + 1}
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-gray-600 mb-6">
                🎊 Gefeliciteerd! Alle rondes zijn voltooid!
              </p>

              <div className="space-y-3">
                <Button
                  onClick={() => {
                    setShowRoundCompleteModal(false);
                    loadStandings();
                    toggleLeaderboard();
                  }}
                  variant="primary"
                  className="w-full"
                >
                  🏆 Bekijk Eindstand
                </Button>

                <Button
                  onClick={() => {
                    setShowRoundCompleteModal(false);
                    handleRoundComplete();
                  }}
                  variant="secondary"
                  className="w-full"
                >
                  Quiz Afsluiten
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Leaderboard Modal */}
      <Modal
        isOpen={showLeaderboard}
        onClose={toggleLeaderboard}
        title="📊 Tussenstand"
        size="large"
      >
        <ScoreTable teams={standings} currentRound={currentRound} />

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-4">
            Stand na ronde {currentRound - 1} van {currentQuiz.rounds}
          </p>
          <Button onClick={toggleLeaderboard} variant="primary">
            Sluiten
          </Button>
        </div>
      </Modal>

      {/* Next Round Confirmation Modal */}
      <NextRoundConfirmationModal
        isOpen={showNextRoundModal}
        onClose={handleCancelNextRound}
        currentRound={currentRound}
        nextRound={currentRound + 1}
        roundScores={nextRoundData?.roundScores || []}
        onConfirm={handleConfirmNextRound}
        onCancel={handleCancelNextRound}
        isLastRound={currentRound >= currentQuiz?.rounds}
      />

      {/* Final Standings Modal */}
      <Modal
        isOpen={showFinalStandings}
        onClose={() => setShowFinalStandings(false)}
        title="📊 Huidige Eindstand"
        size="large"
      >
        <div className="mb-4">
          <p className="text-gray-600">
            Huidige stand van de quiz (na {Math.max(1, currentRound - 1)} van {currentQuiz.rounds} rondes)
          </p>
        </div>

        <ScoreTable teams={standings} currentRound={currentRound} />

        <div className="mt-6 text-center space-y-3">
          <p className="text-sm text-gray-500">
            Deze stand kan nog veranderen als er scores worden aangepast
          </p>
          <Button onClick={() => setShowFinalStandings(false)} variant="primary">
            Sluiten
          </Button>
        </div>
      </Modal>

      {/* Round Edit Modal */}
      <Modal
        isOpen={showRoundEditModal}
        onClose={() => setShowRoundEditModal(false)}
        title={`📝 Ronde ${selectedRoundForEdit} Bewerken`}
        size="large"
      >
        <RoundEditTable
          quizId={currentQuiz?.id}
          roundNumber={selectedRoundForEdit}
          teams={teams}
          onScoreUpdate={handleRoundEditScoreUpdate}
          onClose={() => setShowRoundEditModal(false)}
        />
      </Modal>

      {/* Quiz Completion Confirmation Modal */}
      <Modal
        isOpen={showCompletionConfirmation}
        onClose={() => setShowCompletionConfirmation(false)}
        title="🏁 Quiz Afronden?"
        size="medium"
      >
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>

          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Weet je zeker dat je de quiz wilt afronden?
          </h3>

          <p className="text-gray-600 mb-6">
            Dit zal de quiz beëindigen en de eindresultaten tonen. Deze actie kan niet ongedaan worden gemaakt.
          </p>

          <div className="space-y-3">
            <Button
              onClick={() => setShowCompletionConfirmation(false)}
              variant="secondary"
              className="w-full"
            >
              ❌ Annuleren
            </Button>

            <Button
              onClick={handleConfirmQuizCompletion}
              variant="primary"
              className="w-full bg-green-600 hover:bg-green-700 focus:ring-green-500"
            >
              ✅ Ja, Quiz Afronden
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

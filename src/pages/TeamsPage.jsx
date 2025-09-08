// Teams Page - Manage teams for a quiz
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FormField, Button, Card } from '../components/FormComponents';
import { ExcelUpload } from '../components/ExcelUpload';
import { useQuizStore } from '../store/quizStore';
import { dbHelpers } from '../db/database';

export const TeamsPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { currentQuiz, teams, setCurrentQuiz, addTeam, loadTeams } = useQuizStore();

  const [newTeamName, setNewTeamName] = useState('');
  const [loading, setLoading] = useState(true);
  const [addingTeam, setAddingTeam] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [importingTeams, setImportingTeams] = useState(false);

  useEffect(() => {
    loadQuizData();
  }, [quizId]);

  const loadQuizData = async () => {
    try {
      // Load quiz data if not already loaded
      if (!currentQuiz || currentQuiz.id !== parseInt(quizId)) {
        const quiz = await dbHelpers.getQuiz(parseInt(quizId));
        if (!quiz) {
          navigate('/');
          return;
        }
        setCurrentQuiz(quiz);
      }

      // Load teams
      await loadTeams(parseInt(quizId));

      // Check if quiz has been started
      const scores = await dbHelpers.getScoresByQuiz(parseInt(quizId));
      setQuizStarted(scores.length > 0);
    } catch (error) {
      console.error('Error loading quiz data:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeam = async (e) => {
    e.preventDefault();

    if (!newTeamName.trim()) return;

    setAddingTeam(true);
    try {
      await addTeam(newTeamName.trim());
      setNewTeamName('');
    } catch (error) {
      console.error('Error adding team:', error);
      alert('Er ging iets mis bij het toevoegen van het team');
    } finally {
      setAddingTeam(false);
    }
  };

  const handleImportTeams = async (teamNames) => {
    setImportingTeams(true);
    try {
      let successCount = 0;
      let errorCount = 0;

      for (const teamName of teamNames) {
        try {
          await addTeam(teamName);
          successCount++;
        } catch (error) {
          console.error(`Error adding team "${teamName}":`, error);
          errorCount++;
        }
      }

      if (errorCount === 0) {
        alert(`✅ Alle ${successCount} teams zijn succesvol geïmporteerd!`);
      } else {
        alert(`⚠️ ${successCount} teams geïmporteerd, ${errorCount} fouten opgetreden.`);
      }
    } catch (error) {
      console.error('Error importing teams:', error);
      alert('Er ging iets mis bij het importeren van teams');
    } finally {
      setImportingTeams(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Quiz gegevens laden...</p>
        </div>
      </div>
    );
  }

  if (!currentQuiz) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quiz niet gevonden</h2>
          <Link to="/">
            <Button variant="primary">Terug naar Home</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Quiz Info Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {currentQuiz.name}
                </h1>
                {quizStarted && (
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                    Quiz Actief
                  </span>
                )}
              </div>
              <div className="space-y-1 text-gray-600">
                <p>📅 {formatDate(currentQuiz.date)}</p>
                <p>📍 {currentQuiz.location}</p>
                <p>🎯 {currentQuiz.rounds} rondes</p>
                <p>👥 {teams.length} teams</p>
              </div>
            </div>

            {teams.length > 0 && (
              <Link to={`/quiz/${currentQuiz.id}/start`}>
                <Button
                  variant={quizStarted ? "secondary" : "success"}
                  className="text-lg px-6 py-3"
                >
                  {quizStarted ? "📋 Ga verder" : "🚀 Start Quiz"}
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Add Team Form */}
          <Card title="Teams Toevoegen">
            {quizStarted && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-700">
                  ⚠️ Let op: Deze quiz is al gestart. Nieuwe teams zullen beginnen met 0 punten.
                </p>
              </div>
            )}

            {/* Manual Team Entry */}
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-900 mb-3">Handmatig Team Toevoegen</h4>
              <form onSubmit={handleAddTeam} className="space-y-4">
                <FormField
                  label="Team Naam"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="Bijv. De Slimmeriken"
                  required
                />

                <Button
                  type="submit"
                  variant="primary"
                  disabled={addingTeam || !newTeamName.trim() || importingTeams}
                  className="w-full"
                >
                  {addingTeam ? 'Toevoegen...' : '➕ Team Toevoegen'}
                </Button>
              </form>
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

            {/* Excel Import */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">Excel Import</h4>
              <ExcelUpload
                onTeamsImported={handleImportTeams}
                disabled={importingTeams}
              />

              {importingTeams && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-sm text-blue-700 font-medium">Teams importeren...</span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-700">
                <strong>Info:</strong> Teams krijgen automatisch een nummer toegewezen
                in de volgorde waarin ze worden toegevoegd.
              </p>
            </div>
          </Card>

          {/* Teams List */}
          <Card title={`Teams (${teams.length})`}>
            {teams.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nog geen teams
                </h3>
                <p className="text-gray-500">
                  Voeg teams toe om de quiz te kunnen starten
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {teams.map((team) => (
                  <div
                    key={team.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {team.teamNumber}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{team.name}</p>
                        <p className="text-sm text-gray-500">Team {team.teamNumber}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {teams.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <Link to={`/quiz/${currentQuiz.id}/start`}>
                  <Button
                    variant={quizStarted ? "secondary" : "success"}
                    className="w-full"
                  >
                    {quizStarted
                      ? `📋 Ga verder met ${teams.length} teams`
                      : `🚀 Start Quiz met ${teams.length} teams`
                    }
                  </Button>
                </Link>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

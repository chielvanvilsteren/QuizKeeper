// Modern Teams Page for QuizKeeper
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FormField, Button, Card, Badge, LoadingSpinner } from '../components/FormComponents';
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
  }, [quizId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadQuizData = async () => {
    try {
      if (!currentQuiz || currentQuiz.id !== parseInt(quizId)) {
        const quiz = await dbHelpers.getQuiz(parseInt(quizId));
        if (!quiz) {
          navigate('/');
          return;
        }
        setCurrentQuiz(quiz);
      }

      await loadTeams(parseInt(quizId));
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
      alert('Fout bij toevoegen van team: ' + error.message);
    } finally {
      setAddingTeam(false);
    }
  };

  const handleExcelUpload = async (teamsData) => {
    setImportingTeams(true);
    try {
      // Create teams in bulk
      await dbHelpers.createTeamsBulk(parseInt(quizId), teamsData);
      // Reload teams
      await loadTeams(parseInt(quizId));
      alert(`${teamsData.length} teams succesvol geïmporteerd!`);
    } catch (error) {
      console.error('Error importing teams:', error);
      alert('Fout bij importeren: ' + error.message);
    } finally {
      setImportingTeams(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-neutral">Quiz laden...</p>
        </div>
      </div>
    );
  }

  if (!currentQuiz) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-text-dark mb-4">Quiz niet gevonden</h2>
          <Link to="/dashboard" className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-secondary transition-colors">
            Terug naar Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Modern Header */}
      <header className="bg-surface shadow-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                <img src="/favicon.ico" alt="QuizKeeper" className="w-10 h-10" />
                <div>
                  <h1 className="text-3xl font-bold text-primary">QuizKeeper</h1>
                  <p className="text-neutral">Teams Beheer</p>
                </div>
              </Link>
            </div>

            <div className="flex items-center space-x-3">
              <Link
                to="/dashboard"
                className="text-neutral hover:text-text-dark border border-border px-4 py-2 rounded-lg hover:bg-background transition-colors"
              >
                ← Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quiz Info Header */}
        <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-4xl font-bold mb-2">👥 Teams voor {currentQuiz.name}</h2>
              <div className="flex items-center space-x-6 text-blue-100">
                <span>📅 {new Date(currentQuiz.date).toLocaleDateString('nl-NL')}</span>
                <span>📍 {currentQuiz.location}</span>
                <span>🎯 {currentQuiz.rounds} rondes</span>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="text-6xl opacity-20">👥</div>
            </div>
          </div>
        </div>

        {/* Warning for started quiz */}
        {quizStarted && (
          <div className="bg-yellow-50 border border-warning rounded-xl p-6 mb-8">
            <div className="flex items-center space-x-3">
              <span className="text-warning text-xl">⚠️</span>
              <div>
                <h3 className="text-lg font-medium text-warning mb-1">Let op: Quiz is al gestart</h3>
                <p className="text-yellow-700">
                  Deze quiz heeft al scores. Nieuwe teams kunnen worden toegevoegd, maar krijgen 0 punten voor voltooide rondes.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Add Team Section */}
          <div className="lg:col-span-1">
            <div className="bg-surface border border-border rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold text-text-dark mb-4">🎯 Team Toevoegen</h3>

              <form onSubmit={handleAddTeam} className="space-y-4">
                <div>
                  <label htmlFor="teamName" className="block text-sm font-medium text-text-dark mb-2">
                    Team Naam
                  </label>
                  <input
                    type="text"
                    id="teamName"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    placeholder="Bijv. De Slimme Koppen"
                    disabled={addingTeam}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={addingTeam || !newTeamName.trim()}
                  className="w-full bg-primary text-white px-4 py-3 rounded-lg hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {addingTeam ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Toevoegen...
                    </span>
                  ) : (
                    '➕ Team Toevoegen'
                  )}
                </button>
              </form>

              {/* Excel Upload Section */}
              <div className="mt-8 pt-6 border-t border-border">
                <h4 className="text-lg font-medium text-text-dark mb-4">📊 Excel Import</h4>
                <ExcelUpload
                  onUpload={handleExcelUpload}
                  loading={importingTeams}
                  disabled={importingTeams}
                />
              </div>
            </div>
          </div>

          {/* Teams List Section */}
          <div className="lg:col-span-2">
            <div className="bg-surface border border-border rounded-xl shadow-sm">
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-text-dark">Geregistreerde Teams</h3>
                    <p className="text-neutral mt-1">{teams.length} team{teams.length !== 1 ? 's' : ''} aangemeld</p>
                  </div>
                  {teams.length > 0 && (
                    <Link
                      to={`/quiz/${quizId}/start`}
                      className="bg-success text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors font-medium"
                    >
                      🚀 Quiz Starten
                    </Link>
                  )}
                </div>
              </div>

              <div className="p-6">
                {teams.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">👥</div>
                    <h3 className="text-xl font-semibold text-text-dark mb-2">Nog geen teams</h3>
                    <p className="text-neutral mb-6">Voeg teams toe om te beginnen met je pubquiz</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {teams.map((team) => (
                      <div
                        key={team.id}
                        className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                                {team.teamNumber}
                              </div>
                              <div>
                                <h4 className="font-semibold text-text-dark">{team.name}</h4>
                                <p className="text-sm text-neutral">Team #{team.teamNumber}</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                              ✅ Actief
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {teams.length > 0 && (
              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <Link
                  to={`/quiz/${quizId}/start`}
                  className="flex-1 bg-primary text-white px-6 py-4 rounded-lg hover:bg-secondary transition-colors text-center font-medium text-lg"
                >
                  🚀 Quiz Starten ({teams.length} teams)
                </Link>
                <Link
                  to="/dashboard"
                  className="bg-gray-100 text-gray-700 px-6 py-4 rounded-lg hover:bg-gray-200 transition-colors text-center font-medium"
                >
                  💾 Opslaan en Later Starten
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-blue-900 mb-2">💡 Tips voor teams</h3>
              <ul className="text-blue-800 space-y-1 text-sm">
                <li>• Voeg teams één voor één toe of gebruik Excel import voor bulk toevoegen</li>
                <li>• Teams krijgen automatisch een nummer toegewezen</li>
                <li>• Je kunt ook teams toevoegen nadat de quiz is gestart</li>
                <li>• Nieuwe teams krijgen 0 punten voor al voltooide rondes</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

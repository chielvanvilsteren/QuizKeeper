// Modern Teams Page for QuizKeeper
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FormField, Button, Card, Badge, LoadingSpinner } from '../components/FormComponents';
import { Header } from '../components/Header';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-neutral/20">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <LoadingSpinner size="large" />
            <p className="text-black mt-4 text-lg">Quiz gegevens laden...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-neutral/20">
        <Header />
        <div className="flex items-center justify-center py-20">
          <Card className="text-center">
            <h2 className="text-xl font-semibold text-primary mb-4">Quiz niet gevonden</h2>
            <Link to="/">
              <Button variant="primary">🏠 Terug naar Home</Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-neutral/20">
      <Header />

      {/* Quiz Header Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <Card className="bg-[#D0B9A7] border-2 border-black border-l-4 border-l-secondary">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-primary">{currentQuiz.name}</h1>
                  {quizStarted && (
                    <Badge variant="warning" className="animate-pulse">
                      ⚡ Quiz Actief
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm mt-4">
                  <div className="flex items-center text-black">
                    <span className="text-secondary mr-2">📅</span>
                    {new Date(currentQuiz.date).toLocaleDateString('nl-NL', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="flex items-center text-black">
                    <span className="text-secondary mr-2">📍</span>
                    {currentQuiz.location}
                  </div>
                  <div className="flex items-center text-black">
                    <span className="text-secondary mr-2">🎯</span>
                    {currentQuiz.rounds} rondes
                  </div>
                  <div className="flex items-center text-black">
                    <span className="text-secondary mr-2">👥</span>
                    {teams.length} teams
                  </div>
                </div>
              </div>

              {teams.length > 0 && (
                <div className="mt-6 lg:mt-0 lg:ml-6">
                  <Link to={`/quiz/${currentQuiz.id}/start`}>
                    <Button
                      size="large"
                      variant={quizStarted ? "secondary" : "primary"}
                      className="w-full lg:w-auto min-w-[200px]"
                    >
                      {quizStarted ? "📋 Ga verder" : "🚀 Start Quiz"}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </Card>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid gap-8 lg:grid-cols-2">

          {/* Team Management */}
          <div className="space-y-6">
            <Card title="👥 Teams Beheren">
              {quizStarted && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex items-start">
                    <span className="text-amber-600 mr-3 text-xl">⚠️</span>
                    <div>
                      <p className="text-sm font-medium text-amber-800">Let op: Quiz is al gestart</p>
                      <p className="text-sm text-amber-700 mt-1">
                        Nieuwe teams beginnen met 0 punten voor alle vorige rondes.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Manual Team Entry */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-primary mb-4 flex items-center">
                  ✏️ Handmatig Team Toevoegen
                </h4>
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
                    size="large"
                  >
                    {addingTeam ? (
                      <span className="flex items-center justify-center">
                        <LoadingSpinner size="small" className="mr-2" />
                        Team toevoegen...
                      </span>
                    ) : (
                      '➕ Team Toevoegen'
                    )}
                  </Button>
                </form>
              </div>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral/30" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 bg-background text-black font-medium">OF</span>
                </div>
              </div>

              {/* Excel Import */}
              <div>
                <h4 className="text-lg font-semibold text-primary mb-4 flex items-center">
                  📊 Excel Import
                </h4>
                <ExcelUpload
                  onTeamsImported={handleImportTeams}
                  disabled={importingTeams}
                />

                {importingTeams && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="flex items-center">
                      <LoadingSpinner size="small" className="mr-3" />
                      <span className="text-sm text-blue-700 font-medium">Teams importeren...</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm text-blue-700 flex items-start">
                  <span className="text-blue-600 mr-2">💡</span>
                  <span>
                    <strong>Info:</strong> Teams krijgen automatisch een nummer toegewezen
                    in de volgorde waarin ze worden toegevoegd.
                  </span>
                </p>
              </div>
            </Card>
          </div>

          {/* Teams List */}
          <div>
            <Card title={`🎯 Teams Overzicht (${teams.length})`}>
              {teams.length === 0 ? (
                <EmptyTeamsState />
              ) : (
                <div className="space-y-3">
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl">
                    <p className="text-sm text-green-700 text-center font-medium">
                      🎉 {teams.length} team{teams.length !== 1 ? 's' : ''} klaar voor de quiz!
                    </p>
                  </div>

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {teams.map((team, index) => (
                      <TeamCard key={team.id} team={team} index={index} />
                    ))}
                  </div>
                </div>
              )}

              {teams.length > 0 && (
                <div className="mt-6 pt-6 border-t border-neutral/20">
                  <Link to={`/quiz/${currentQuiz.id}/start`}>
                    <Button
                      variant={quizStarted ? "secondary" : "primary"}
                      size="large"
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
      </section>
    </div>
  );
};

// Empty Teams State Component
const EmptyTeamsState = () => (
  <div className="text-center py-12">
    <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
      <span className="text-3xl">👥</span>
    </div>
    <h3 className="text-xl font-bold text-primary mb-4">Nog geen teams</h3>
    <p className="text-black mb-6 max-w-sm mx-auto">
      Voeg teams toe om de quiz te kunnen starten. Je kunt dit handmatig doen of via Excel import.
    </p>
    <div className="text-sm text-black">
      💡 Tip: De meeste pubquizzen hebben 8-12 teams
    </div>
  </div>
);

// Team Card Component
const TeamCard = ({ team, index }) => (
  <div className="bg-[#D0B9A7] border-2 border-black rounded-xl p-4 hover:shadow-md transition-all duration-200 animate-slide-up"
       style={{ animationDelay: `${index * 50}ms` }}>
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-secondary text-white rounded-full flex items-center justify-center font-bold text-lg">
          {team.teamNumber}
        </div>
        <div>
          <h4 className="font-bold text-primary text-lg">{team.name}</h4>
          <p className="text-sm text-neutral">Team {team.teamNumber}</p>
        </div>
      </div>
      <div className="text-right">
        <Badge variant="secondary" className="text-xs">
          #{team.teamNumber}
        </Badge>
      </div>
    </div>
  </div>
);

export default TeamsPage;

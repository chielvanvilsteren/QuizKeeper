// Modern HomePage for QuizKeeper with hero section and dashboard layout
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DeleteConfirmationModal } from '../components/Modal';
import { dbHelpers } from '../db/database';
import { authHelpers } from '../db/supabaseService';

export const HomePage = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, quiz: null });
  const [deleting, setDeleting] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    const currentUser = authHelpers.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    loadQuizzes();
  }, [navigate]);

  const loadQuizzes = async () => {
    try {
      const data = await dbHelpers.getAllQuizzes();
      setQuizzes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading quizzes:', error);
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuiz = async (quiz) => {
    setDeleteModal({ isOpen: true, quiz });
  };

  const confirmDelete = async () => {
    if (!deleteModal.quiz) return;

    setDeleting(true);
    try {
      await dbHelpers.deleteQuiz(deleteModal.quiz.id);
      await loadQuizzes();
      setDeleteModal({ isOpen: false, quiz: null });
    } catch (error) {
      console.error('Error deleting quiz:', error);
      alert('Fout bij verwijderen van quiz');
    } finally {
      setDeleting(false);
    }
  };

  const handleLogout = () => {
    authHelpers.logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-neutral">Quizzen laden...</p>
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
              <img src="/favicon.ico" alt="QuizKeeper" className="w-10 h-10" />
              <div>
                <h1 className="text-3xl font-bold text-primary">QuizKeeper</h1>
                <p className="text-neutral">Dashboard</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-neutral">Welkom terug,</p>
                <p className="font-semibold text-text-dark">{user?.username}</p>
              </div>

              <div className="flex items-center space-x-3">
                {user?.role === 'admin' && (
                  <button
                    onClick={() => navigate('/admin')}
                    className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-secondary transition-colors"
                  >
                    Admin Panel
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="text-neutral hover:text-text-dark border border-border px-4 py-2 rounded-lg hover:bg-background transition-colors"
                >
                  Uitloggen
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">🎯 Jouw Pubquiz Dashboard</h2>
              <p className="text-blue-100 text-lg">
                Beheer je quizzen, teams en scores op één plek
              </p>
            </div>
            <div className="hidden md:block">
              <div className="text-6xl opacity-20">🏆</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Link
            to="/quiz/new"
            className="group bg-surface border border-border rounded-xl p-6 hover:shadow-lg transition-all hover:border-primary"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-primary text-white p-3 rounded-lg group-hover:bg-secondary transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-text-dark">Nieuwe Quiz</h3>
                <p className="text-neutral">Start met het maken van een nieuwe pubquiz</p>
              </div>
            </div>
          </Link>

          <div className="bg-surface border border-border rounded-xl p-6">
            <div className="flex items-center space-x-4">
              <div className="bg-accent text-white p-3 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-text-dark">Statistieken</h3>
                <p className="text-neutral">{quizzes.length} quiz{quizzes.length !== 1 ? 'zen' : ''} gemaakt</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quizzes Section */}
        <div className="bg-surface rounded-xl border border-border shadow-sm">
          <div className="p-6 border-b border-border">
            <h2 className="text-2xl font-bold text-text-dark">Jouw Quizzen</h2>
            <p className="text-neutral mt-1">Beheer en start je pubquizzen</p>
          </div>

          <div className="p-6">
            {quizzes.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold text-text-dark mb-2">Nog geen quizzen</h3>
                <p className="text-neutral mb-6">Begin met het maken van je eerste pubquiz!</p>
                <Link
                  to="/quiz/new"
                  className="inline-flex items-center bg-primary text-white px-6 py-3 rounded-lg hover:bg-secondary transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Eerste Quiz Maken
                </Link>
              </div>
            ) : (
              <div className="grid gap-4">
                {quizzes.map((quiz) => {
                  const quizDate = new Date(quiz.date);
                  const isPast = quizDate < new Date();

                  return (
                    <div key={quiz.id} className="border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-semibold text-text-dark">{quiz.name}</h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              isPast ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'
                            }`}>
                              {isPast ? '📅 Afgelopen' : '🗓️ Gepland'}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-neutral">📅 Datum:</span>
                              <p className="font-medium text-text-dark">{quizDate.toLocaleDateString('nl-NL')}</p>
                            </div>
                            <div>
                              <span className="text-neutral">📍 Locatie:</span>
                              <p className="font-medium text-text-dark">{quiz.location}</p>
                            </div>
                            <div>
                              <span className="text-neutral">🎯 Rondes:</span>
                              <p className="font-medium text-text-dark">{quiz.rounds}</p>
                            </div>
                            <div>
                              <span className="text-neutral">👥 Teams:</span>
                              <p className="font-medium text-text-dark">{quiz.team_count || 0}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 ml-6">
                          <Link
                            to={`/quiz/${quiz.id}/teams`}
                            className="bg-secondary text-white px-4 py-2 rounded-lg hover:bg-accent transition-colors text-sm"
                          >
                            👥 Teams
                          </Link>
                          <Link
                            to={`/quiz/${quiz.id}/start`}
                            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition-colors text-sm"
                          >
                            🚀 Start
                          </Link>
                          <button
                            onClick={() => handleDeleteQuiz(quiz)}
                            className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="Quiz verwijderen"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, quiz: null })}
        onConfirm={confirmDelete}
        quizName={deleteModal.quiz?.name || ''}
        isDeleting={deleting}
      />
    </div>
  );
};

// Quiz Card Component
const QuizCard = ({ quiz, onDelete }) => {
  const isUpcoming = new Date(quiz.date) > new Date();
  const isPast = new Date(quiz.date) < new Date();

  return (
    <div className="bg-[#D0B9A7] rounded-xl p-6 border border-[#714329] hover:shadow-lg transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-bold text-[#714329]">{quiz.name}</h3>
            <span className={`px-2 py-1 rounded text-sm font-medium ${
              isUpcoming ? 'bg-yellow-200 text-yellow-800' : 
              isPast ? 'bg-gray-200 text-gray-800' : 
              'bg-green-200 text-green-800'
            }`}>
              {isUpcoming ? 'Aankomend' : isPast ? 'Afgelopen' : 'Actief'}
            </span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-[#714329]">
            <div className="flex items-center">
              <span className="mr-2">📅</span>
              {new Date(quiz.date).toLocaleDateString('nl-NL')}
            </div>
            <div className="flex items-center">
              <span className="mr-2">📍</span>
              {quiz.location}
            </div>
            <div className="flex items-center">
              <span className="mr-2">🎯</span>
              {quiz.rounds} rondes
            </div>
            <div className="flex items-center">
              <span className="mr-2">⏱️</span>
              {new Date(quiz.created_at).toLocaleDateString('nl-NL')}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 ml-4">
          <Link to={`/quiz/${quiz.id}/teams`}>
            <button className="bg-[#B5A192] text-white px-3 py-1 rounded hover:bg-[#B08463] transition-colors text-sm">
              👥 Teams
            </button>
          </Link>
          <Link to={`/quiz/${quiz.id}/start`}>
            <button className="bg-[#B08463] text-white px-3 py-1 rounded hover:bg-[#B9937B] transition-colors text-sm">
              🚀 Start
            </button>
          </Link>
          <button
            onClick={() => onDelete(quiz)}
            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Quiz verwijderen"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// Empty State Component
const EmptyState = () => (
  <div className="text-center py-12">
    <div className="w-24 h-24 bg-[#B08463] rounded-full flex items-center justify-center mx-auto mb-6">
      <span className="text-4xl text-white">🎯</span>
    </div>
    <h3 className="text-2xl font-bold text-[#714329] mb-4">
      Nog geen quizzen aangemaakt
    </h3>
    <p className="text-[#B5A192] mb-8 max-w-md mx-auto">
      Begin met het maken van je eerste pubquiz en creëer onvergetelijke avonden vol plezier en competitie.
    </p>
    <Link to="/new">
      <button className="bg-[#B08463] text-white px-8 py-3 rounded-lg text-lg hover:bg-[#B9937B] transition-colors">
        🎯 Maak je eerste quiz
      </button>
    </Link>
  </div>
);

export default HomePage;

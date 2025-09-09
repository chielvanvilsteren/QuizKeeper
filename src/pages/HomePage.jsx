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
      alert('Er ging iets mis bij het verwijderen van de quiz');
    } finally {
      setDeleting(false);
    }
  };

  const handleLogout = () => {
    authHelpers.logout();
    navigate('/');
  };

  // Show loading while checking authentication
  if (!user) {
    return (
      <div className="min-h-screen bg-[#D0B9A7] flex items-center justify-center">
        <div className="text-[#714329] text-xl">Authenticatie controleren...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#D0B9A7]">
      {/* Header with authentication */}
      <header className="bg-[#714329] text-white py-6">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img src="/favicon.ico" alt="QuizKeeper" className="w-8 h-8" />
            <h1 className="text-2xl font-bold text-white">QuizKeeper</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-white">Welkom, {user.username}</span>
            {user.role === 'admin' && (
              <button
                onClick={() => navigate('/admin')}
                className="text-white hover:text-[#D0B9A7] transition-colors"
              >
                Admin Panel
              </button>
            )}
            <button
              onClick={handleLogout}
              className="bg-[#B08463] text-white px-4 py-2 rounded-lg hover:bg-[#B9937B] transition-colors"
            >
              Uitloggen
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="relative max-w-7xl mx-auto text-center">
          <div>
            <h1 className="text-5xl md:text-7xl font-bold text-[#714329] mb-6">
              Quiz<span className="text-[#B08463]">Keeper</span>
            </h1>
            <p className="text-xl md:text-2xl text-[#714329] mb-8 max-w-3xl mx-auto">
              De slimste en meest intuïtieve pubquiz app voor onvergetelijke avonden vol plezier
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/new">
              <button className="bg-[#B08463] text-white px-8 py-3 rounded-lg text-lg hover:bg-[#B9937B] transition-colors">
                🎯 Nieuwe Quiz Starten
              </button>
            </Link>
            <div className="text-[#714329] text-sm">
              {quizzes.length > 0 && `${quizzes.length} quiz${quizzes.length !== 1 ? 'zes' : ''} beschikbaar`}
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Quiz List */}
          <div className="bg-[#D0B9A7] border-2 border-black rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-[#714329] mb-6">🎯 Jouw Quizzen</h2>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-[#714329]">Quizzen laden...</div>
              </div>
            ) : quizzes.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid gap-4">
                {quizzes.map((quiz) => (
                  <QuizCard
                    key={quiz.id} 
                    quiz={quiz} 
                    onDelete={handleDeleteQuiz}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

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

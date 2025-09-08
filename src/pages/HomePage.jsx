// Modern HomePage for QuizKeeper with hero section and dashboard layout
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, LoadingSpinner, Badge } from '../components/FormComponents';
import { Header } from '../components/Header';
import { DeleteConfirmationModal } from '../components/Modal';
import { dbHelpers } from '../db/database';

export const HomePage = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, quiz: null });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadQuizzes();
  }, []);

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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-neutral/20">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-primary/5"></div>
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="animate-bounce-subtle">
            <h1 className="text-5xl md:text-7xl font-bold text-primary mb-6">
              Quiz<span className="text-secondary">Keeper</span>
            </h1>
            <p className="text-xl md:text-2xl text-black mb-8 max-w-3xl mx-auto">
              De slimste en meest intuïtieve pubquiz app voor onvergetelijke avonden vol plezier
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up">
            <Link to="/new">
              <Button size="large" className="min-w-[200px]">
                🎯 Nieuwe Quiz Starten
              </Button>
            </Link>
            <div className="text-black text-sm">
              {quizzes.length > 0 && `${quizzes.length} quiz${quizzes.length !== 1 ? 'zes' : ''} beschikbaar`}
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Quiz List */}
          <Card title="🎯 Jouw Quizzen" className="animate-fade-in">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <LoadingSpinner size="large" />
                <span className="ml-3 text-neutral">Quizzen laden...</span>
              </div>
            ) : quizzes.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid gap-4">
                {quizzes.map((quiz, index) => (
                  <QuizCard 
                    key={quiz.id} 
                    quiz={quiz} 
                    onDelete={handleDeleteQuiz}
                    style={{ animationDelay: `${index * 100}ms` }}
                    className="animate-slide-up"
                  />
                ))}
              </div>
            )}
          </Card>
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
const QuizCard = ({ quiz, onDelete, className, style }) => {
  const isUpcoming = new Date(quiz.date) > new Date();
  const isPast = new Date(quiz.date) < new Date();

  return (
    <div 
      className={`bg-white rounded-xl p-6 border border-neutral/20 hover:shadow-lg transition-all duration-200 ${className}`}
      style={style}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-bold text-primary">{quiz.name}</h3>
            <Badge variant={isUpcoming ? 'warning' : isPast ? 'default' : 'success'}>
              {isUpcoming ? 'Aankomend' : isPast ? 'Afgelopen' : 'Actief'}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-neutral">
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
            <Button size="small" variant="outline">
              👥 Teams
            </Button>
          </Link>
          <Link to={`/quiz/${quiz.id}/start`}>
            <Button size="small">
              🚀 Start
            </Button>
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
    <div className="w-24 h-24 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
      <span className="text-4xl">🎯</span>
    </div>
    <h3 className="text-2xl font-bold text-primary mb-4">
      Nog geen quizzen aangemaakt
    </h3>
    <p className="text-neutral mb-8 max-w-md mx-auto">
      Begin met het maken van je eerste pubquiz en creëer onvergetelijke avonden vol plezier en competitie.
    </p>
    <Link to="/new">
      <Button size="large">
        🎯 Maak je eerste quiz
      </Button>
    </Link>
  </div>
);

export default HomePage;

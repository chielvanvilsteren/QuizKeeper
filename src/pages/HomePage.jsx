// Home Page - Overview of all quizzes
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card } from '../components/FormComponents';
import { DeleteConfirmationModal, DetailedResultsTable } from '../components/Modal';
import { Modal } from '../components/Modal';
import { dbHelpers } from '../db/database';

export const HomePage = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quizStatuses, setQuizStatuses] = useState({}); // Track which quizzes are started
  const [quizCompleted, setQuizCompleted] = useState({}); // Track which quizzes are completed
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [selectedQuizResults, setSelectedQuizResults] = useState(null);

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      const allQuizzes = await dbHelpers.getAllQuizzes();
      // Ensure we always have an array, even if API returns something else
      setQuizzes(Array.isArray(allQuizzes) ? allQuizzes : []);

      // Only process quiz statuses if we have valid data
      if (Array.isArray(allQuizzes) && allQuizzes.length > 0) {
        // Check status for each quiz
        const statuses = {};
        const completed = {};
        for (const quiz of allQuizzes) {
          try {
            const scores = await dbHelpers.getScoresByQuiz(quiz.id);
            const isCompleted = await dbHelpers.isQuizCompleted(quiz.id);

            statuses[quiz.id] = Array.isArray(scores) ? scores.length > 0 : false;
            completed[quiz.id] = isCompleted;
          } catch (err) {
            console.error(`Error loading status for quiz ${quiz.id}:`, err);
            statuses[quiz.id] = false;
            completed[quiz.id] = false;
          }
        }
        setQuizStatuses(statuses);
        setQuizCompleted(completed);
      }
    } catch (error) {
      console.error('Error loading quizzes:', error);
      // Ensure quizzes is always an array even when there's an error
      setQuizzes([]);
      setQuizStatuses({});
      setQuizCompleted({});
    } finally {
      setLoading(false);
    }
  };

  const handleShowResults = async (quiz) => {
    try {
      const results = await dbHelpers.getDetailedQuizResults(quiz.id);
      setSelectedQuizResults(results);
      setShowResultsModal(true);
    } catch (error) {
      console.error('Error loading quiz results:', error);
      alert('Fout bij het laden van resultaten');
    }
  };

  const handleDeleteClick = (quiz) => {
    setQuizToDelete(quiz);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!quizToDelete) return;

    setIsDeleting(true);
    try {
      await dbHelpers.deleteQuiz(quizToDelete.id);

      // Remove quiz from local state
      setQuizzes(quizzes.filter(q => q.id !== quizToDelete.id));

      // Close modal and reset state
      setDeleteModalOpen(false);
      setQuizToDelete(null);

      // Show success message
      alert(`Quiz "${quizToDelete.name}" is succesvol verwijderd`);
    } catch (error) {
      console.error('Error deleting quiz:', error);
      alert(`Fout bij verwijderen: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setQuizToDelete(null);
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
          <p className="text-gray-600">Quizzen laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎯 Quizkeeper
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Organiseer en beheer je pubquizzen eenvoudig
          </p>
          <Link to="/new-quiz">
            <Button variant="primary" className="text-lg px-8 py-3">
              ➕ Nieuwe Quiz Aanmaken
            </Button>
          </Link>
        </div>

        {/* Quizzes List */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Recente Quizzen
          </h2>

          {quizzes.length === 0 ? (
            <Card className="text-center py-12">
              <div className="text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nog geen quizzen
                </h3>
                <p className="text-gray-500 mb-4">
                  Maak je eerste pubquiz aan om te beginnen
                </p>
                <Link to="/new-quiz">
                  <Button variant="primary">
                    Eerste Quiz Aanmaken
                  </Button>
                </Link>
              </div>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {quizzes.map((quiz) => {
                const isStarted = quizStatuses[quiz.id];
                const isCompleted = quizCompleted[quiz.id];

                return (
                  <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {quiz.name}
                        </h3>
                        <div className="flex items-center space-x-2">
                          {isCompleted ? (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              ✅ Afgerond
                            </span>
                          ) : isStarted ? (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                              🟡 Actief
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              🆕 Nieuw
                            </span>
                          )}
                          <button
                            onClick={() => handleDeleteClick(quiz)}
                            className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                            title="Quiz verwijderen"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>📅 {formatDate(quiz.date)}</p>
                        <p>📍 {quiz.location}</p>
                        <p>🎯 {quiz.rounds} rondes</p>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Link
                        to={`/teams/${quiz.id}`}
                        className="flex-1"
                      >
                        <Button variant="primary" className="w-full">
                          Beheren
                        </Button>
                      </Link>

                      {isCompleted ? (
                        <Button
                          onClick={() => handleShowResults(quiz)}
                          variant="success"
                          className="flex-1 bg-green-600 hover:bg-green-700 focus:ring-green-500"
                        >
                          🏆 Bekijk Resultaten
                        </Button>
                      ) : (
                        <Link
                          to={`/quiz/${quiz.id}/start`}
                          className="flex-1"
                        >
                          <Button
                            variant={isStarted ? "secondary" : "success"}
                            className="w-full"
                          >
                            {isStarted ? "📋 Ga verder" : "🚀 Starten"}
                          </Button>
                        </Link>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Results Modal */}
      <Modal
        isOpen={showResultsModal}
        onClose={() => setShowResultsModal(false)}
        title="🏆 Quiz Resultaten"
        size="xl"
      >
        {selectedQuizResults && (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {selectedQuizResults.quiz.name} - Einduitslag
              </h3>
              <p className="text-gray-600">
                Alle punten per ronde voor alle teams
              </p>
            </div>

            <DetailedResultsTable results={selectedQuizResults} />

            <div className="mt-6 text-center">
              <Button onClick={() => setShowResultsModal(false)} variant="primary">
                Sluiten
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        quizName={quizToDelete?.name || ''}
        isDeleting={isDeleting}
      />
    </div>
  );
};

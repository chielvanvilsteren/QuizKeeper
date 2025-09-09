// Modern New Quiz Page for QuizKeeper
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { dbHelpers } from '../db/database';
import { authHelpers } from '../db/supabaseService';

export const NewQuizPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    location: '',
    rounds: 5
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Check if user is authenticated
    if (!authHelpers.isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);

  // Show loading while checking authentication
  if (!authHelpers.isAuthenticated()) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-neutral text-xl">Authenticatie controleren...</div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Quiz naam is verplicht';
    if (!formData.date) newErrors.date = 'Datum is verplicht';
    if (!formData.location.trim()) newErrors.location = 'Locatie is verplicht';
    if (formData.rounds < 1 || formData.rounds > 20) newErrors.rounds = 'Aantal rondes moet tussen 1 en 20 zijn';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      const quiz = await dbHelpers.createQuiz(formData);
      // Navigate to teams page for the new quiz
      navigate(`/quiz/${quiz.id}/teams`);
    } catch (error) {
      console.error('Error creating quiz:', error);
      setErrors({ general: error.message || 'Er is een fout opgetreden bij het aanmaken van de quiz' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

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
                  <p className="text-neutral">Nieuwe Quiz</p>
                </div>
              </Link>
            </div>

            <div className="flex items-center space-x-3">
              <Link
                to="/dashboard"
                className="text-neutral hover:text-text-dark border border-border px-4 py-2 rounded-lg hover:bg-background transition-colors"
              >
                ← Terug naar Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 text-white mb-8">
            <h2 className="text-4xl font-bold mb-4">🎯 Nieuwe Pubquiz Maken</h2>
            <p className="text-blue-100 text-lg">
              Vul de basisgegevens in om je pubquiz aan te maken
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-surface border border-border rounded-xl shadow-lg">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Quiz Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-text-dark mb-2">
                  Quiz Naam *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  placeholder="Bijv. Vrijdagavond Pubquiz"
                  disabled={submitting}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              {/* Date and Location Row */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-text-dark mb-2">
                    Datum *
                  </label>
                  <input
                    type="date"
                    id="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    disabled={submitting}
                  />
                  {errors.date && (
                    <p className="text-red-500 text-sm mt-1">{errors.date}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-text-dark mb-2">
                    Locatie *
                  </label>
                  <input
                    type="text"
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    placeholder="Bijv. Café De Kroon"
                    disabled={submitting}
                  />
                  {errors.location && (
                    <p className="text-red-500 text-sm mt-1">{errors.location}</p>
                  )}
                </div>
              </div>

              {/* Number of Rounds */}
              <div>
                <label htmlFor="rounds" className="block text-sm font-medium text-text-dark mb-2">
                  Aantal Rondes *
                </label>
                <select
                  id="rounds"
                  value={formData.rounds}
                  onChange={(e) => handleInputChange('rounds', parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  disabled={submitting}
                >
                  {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'ronde' : 'rondes'}
                    </option>
                  ))}
                </select>
                {errors.rounds && (
                  <p className="text-red-500 text-sm mt-1">{errors.rounds}</p>
                )}
              </div>

              {/* General Error */}
              {errors.general && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {errors.general}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row gap-4 pt-6">
                <Link
                  to="/dashboard"
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors text-center font-medium"
                >
                  Annuleren
                </Link>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-primary text-white px-6 py-3 rounded-lg hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Quiz aanmaken...
                    </span>
                  ) : (
                    '🎯 Quiz Aanmaken'
                  )}
                </button>
              </div>
            </form>
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
              <h3 className="text-lg font-medium text-blue-900 mb-2">💡 Tips voor je quiz</h3>
              <ul className="text-blue-800 space-y-1 text-sm">
                <li>• Kies een herkenbare naam voor je quiz</li>
                <li>• Plan je quiz op een datum wanneer mensen tijd hebben</li>
                <li>• 5-8 rondes is meestal een goed aantal voor een avondvullende quiz</li>
                <li>• Na het aanmaken kun je teams toevoegen en de quiz starten</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NewQuizPage;

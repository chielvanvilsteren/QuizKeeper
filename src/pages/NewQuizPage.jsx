// New Quiz Page - Form to create a new pub quiz
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormField, Button, Card } from '../components/FormComponents';
import { dbHelpers } from '../db/database';
import { useQuizStore } from '../store/quizStore';

export const NewQuizPage = () => {
  const navigate = useNavigate();
  const { setCurrentQuiz } = useQuizStore();

  const [formData, setFormData] = useState({
    name: '',
    date: '',
    location: '',
    rounds: 5
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (field) => (e) => {
    const value = field === 'rounds' ? parseInt(e.target.value) || 0 : e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Quiz naam is verplicht';
    }

    if (!formData.date) {
      newErrors.date = 'Datum is verplicht';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Locatie is verplicht';
    }

    if (formData.rounds < 1 || formData.rounds > 20) {
      newErrors.rounds = 'Aantal rondes moet tussen 1 en 20 zijn';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const quizId = await dbHelpers.createQuiz(formData);
      const newQuiz = { id: quizId, ...formData };

      setCurrentQuiz(newQuiz);
      navigate(`/teams/${quizId}`);
    } catch (error) {
      console.error('Error creating quiz:', error);
      alert('Er ging iets mis bij het aanmaken van de quiz. Probeer opnieuw.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🎯 Nieuwe Pubquiz Aanmaken
          </h1>
          <p className="text-gray-600">
            Vul de gegevens in voor je nieuwe pubquiz
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormField
              label="Quiz Naam"
              value={formData.name}
              onChange={handleChange('name')}
              placeholder="Bijv. Vrijdagavond Quiz"
              required
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}

            <FormField
              label="Datum"
              type="date"
              value={formData.date}
              onChange={handleChange('date')}
              required
            />
            {errors.date && (
              <p className="text-red-500 text-sm mt-1">{errors.date}</p>
            )}

            <FormField
              label="Locatie"
              value={formData.location}
              onChange={handleChange('location')}
              placeholder="Bijv. Café De Kroeg"
              required
            />
            {errors.location && (
              <p className="text-red-500 text-sm mt-1">{errors.location}</p>
            )}

            <FormField
              label="Aantal Rondes"
              type="number"
              value={formData.rounds}
              onChange={handleChange('rounds')}
              min={1}
              max={20}
              required
            />
            {errors.rounds && (
              <p className="text-red-500 text-sm mt-1">{errors.rounds}</p>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    <strong>Tip:</strong> Na het aanmaken van de quiz kun je teams toevoegen.
                    Elk team krijgt automatisch een uniek teamnummer.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex space-x-4 pt-6">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/')}
                className="flex-1"
              >
                Annuleren
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Aanmaken...' : 'Quiz Aanmaken'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

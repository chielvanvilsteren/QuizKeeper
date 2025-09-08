// Modern New Quiz Page for QuizKeeper
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FormField, Button, Card } from '../components/FormComponents';
import { Header } from '../components/Header';
import { dbHelpers } from '../db/database';

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
    try {
      const quiz = await dbHelpers.createQuiz(formData);
      navigate(`/quiz/${quiz.id}/teams`);
    } catch (error) {
      console.error('Error creating quiz:', error);
      alert('Er ging iets mis bij het aanmaken van de quiz');
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

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-neutral/20">
      <Header />

      {/* Hero Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="animate-slide-up">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              🎯 Nieuwe Quiz Maken
            </h1>
            <p className="text-xl text-neutral mb-8">
              Stel je eigen pubquiz samen en maak er een onvergetelijke avond van
            </p>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <Card className="animate-fade-in">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Quiz Name */}
              <FormField
                label="Quiz Naam"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Bijv. Vrijdagavond Pubquiz"
                required
                error={errors.name}
              />

              {/* Date and Location Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="Datum"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  min={today}
                  required
                  error={errors.date}
                />

                <FormField
                  label="Locatie"
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Bijv. Café De Kroeg"
                  required
                  error={errors.location}
                />
              </div>

              {/* Rounds */}
              <div>
                <FormField
                  label="Aantal Rondes"
                  type="number"
                  value={formData.rounds}
                  onChange={(e) => handleInputChange('rounds', parseInt(e.target.value))}
                  min="1"
                  max="20"
                  required
                  error={errors.rounds}
                />
                <p className="text-sm text-neutral mt-2">
                  💡 De meeste pubquizzen hebben tussen de 5-8 rondes
                </p>
              </div>

              {/* Preview Card */}
              <div className="bg-white rounded-xl border border-neutral/20 p-6">
                <h3 className="text-lg font-bold text-primary mb-4 flex items-center">
                  👀 Preview van je Quiz
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <span className="text-secondary mr-3">📝</span>
                    <span className="font-medium text-primary">
                      {formData.name || 'Quiz naam...'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-secondary mr-3">📅</span>
                    <span className="text-neutral">
                      {formData.date ? new Date(formData.date).toLocaleDateString('nl-NL', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'Datum selecteren...'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-secondary mr-3">📍</span>
                    <span className="text-neutral">
                      {formData.location || 'Locatie invullen...'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-secondary mr-3">🎯</span>
                    <span className="text-neutral">
                      {formData.rounds} ronde{formData.rounds !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Link to="/" className="flex-1">
                  <Button type="button" variant="outline" className="w-full" size="large">
                    ← Annuleren
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1"
                  size="large"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Quiz maken...
                    </span>
                  ) : (
                    '🚀 Quiz Maken'
                  )}
                </Button>
              </div>
            </form>
          </Card>

          {/* Tips Section */}
          <Card title="💡 Tips voor een Geweldige Quiz" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-primary mb-2">🎯 Rondes</h4>
                <ul className="text-sm text-neutral space-y-1">
                  <li>• 5-8 rondes is ideaal voor 2-3 uur</li>
                  <li>• Wissel moeilijke en makkelijke rondes af</li>
                  <li>• Houd rekening met pauzes</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-primary mb-2">👥 Teams</h4>
                <ul className="text-sm text-neutral space-y-1">
                  <li>• 4-6 personen per team werkt het best</li>
                  <li>• Gebruik de Excel import voor grote groepen</li>
                  <li>• Nummering gebeurt automatisch</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default NewQuizPage;

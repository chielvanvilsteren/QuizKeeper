import React from 'react';
import { useNavigate } from 'react-router-dom';

function IntroPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-white py-6 shadow-lg">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img src="/favicon.ico" alt="QuizKeeper" className="w-8 h-8" />
            <h1 className="text-2xl font-bold">QuizKeeper</h1>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/register')}
              className="text-white border border-white px-4 py-2 rounded-lg hover:bg-white hover:text-primary transition-colors"
            >
              Registreren
            </button>
            <button
              onClick={() => navigate('/login')}
              className="bg-secondary text-white px-6 py-2 rounded-lg hover:bg-accent transition-colors"
            >
              Inloggen
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-background to-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold text-text-dark mb-6">
            Welkom bij QuizKeeper
          </h2>
          <p className="text-xl text-neutral mb-8 max-w-2xl mx-auto">
            De ultieme tool voor het organiseren en beheren van pubquizzen.
            Maak quizzen, beheer teams en houd scores bij met gemak.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="bg-secondary text-white px-8 py-3 rounded-lg text-lg hover:bg-accent transition-colors shadow-lg hover:shadow-xl"
          >
            Begin nu
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-text-dark text-center mb-12">
            Waarom QuizKeeper?
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-surface border border-border rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-text-dark mb-2">Eenvoudig Beheer</h3>
              <p className="text-neutral">
                Maak quizzen aan, beheer teams en houd scores bij met onze intuïtieve interface.
              </p>
            </div>

            <div className="bg-surface border border-border rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-text-dark mb-2">Live Scores</h3>
              <p className="text-neutral">
                Volg de resultaten in real-time en zie wie er aan de leiding staat.
              </p>
            </div>

            <div className="bg-surface border border-border rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-xl font-semibold text-text-dark mb-2">Prijsuitreiking</h3>
              <p className="text-neutral">
                Genereer automatisch prijswinnaars op basis van de eindscores.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-secondary">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Klaar om te beginnen?
          </h3>
          <p className="text-blue-100 mb-8 text-lg">
            Log in om je eerste pubquiz te maken en te beheren.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="bg-white text-primary px-8 py-3 rounded-lg text-lg hover:bg-gray-100 transition-colors shadow-lg font-semibold"
          >
            Inloggen
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-text-dark text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2025 QuizKeeper. Gemaakt voor de beste pubquiz ervaring.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default IntroPage;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import Threads from '../components/Threads';

function IntroPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background Animation */}
      <div className="fixed inset-0 z-0">
        <Threads
          color={[0.2, 0.4, 0.8]}
          amplitude={0.5}
          distance={0.2}
          enableMouseInteraction={true}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-secondary/70 to-accent/80 backdrop-blur-lg"></div>
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-4 py-8">
          <div className="flex justify-between items-center">
            {/* Brand Section - Creative Typography */}
            <div className="flex flex-col">
              <h1 className="text-4xl font-black text-white tracking-wider relative">
                Quiz
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-accent">
                  Beheer
                </span>
                <div className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-secondary via-accent to-primary rounded-full"></div>
              </h1>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/register')}
                className="group relative overflow-hidden px-6 py-3 text-white font-medium border-2 border-white/30 rounded-full hover:border-white/60 transition-all duration-300 backdrop-blur-sm"
              >
                <span className="relative z-10">Registreren</span>
                <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              </button>

              <button
                onClick={() => navigate('/login')}
                className="group relative overflow-hidden px-8 py-3 bg-gradient-to-r from-secondary to-accent text-white font-bold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <span className="relative z-10 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Inloggen
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-accent to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-xl"></div>
          <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-br from-yellow-400/20 to-transparent rounded-full blur-lg"></div>
        </div>
      </header>

      {/* Hero Section - Fully transparent to show animation */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold text-black mb-6 drop-shadow-2xl">
            Welkom bij QuizBeheer
          </h2>
          <p className="text-xl text-black mb-8 max-w-2xl mx-auto drop-shadow-xl">
            De ultieme tool voor het organiseren en beheren van pubquizzen.
            Maak quizzen, beheer teams en houd scores bij met gemak.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="bg-secondary text-white px-8 py-3 rounded-lg text-lg hover:bg-accent transition-colors shadow-2xl hover:shadow-3xl border-2 border-white/20"
          >
            Begin nu
          </button>
        </div>
      </section>

      {/* Features Section - Semi-transparent overlay */}
      <section className="py-16 relative z-10">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-black text-center mb-12 drop-shadow-2xl">
            Waarom QuizBeheer?
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 shadow-2xl hover:shadow-3xl transition-shadow backdrop-blur-sm bg-white/10 rounded-2xl border-2" style={{ borderColor: 'rgb(30, 64, 175)' }}>
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-black mb-2">Eenvoudig Beheer</h3>
              <p className="text-black/90">
                Maak quizzen aan, beheer teams en houd scores bij met onze intuïtieve interface.
              </p>
            </div>

            <div className="p-6 shadow-2xl hover:shadow-3xl transition-shadow backdrop-blur-sm bg-white/10 rounded-2xl border-2" style={{ borderColor: 'rgb(30, 64, 175)' }}>
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-black mb-2">Live Scores</h3>
              <p className="text-black/90">
                Volg de resultaten in real-time en zie wie er aan de leiding staat.
              </p>
            </div>

            <div className="p-6 shadow-2xl hover:shadow-3xl transition-shadow backdrop-blur-sm bg-white/10 rounded-2xl border-2" style={{ borderColor: 'rgb(30, 64, 175)' }}>
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-xl font-semibold text-black mb-2">Prijsuitreiking</h3>
              <p className="text-black/90">
                Genereer automatisch prijswinnaars op basis van de eindscores.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Minimal overlay */}
      <section className="py-16 relative z-10">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold text-black mb-4 drop-shadow-2xl">
            Klaar om te beginnen?
          </h3>
          <p className="text-black/90 mb-8 text-lg drop-shadow-xl">
            Log in om je eerste pubquiz te maken en te beheren.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="bg-white text-primary px-8 py-3 rounded-lg text-lg hover:bg-gray-100 transition-colors shadow-2xl font-semibold border-2 border-white/30"
          >
            Inloggen
          </button>
        </div>
      </section>

      {/* Footer - Minimal overlay */}
      <footer className="py-8 relative z-10">
        <div className="container mx-auto px-4 text-center">
          <p className="text-black/70 drop-shadow-lg">
            © 2025 QuizBeheer. Gemaakt voor de beste pubquiz ervaring.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default IntroPage;

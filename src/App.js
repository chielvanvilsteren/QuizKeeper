// Main App Component for QuizKeeper with authentication and modern styling
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { NewQuizPage } from './pages/NewQuizPage';
import { TeamsPage } from './pages/TeamsPage';
import { QuizStartPage } from './pages/QuizStartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import IntroPage from './pages/IntroPage';
import AdminDashboard from './pages/AdminDashboard';
import ActivationPage from './pages/ActivationPage'; // Import the new ActivationPage component
import { ModalProvider } from './components/ModalProvider';
import './App.css';

function App() {
  return (
    <ModalProvider>
      <div className="min-h-screen bg-[#D0B9A7] font-sans">
        <Router>
          <Routes>
            {/* Introductie pagina voor bezoekers */}
            <Route path="/" element={<IntroPage />} />

            {/* Login pagina */}
            <Route path="/login" element={<LoginPage />} />

            {/* Registratie pagina */}
            <Route path="/register" element={<RegisterPage />} />

            {/* Account activatie pagina */}
            <Route path="/activate" element={<ActivationPage />} />

            {/* Dashboard voor ingelogde gebruikers */}
            <Route path="/dashboard" element={<HomePage />} />

            {/* Admin dashboard */}
            <Route path="/admin" element={<AdminDashboard />} />

            {/* Nieuwe quiz aanmaken - requires authentication */}
            <Route path="/quiz/new" element={<NewQuizPage />} />

            {/* Teams beheren voor een specifieke quiz - requires authentication */}
            <Route path="/quiz/:quizId/teams" element={<TeamsPage />} />

            {/* Quiz starten en scores invoeren - requires authentication */}
            <Route path="/quiz/:quizId/start" element={<QuizStartPage />} />

            {/* Fallback route - redirect naar intro */}
            <Route path="*" element={<IntroPage />} />
          </Routes>
        </Router>
      </div>
    </ModalProvider>
  );
}

export default App;

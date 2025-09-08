// Main App Component for QuizKeeper with modern styling
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { NewQuizPage } from './pages/NewQuizPage';
import { TeamsPage } from './pages/TeamsPage';
import { QuizStartPage } from './pages/QuizStartPage';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <Router>
        <Routes>
          {/* Home page - overzicht van alle quizzen */}
          <Route path="/" element={<HomePage />} />

          {/* Nieuwe quiz aanmaken */}
          <Route path="/new" element={<NewQuizPage />} />

          {/* Teams beheren voor een specifieke quiz */}
          <Route path="/quiz/:quizId/teams" element={<TeamsPage />} />

          {/* Quiz starten en scores invoeren */}
          <Route path="/quiz/:quizId/start" element={<QuizStartPage />} />

          {/* Fallback route - redirect naar home */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;

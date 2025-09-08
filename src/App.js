import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { NewQuizPage } from './pages/NewQuizPage';
import { TeamsPage } from './pages/TeamsPage';
import { QuizStartPage } from './pages/QuizStartPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main>
          <Routes>
            {/* Home page - overzicht van alle quizzen */}
            <Route path="/" element={<HomePage />} />

            {/* Nieuwe quiz aanmaken */}
            <Route path="/new-quiz" element={<NewQuizPage />} />

            {/* Teams beheren voor een specifieke quiz */}
            <Route path="/teams/:quizId" element={<TeamsPage />} />

            {/* Quiz starten en scores invoeren */}
            <Route path="/quiz/:quizId/start" element={<QuizStartPage />} />

            {/* Fallback route - redirect naar home */}
            <Route path="*" element={<HomePage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

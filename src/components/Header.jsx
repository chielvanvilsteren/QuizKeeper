// Navigation Header Component
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from './FormComponents';
import { useQuizStore } from '../store/quizStore';

export const Header = () => {
  const location = useLocation();
  const { currentQuiz, isQuizStarted, toggleLeaderboard } = useQuizStore();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Title */}
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold hover:text-blue-200">
              🎯 Quizkeeper
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-4">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'bg-blue-700 text-white' 
                  : 'text-blue-100 hover:text-white hover:bg-blue-500'
              }`}
            >
              Home
            </Link>
            <Link
              to="/new-quiz"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/new-quiz') 
                  ? 'bg-blue-700 text-white' 
                  : 'text-blue-100 hover:text-white hover:bg-blue-500'
              }`}
            >
              Nieuwe Quiz
            </Link>
            {currentQuiz && (
              <Link
                to={`/teams/${currentQuiz.id}`}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(`/teams/${currentQuiz.id}`) 
                    ? 'bg-blue-700 text-white' 
                    : 'text-blue-100 hover:text-white hover:bg-blue-500'
                }`}
              >
                Teams
              </Link>
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            {/* Current Quiz Info */}
            {currentQuiz && (
              <div className="hidden lg:block text-sm text-blue-100">
                <span className="font-medium">{currentQuiz.name}</span>
                {isQuizStarted && (
                  <span className="ml-2 px-2 py-1 bg-green-500 rounded-full text-xs">
                    Actief
                  </span>
                )}
              </div>
            )}

            {/* Leaderboard Button - alleen tonen tijdens quiz */}
            {currentQuiz && isQuizStarted && (
              <Button
                onClick={toggleLeaderboard}
                variant="secondary"
                className="bg-green-600 hover:bg-green-700 focus:ring-green-500"
              >
                📊 Tussenstand
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

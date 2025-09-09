import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authHelpers } from '../db/supabaseService';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authHelpers.login(username, password);
      navigate('/dashboard');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-surface border border-border rounded-xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img src="/favicon.ico" alt="QuizBeheer" className="w-12 h-12 mr-3" />
            <h1 className="text-2xl font-bold text-primary">QuizBeheer</h1>
          </div>
          <h2 className="text-3xl font-bold text-text-dark mb-2">Inloggen</h2>
          <p className="text-neutral">Log in om toegang te krijgen tot QuizBeheer</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-text-dark mb-2">
              Gebruikersnaam
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-colors"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-dark mb-2">
              Wachtwoord
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-colors"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 px-4 rounded-lg hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? 'Bezig met inloggen...' : 'Inloggen'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-neutral text-sm mb-3">
            Nog geen account?{' '}
            <button
              onClick={() => navigate('/register')}
              className="text-primary hover:text-secondary transition-colors font-medium"
            >
              Registreer hier
            </button>
          </p>
          <button
            onClick={() => navigate('/')}
            className="text-neutral hover:text-primary transition-colors"
          >
            Terug naar startpagina
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

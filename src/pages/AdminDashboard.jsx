import React, { useState, useEffect } from 'react';
import { authHelpers } from '../db/supabaseService';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        if (!authHelpers.isAdmin()) {
          navigate('/dashboard');
          return;
        }

        const data = await authHelpers.getMetrics();
        setMetrics(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-neutral text-xl">Metrics laden...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl max-w-md">
          <h3 className="font-semibold mb-2">Fout bij laden</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-surface shadow-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <img src="/favicon.ico" alt="QuizKeeper" className="w-10 h-10" />
              <div>
                <h1 className="text-3xl font-bold text-primary">QuizKeeper Admin</h1>
                <p className="text-neutral">Administrator Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-neutral hover:text-text-dark border border-border px-4 py-2 rounded-lg hover:bg-background transition-colors"
              >
                Terug naar Dashboard
              </button>
              <button
                onClick={() => {
                  authHelpers.logout();
                  navigate('/');
                }}
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition-colors"
              >
                Uitloggen
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">🛡️ Administrator Dashboard</h2>
              <p className="text-blue-100 text-lg">
                Overzicht van alle platform statistieken en metrics
              </p>
            </div>
            <div className="hidden md:block">
              <div className="text-6xl opacity-20">📊</div>
            </div>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral text-sm font-medium">Totaal Gebruikers</p>
                <p className="text-3xl font-bold text-text-dark">{metrics?.totalUsers || 0}</p>
              </div>
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral text-sm font-medium">Totaal Quizzen</p>
                <p className="text-3xl font-bold text-text-dark">{metrics?.totalQuizzes || 0}</p>
              </div>
              <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral text-sm font-medium">Quizzen Deze Maand</p>
                <p className="text-3xl font-bold text-text-dark">{metrics?.quizzesThisMonth || 0}</p>
              </div>
              <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral text-sm font-medium">Totaal Teams</p>
                <p className="text-3xl font-bold text-text-dark">{metrics?.totalTeams || 0}</p>
              </div>
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Overview */}
        <div className="bg-surface border border-border rounded-xl shadow-sm">
          <div className="p-6 border-b border-border">
            <h3 className="text-xl font-semibold text-text-dark">Platform Overzicht</h3>
            <p className="text-neutral mt-1">Gedetailleerde statistieken van het QuizKeeper platform</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border">
                <span className="text-neutral">Platform heeft {metrics?.totalUsers || 0} geregistreerde gebruikers</span>
                <span className="text-success">👥 Gebruikers</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <span className="text-neutral">In totaal zijn er {metrics?.totalQuizzes || 0} quizzen aangemaakt</span>
                <span className="text-primary">🎯 Quizzen</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <span className="text-neutral">Deze maand zijn er {metrics?.quizzesThisMonth || 0} nieuwe quizzen toegevoegd</span>
                <span className="text-accent">📅 Deze maand</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-neutral">Er zijn in totaal {metrics?.totalTeams || 0} teams geregistreerd</span>
                <span className="text-secondary">👥 Teams</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;

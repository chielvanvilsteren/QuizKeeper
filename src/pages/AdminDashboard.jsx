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
      <div className="min-h-screen bg-[#D0B9A7] flex items-center justify-center">
        <div className="text-[#714329] text-xl">Metrics laden...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#D0B9A7] flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#D0B9A7]">
      {/* Header */}
      <header className="bg-[#714329] text-white py-6">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img src="/favicon.ico" alt="QuizKeeper" className="w-8 h-8" />
            <h1 className="text-2xl font-bold">QuizKeeper Admin</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-white hover:text-[#D0B9A7] transition-colors"
            >
              Terug naar Dashboard
            </button>
            <button
              onClick={() => {
                authHelpers.logout();
                navigate('/');
              }}
              className="bg-[#B08463] text-white px-4 py-2 rounded-lg hover:bg-[#B9937B] transition-colors"
            >
              Uitloggen
            </button>
          </div>
        </div>
      </header>

      {/* Admin Dashboard Content */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-[#714329] mb-8">Admin Dashboard</h2>

        {/* Metrics Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#D0B9A7] border-2 border-black rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-black text-sm font-medium">Totaal Gebruikers</p>
                <p className="text-3xl font-bold text-[#714329]">{metrics?.totalUsers || 0}</p>
              </div>
              <div className="w-12 h-12 bg-[#B08463] rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-[#D0B9A7] border-2 border-black rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-black text-sm font-medium">Totaal Quizzen</p>
                <p className="text-3xl font-bold text-[#714329]">{metrics?.totalQuizzes || 0}</p>
              </div>
              <div className="w-12 h-12 bg-[#B08463] rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-[#D0B9A7] border-2 border-black rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-black text-sm font-medium">Quizzen Deze Maand</p>
                <p className="text-3xl font-bold text-[#714329]">{metrics?.quizzesThisMonth || 0}</p>
              </div>
              <div className="w-12 h-12 bg-[#B08463] rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-[#D0B9A7] border-2 border-black rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-black text-sm font-medium">Totaal Teams</p>
                <p className="text-3xl font-bold text-[#714329]">{metrics?.totalTeams || 0}</p>
              </div>
              <div className="w-12 h-12 bg-[#B08463] rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Admin Info */}
        <div className="bg-[#D0B9A7] border-2 border-black rounded-lg p-6 shadow-lg">
          <h3 className="text-xl font-semibold text-[#714329] mb-4">Platform Overzicht</h3>
          <div className="text-[#B5A192] space-y-2">
            <p>• Platform heeft {metrics?.totalUsers || 0} geregistreerde gebruikers</p>
            <p>• In totaal zijn er {metrics?.totalQuizzes || 0} quizzen aangemaakt</p>
            <p>• Deze maand zijn er {metrics?.quizzesThisMonth || 0} nieuwe quizzen toegevoegd</p>
            <p>• Er zijn in totaal {metrics?.totalTeams || 0} teams geregistreerd</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authHelpers } from '../db/supabaseService';

function ActivationPage() {
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const activateAccount = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setStatus('error');
        setMessage('Geen activatietoken gevonden in de URL');
        return;
      }

      try {
        const result = await authHelpers.activateAccount(token);

        setStatus('success');
        setMessage('Je account is succesvol geactiveerd!');
        setUser(result.user);

      } catch (error) {
        console.error('Account activation failed:', error.message);
        setStatus('error');
        setMessage(error.message);
      }
    };

    activateAccount();
  }, [searchParams]);

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  const handleResendActivation = async () => {
    const email = prompt('Voer je email adres in om een nieuwe activatielink te ontvangen:');

    if (!email) return;

    try {
      await authHelpers.resendActivationEmail(email);
      alert('Een nieuwe activatielink is verzonden naar je email adres!');
    } catch (error) {
      alert('Fout: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#D0B9A7] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-[#D0B9A7] border-2 border-black rounded-lg shadow-lg p-8">
        <div className="text-center">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-center mb-4">
              <img src="/favicon.ico" alt="QuizKeeper" className="w-12 h-12 mr-3" />
              <h1 className="text-2xl font-bold text-[#714329]">QuizKeeper</h1>
            </div>
            <h2 className="text-xl font-semibold text-[#714329]">Account Activatie</h2>
          </div>

          {/* Loading State */}
          {status === 'loading' && (
            <div className="py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B08463] mx-auto mb-4"></div>
              <p className="text-black">Account activeren...</p>
            </div>
          )}

          {/* Success State */}
          {status === 'success' && (
            <div className="py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-green-600 mb-2">Gelukt!</h3>
              <p className="text-[#714329] mb-6">{message}</p>
              {user && (
                <div className="bg-[#D0B9A7] rounded-lg p-4 mb-6">
                  <p className="text-[#714329]">
                    <strong>Welkom, {user.username}!</strong><br />
                    Je kunt nu inloggen en beginnen met het maken van pubquizzen.
                  </p>
                </div>
              )}
              <button
                onClick={handleLoginRedirect}
                className="w-full bg-[#B08463] text-white py-3 px-4 rounded-lg hover:bg-[#B9937B] transition-colors font-medium"
              >
                Naar inlogpagina
              </button>
            </div>
          )}

          {/* Error State */}
          {status === 'error' && (
            <div className="py-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-red-600 mb-2">Activatie mislukt</h3>
              <p className="text-[#714329] mb-6">{message}</p>

              <div className="space-y-3">
                <button
                  onClick={handleResendActivation}
                  className="w-full bg-[#B08463] text-white py-3 px-4 rounded-lg hover:bg-[#B9937B] transition-colors font-medium"
                >
                  Nieuwe activatielink aanvragen
                </button>

                <button
                  onClick={() => navigate('/login')}
                  className="w-full border border-[#B08463] text-[#B08463] py-3 px-4 rounded-lg hover:bg-[#B08463] hover:text-white transition-colors font-medium"
                >
                  Terug naar inloggen
                </button>

                <button
                  onClick={() => navigate('/')}
                  className="w-full text-black py-2 hover:text-[#714329] transition-colors"
                >
                  Terug naar startpagina
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ActivationPage;

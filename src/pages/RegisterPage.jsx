import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authHelpers } from '../db/supabaseService';
import { emailService } from '../services/emailService';
import { useModalContext } from '../components/ModalProvider';

function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ isValid: false, errors: [] });
  const navigate = useNavigate();

  const { showSuccess, showError, alertModal, closeAlert } = useModalContext();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Check password strength in real-time
    if (field === 'password') {
      const strength = authHelpers.validatePassword(value);
      setPasswordStrength(strength);
    }
  };

  const generatePassword = () => {
    const newPassword = authHelpers.generatePassword(14);
    setFormData(prev => ({ ...prev, password: newPassword, confirmPassword: newPassword }));
    setPasswordStrength(authHelpers.validatePassword(newPassword));
    setShowPassword(true);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(formData.password);
      showSuccess('Wachtwoord gekopieerd naar klembord!');
    } catch (error) {
      console.error('Failed to copy password:', error);
      showError('Kon wachtwoord niet kopiëren naar klembord');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Gebruikersnaam is verplicht';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Gebruikersnaam moet minimaal 3 karakters lang zijn';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email adres is verplicht';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Voer een geldig email adres in';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Wachtwoord is verplicht';
    } else if (!passwordStrength.isValid) {
      newErrors.password = 'Wachtwoord voldoet niet aan de eisen';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Bevestig je wachtwoord';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Wachtwoorden komen niet overeen';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setLoading(true);
    try {
      const user = await authHelpers.register({
        username: formData.username,
        email: formData.email,
        password: formData.password
      });

      // Show success message with activation instructions
      showSuccess(
        `Een activatielink is verzonden naar ${user.email}.\n\nControleer je inbox en klik op de link om je account te activeren.\n\nLet op: Je kunt pas inloggen nadat je je account hebt geactiveerd.`,
        'Account succesvol aangemaakt!'
      );

      // Navigate to login after user closes the modal
      setTimeout(() => {
        navigate('/login');
      }, 3000); // Give time for user to read the success message

    } catch (error) {
      showError(error.message, 'Registratie mislukt');
      setErrors({ general: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-blue-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full bg-surface border border-border rounded-xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img src="/favicon.ico" alt="QuizKeeper" className="w-10 h-10 mr-3" />
            <h1 className="text-2xl font-bold text-primary">QuizKeeper</h1>
          </div>
          <h2 className="text-3xl font-bold text-text-dark mb-2">Account Aanmaken</h2>
          <p className="text-neutral">Maak je QuizKeeper account aan</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-text-dark mb-2">
              Gebruikersnaam
            </label>
            <input
              type="text"
              id="username"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-colors"
              required
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">{errors.username}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-dark mb-2">
              Email Adres
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-colors"
              required
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-dark mb-2">
              Wachtwoord
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full px-4 py-3 pr-12 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-neutral hover:text-text-dark transition-colors"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>

            {/* Password Generator */}
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={generatePassword}
                className="text-sm bg-primary text-white px-3 py-1 rounded hover:bg-secondary transition-colors"
              >
                🎲 Genereer Sterk Wachtwoord
              </button>
              {formData.password && (
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="text-sm bg-neutral text-white px-3 py-1 rounded hover:bg-text-dark transition-colors"
                >
                  📋 Kopieer
                </button>
              )}
            </div>

            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="mt-2">
                <div className={`text-sm font-medium ${passwordStrength.isValid ? 'text-green-600' : 'text-red-600'}`}>
                  {passwordStrength.isValid ? '✅ Sterk wachtwoord' : '❌ Wachtwoord te zwak'}
                </div>
                {!passwordStrength.isValid && passwordStrength.errors.length > 0 && (
                  <ul className="text-xs text-red-500 mt-1 space-y-1">
                    {passwordStrength.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-dark mb-2">
              Bevestig Wachtwoord
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-colors"
              required
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          {/* General Error */}
          {errors.general && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              {errors.general}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 px-4 rounded-lg hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? 'Account aanmaken...' : 'Account Aanmaken'}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-neutral text-sm">
            Heb je al een account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-primary hover:text-secondary transition-colors font-medium"
            >
              Inloggen
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;

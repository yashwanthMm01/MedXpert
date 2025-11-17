import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2, ArrowLeft, Lock } from 'lucide-react';
import { verifyEmail, verifyUHID, resetPassword } from '../utils/auth';
import VoiceInput from './VoiceInput';

interface ForgotPasswordProps {
  type: 'doctor' | 'patient' | 'medical';
  onBack: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ type, onBack }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'verify' | 'reset'>('verify');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      let isValid = false;
      
      if (type === 'patient') {
        isValid = await verifyUHID(identifier);
        if (!isValid) {
          setError('Invalid UHID. Please check and try again.');
        }
      } else {
        isValid = await verifyEmail(identifier);
        if (!isValid) {
          setError('Email not found. Please check and try again.');
        }
      }

      if (isValid) {
        setStep('reset');
      }
    } catch (err) {
      setError('An error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      const success = await resetPassword(identifier, password);
      if (success) {
        // Redirect based on user type
        navigate('/login', {
          state: { 
            message: 'Password has been reset successfully. Please login with your new password.',
            userType: type
          }
        });
      } else {
        throw new Error('Failed to reset password');
      }
    } catch (err) {
      setError('Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-8 rounded-lg">
      <button
        onClick={onBack}
        className="text-purple-400 hover:text-purple-300 mb-6 flex items-center gap-2"
      >
        <ArrowLeft size={20} />
        Back to login
      </button>

      <div className="flex justify-center mb-6">
        <Lock className="h-12 w-12 text-purple-500" />
      </div>

      <h3 className="text-xl font-bold text-white mb-6 text-center">
        Reset Your Password
      </h3>

      {step === 'verify' ? (
        <form onSubmit={handleVerify} className="space-y-6">
          {error && (
            <div className="flex items-center p-4 text-red-500 bg-red-900/20 rounded-md">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              {type === 'patient' ? 'UHID' : 'Email Address'}
            </label>
            <input
              type={type === 'patient' ? 'text' : 'email'}
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder={type === 'patient' ? 'Enter your UHID' : 'Enter your email'}
              maxLength={type === 'patient' ? 14 : undefined}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5" />
                Verifying...
              </>
            ) : (
              'Verify'
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleReset} className="space-y-6">
          {error && (
            <div className="flex items-center p-4 text-red-500 bg-red-900/20 rounded-md">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              New Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter new password"
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Confirm new password"
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5" />
                Updating Password...
              </>
            ) : (
              'Update Password'
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;
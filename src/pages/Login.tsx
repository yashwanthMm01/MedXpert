import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AlertCircle, Stethoscope, User, Pill, Loader2 } from 'lucide-react';
import { loginUser } from '../utils/auth';
import ForgotPassword from '../components/ForgotPassword';

interface LocationState {
  message?: string;
  userType?: 'doctor' | 'patient' | 'medical';
}

type UserRole = 'doctor' | 'patient' | 'medical';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(
    (location.state as LocationState)?.userType || null
  );
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState((location.state as LocationState)?.message || '');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Clear location state after reading it
  useEffect(() => {
    if (location.state) {
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (!identifier || !password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    try {
      if (loginUser(identifier, password)) {
        switch (selectedRole) {
          case 'doctor':
            navigate('/doctor/dashboard');
            break;
          case 'patient':
            navigate('/patient/dashboard');
            break;
          case 'medical':
            navigate('/medical/dashboard');
            break;
        }
      } else {
        setError('Invalid login credentials');
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const roleCards = [
    {
      role: 'doctor' as UserRole,
      title: 'Doctor Login',
      Icon: Stethoscope,
      description: 'Generate digital prescriptions and manage patient records efficiently',
      signupLink: '/doctor/signup',
      signupText: 'New doctor? Sign up here'
    },
    {
      role: 'patient' as UserRole,
      title: 'Patient Login',
      Icon: User,
      description: 'View your medical history and prescriptions',
      signupLink: '/patient/register',
      signupText: 'New patient? Register here'
    },
    {
      role: 'medical' as UserRole,
      title: 'Medical Store Login',
      Icon: Pill,
      description: 'Verify and process digital prescriptions seamlessly',
      signupLink: '/medical/signup',
      signupText: 'New medical store? Sign up here'
    }
  ];

  const selectedCard = roleCards.find(card => card.role === selectedRole);

  if (!selectedRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
              Sign in to your account
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {roleCards.map(({ role, title, Icon, description }) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className="bg-gray-800 p-6 rounded-lg text-left hover:bg-gray-700 transition-colors border-2 border-transparent hover:border-purple-500 focus:outline-none focus:border-purple-500"
              >
                <Icon className="h-12 w-12 text-purple-500 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                <p className="text-gray-400">{description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <ForgotPassword
            type={selectedRole}
            onBack={() => setShowForgotPassword(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <button
          onClick={() => setSelectedRole(null)}
          className="text-purple-400 hover:text-purple-300 mb-6 flex items-center gap-2"
        >
          ← Back to role selection
        </button>
        
        <div className="bg-gray-800 p-8 rounded-lg">
          {selectedCard && (
            <>
              <selectedCard.Icon className="h-12 w-12 text-purple-500 mb-4" />
              <h3 className="text-xl font-bold text-white mb-4">
                {selectedCard.title}
              </h3>
            </>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="flex items-center p-4 text-red-500 bg-red-900/20 rounded-md">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span>{error}</span>
              </div>
            )}
            
            {success && (
              <div className="flex items-center p-4 text-green-500 bg-green-900/20 rounded-md">
                <span>{success}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="identifier" className="block text-sm font-medium text-gray-300 mb-1">
                  {selectedRole === 'patient' ? 'UHID' : 'Email address'}
                </label>
                <input
                  id="identifier"
                  name="identifier"
                  type={selectedRole === 'patient' ? 'text' : 'email'}
                  autoComplete={selectedRole === 'patient' ? 'off' : 'email'}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder={selectedRole === 'patient' ? 'Enter your UHID' : 'Email address'}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  maxLength={selectedRole === 'patient' ? 14 : undefined}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-purple-400 hover:text-purple-300"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>

            {selectedCard && (
              <Link
                to={selectedCard.signupLink}
                className="block text-center text-sm text-purple-400 hover:text-purple-300 mt-4"
              >
                {selectedCard.signupText}
              </Link>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
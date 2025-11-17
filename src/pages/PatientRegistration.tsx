import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2 } from 'lucide-react';
import { getPatientByUHID } from '../utils/db';
import { registerPatientUser } from '../utils/auth';

const PatientRegistration: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    uhid: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // Verify UHID exists in the system
      const patient = await getPatientByUHID(formData.uhid);
      if (!patient) {
        throw new Error('UHID not found. Please contact your healthcare provider.');
      }

      // Register patient user
      const success = await registerPatientUser({
        uhid: formData.uhid,
        password: formData.password,
        name: patient.name,
        role: 'patient'
      });

      if (success) {
        navigate('/login', {
          state: { message: 'Registration successful. Please login with your UHID and password.' }
        });
      } else {
        throw new Error('UHID is already registered');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Patient Registration
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Register using your UHID provided by your healthcare provider
          </p>
          <p className="mt-2 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-purple-400 hover:text-purple-500">
              Sign in
            </Link>
          </p>
        </div>

        {error && (
          <div className="flex items-center p-4 text-red-500 bg-red-100 rounded-md">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="uhid" className="sr-only">UHID</label>
              <input
                id="uhid"
                name="uhid"
                type="text"
                required
                className="auth-input rounded-t-md"
                placeholder="Enter your UHID"
                value={formData.uhid}
                onChange={(e) => setFormData({ ...formData, uhid: e.target.value })}
                maxLength={14}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="auth-input"
                placeholder="Create password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="auth-input rounded-b-md"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  Registering...
                </>
              ) : (
                'Register'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientRegistration;
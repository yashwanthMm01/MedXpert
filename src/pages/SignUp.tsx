import React from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, Store } from 'lucide-react';

const SignUp: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Choose Registration Type
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-purple-400 hover:text-purple-500">
              Sign in
            </Link>
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Link
            to="/signup/doctor"
            className="bg-gray-800 p-8 rounded-lg text-center hover:bg-gray-700 transition-colors border-2 border-transparent hover:border-purple-500"
          >
            <Stethoscope className="h-12 w-12 text-purple-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Doctor Registration</h3>
            <p className="text-gray-400">Register as a healthcare provider</p>
          </Link>

          <Link
            to="/signup/medical"
            className="bg-gray-800 p-8 rounded-lg text-center hover:bg-gray-700 transition-colors border-2 border-transparent hover:border-purple-500"
          >
            <Store className="h-12 w-12 text-purple-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Medical Store Registration</h3>
            <p className="text-gray-400">Register your pharmacy or medical store</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
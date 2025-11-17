import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, User, Pill, Shield, Heart, Clock } from 'lucide-react';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleDoctorSignUp = () => {
    navigate('/doctor/signup');
  };

  const handleMedicalSignUp = () => {
    navigate('/medical/signup');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <div className="animate-fade-in">
              <h1 className="text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
                Welcome to MedXpert
              </h1>
              <p className="text-2xl mb-10 text-purple-100">
                Revolutionizing Healthcare Management
              </p>
              <button 
                onClick={handleLogin}
                className="bg-white hover:bg-purple-50 text-lg font-bold px-10 py-4 rounded-full transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl shadow-lg relative overflow-hidden group"
              >
                <span className="relative z-10 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Get Started
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-purple-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            </div>
          </div>

          {/* Role Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <button
              onClick={handleDoctorSignUp}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl p-8 text-center border border-white/20 hover:transform hover:scale-105 transition duration-300 shadow-xl"
            >
              <div className="bg-gradient-to-br from-indigo-500 to-purple-500 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Stethoscope size={32} className="text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Doctors</h3>
              <p className="text-purple-100">Generate digital prescriptions and manage patient records efficiently</p>
            </button>

            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl p-8 text-center border border-white/20 hover:transform hover:scale-105 transition duration-300 shadow-xl">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <User size={32} className="text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Patients</h3>
              <p className="text-purple-100">Access their medical history and prescriptions anytime</p>
            </div>

            <button
              onClick={handleMedicalSignUp}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl p-8 text-center border border-white/20 hover:transform hover:scale-105 transition duration-300 shadow-xl"
            >
              <div className="bg-gradient-to-br from-pink-500 to-rose-500 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Pill size={32} className="text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Medical Stores</h3>
              <p className="text-purple-100">Verify and process digital prescriptions seamlessly</p>
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gradient-to-b from-gray-900 to-indigo-900 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-white mb-16">Why Choose MedXpert?</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl p-8 backdrop-blur-lg border border-indigo-500/20 hover:transform hover:scale-105 transition duration-300">
              <Heart className="text-pink-400 w-12 h-12 mb-6" />
              <h3 className="text-2xl font-semibold mb-3 text-white">Smart Healthcare</h3>
              <p className="text-indigo-200">Digitaly generated prescription management for better patient care.</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl p-8 backdrop-blur-lg border border-purple-500/20 hover:transform hover:scale-105 transition duration-300">
              <Shield className="text-purple-400 w-12 h-12 mb-6" />
              <h3 className="text-2xl font-semibold mb-3 text-white">Secure Records</h3>
              <p className="text-indigo-200">End-to-end encrypted patient data with uhid protection.</p>
            </div>
            <div className="bg-gradient-to-br from-pink-500/10 to-rose-500/10 rounded-2xl p-8 backdrop-blur-lg border border-pink-500/20 hover:transform hover:scale-105 transition duration-300">
              <Clock className="text-indigo-400 w-12 h-12 mb-6" />
              <h3 className="text-2xl font-semibold mb-3 text-white">Real-time Access</h3>
              <p className="text-indigo-200">Instant access to medical records anytime, anywhere.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
            Ready to Transform Healthcare?
          </h2>
          <p className="text-2xl mb-10 text-purple-100">
            Join MedXpert and be part of India's digital health revolution.
          </p>
          <button 
            onClick={handleLogin}
            className="bg-white hover:bg-purple-50 text-lg font-bold px-10 py-4 rounded-full transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl shadow-lg relative overflow-hidden group"
          >
            <span className="relative z-10 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Get Started Now
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-purple-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
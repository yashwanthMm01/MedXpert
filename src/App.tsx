import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import DoctorSignUp from './pages/DoctorSignUp';
import MedicalSignUp from './pages/MedicalSignUp';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientDashboard from './pages/PatientDashboard';
import MedicalDashboard from './pages/MedicalDashboard';
import PatientRegistration from './pages/PatientRegistration';
import ResetPassword from './pages/ResetPassword';
import NewPrescription from './components/NewPrescription';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/doctor/signup" element={<DoctorSignUp />} />
            <Route path="/medical/signup" element={<MedicalSignUp />} />
            <Route path="/doctor/dashboard/*" element={<DoctorDashboard />} />
            <Route path="/patient/dashboard/*" element={<PatientDashboard />} />
            <Route path="/patient/register" element={<PatientRegistration />} />
            <Route path="/medical/dashboard/*" element={<MedicalDashboard />} />
            <Route path="/reset-password/:type/:identifier" element={<ResetPassword />} />
            <Route path="/new-prescription" element={<NewPrescription onRegisterClick={() => {}} />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
import React, { useState } from 'react';
import { AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { registerPatient, getPatientByAadhaar } from '../utils/db';

interface PatientRegistrationProps {
  onRegistrationComplete: (uhid: string) => void;
}

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const PatientRegistration: React.FC<PatientRegistrationProps> = ({ onRegistrationComplete }) => {
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    dateOfBirth: '',
    bloodGroup: '',
    aadhaar: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState<{ uhid: string } | null>(null);

  const calculateAge = (dob: string): number => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    // Ensure year is limited to 4 digits
    if (value.includes('-')) {
      const [year, ...rest] = value.split('-');
      if (year.length > 4) {
        value = year.slice(0, 4) + '-' + rest.join('-');
      }
    }
    setFormData({ ...formData, dateOfBirth: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setRegistrationSuccess(null);

    try {
      if (!/^\d{12}$/.test(formData.aadhaar)) {
        throw new Error('Please enter a valid 12-digit Aadhaar number');
      }

      const existingPatient = await getPatientByAadhaar(formData.aadhaar);
      if (existingPatient) {
        throw new Error('Patient with this Aadhaar number already exists. UHID: ' + existingPatient.uhid);
      }

      const age = calculateAge(formData.dateOfBirth);
      
      const uhid = await registerPatient({
        name: formData.name,
        gender: formData.gender as 'male' | 'female' | 'other',
        age,
        dateOfBirth: formData.dateOfBirth,
        bloodGroup: formData.bloodGroup,
        aadhaar: formData.aadhaar,
      });

      setRegistrationSuccess({ uhid });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    if (registrationSuccess) {
      onRegistrationComplete(registrationSuccess.uhid);
    }
  };

  if (registrationSuccess) {
    return (
      <div className="max-w-2xl mx-auto bg-gray-800 p-8 rounded-lg shadow-lg">
        <div className="text-center space-y-4">
          <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
          <h2 className="text-2xl font-bold text-white">Registration Successful!</h2>
          <div className="bg-gray-700 p-4 rounded-lg">
            <p className="text-gray-300 mb-2">Patient UHID:</p>
            <p className="text-2xl font-mono text-white">{registrationSuccess.uhid}</p>
          </div>
          <p className="text-gray-300">
            Please save this UHID for future reference. You'll need it for prescriptions and records.
          </p>
          <button
            onClick={handleContinue}
            className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors mt-4"
          >
            Continue to Prescription
          </button>
        </div>
      </div>
    );
  }

  const maxDate = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-2xl mx-auto bg-gray-800 p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-white mb-6">Patient Registration</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200 flex items-center">
          <AlertCircle className="mr-2" size={20} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-300 mb-2">Full Name</label>
          <input
            type="text"
            required
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-2">Gender</label>
          <select
            required
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            value={formData.gender}
            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-300 mb-2">Date of Birth</label>
          <input
            type="date"
            required
            max={maxDate}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            value={formData.dateOfBirth}
            onChange={handleDateChange}
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-2">Blood Group</label>
          <select
            required
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            value={formData.bloodGroup}
            onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
          >
            <option value="">Select Blood Group</option>
            {BLOOD_GROUPS.map(group => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-300 mb-2">Aadhaar Number</label>
          <input
            type="text"
            required
            pattern="\d{12}"
            maxLength={12}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            value={formData.aadhaar}
            onChange={(e) => setFormData({ ...formData, aadhaar: e.target.value.replace(/\D/g, '').slice(0, 12) })}
            placeholder="Enter 12-digit Aadhaar number"
          />
        </div>

        <div className="flex justify-between items-center">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Registering...
              </>
            ) : (
              'Register Patient'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PatientRegistration;
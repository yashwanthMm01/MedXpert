import React, { useState, useEffect } from 'react';
import { Search, Plus, Save, AlertCircle, Loader2, X, ShoppingCart } from 'lucide-react';
import DrawingCanvas from './DrawingCanvas';
import VoiceInput from './VoiceInput';
import { drugList } from '../utils/drugList';
import { getPatientByUHID, saveRecord, savePrescription } from '../utils/db';
import { generatePrescription } from '../utils/pdf';
import { findClosestDrug } from '../utils/textRecognition';
import { getCurrentUser } from '../utils/auth';
import type { Patient, Prescription, Doctor } from '../utils/db';

interface NewPrescriptionProps {
  onRegisterClick: () => void;
  initialUHID?: string;
}

const NewPrescription: React.FC<NewPrescriptionProps> = ({ onRegisterClick, initialUHID = '' }) => {
  const [uhid, setUhid] = useState(initialUHID);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [doctorInfo, setDoctorInfo] = useState<Doctor | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [currentMedicine, setCurrentMedicine] = useState<Partial<Medicine>>({});
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [medicalHistory, setMedicalHistory] = useState({
    allergies: '',
    symptoms: '',
    hereditaryDiseases: ''
  });

  useEffect(() => {
    const user = getCurrentUser();
    if (user && user.role === 'doctor') {
      setDoctorInfo({
        name: user.name,
        email: user.email,
        doctorId: user.doctorId,
        department: user.department,
        role: user.role
      });
    }
  }, []);

  useEffect(() => {
    if (initialUHID) {
      setUhid(initialUHID);
      handleUHIDSearch(initialUHID);
    }
  }, [initialUHID]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = drugList.filter(drug => 
        drug.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  }, [searchTerm]);

  const handleUHIDSearch = async (searchUHID: string = uhid) => {
    if (searchUHID.length !== 14) {
      setError('Please enter a valid 14-digit UHID');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const patientData = await getPatientByUHID(searchUHID);
      if (patientData) {
        setPatient(patientData);
        setError('');
      } else {
        setError('Patient not found');
        setPatient(null);
      }
    } catch (err) {
      setError('Error fetching patient data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = (field: keyof typeof medicalHistory) => (text: string) => {
    setMedicalHistory(prev => ({
      ...prev,
      [field]: text
    }));
  };

  const handleDrawingComplete = async (_imageData: string, recognizedText: string) => {
    setIsAnalyzing(true);
    try {
      if (recognizedText) {
        setCurrentMedicine({ ...currentMedicine, name: recognizedText });
        setSuggestions([]);
        setSearchTerm('');
      }
    } catch (err) {
      setError('Error analyzing handwriting');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleBookMedicine = () => {
    if (!patient || medicines.length === 0) {
      setError('Please add at least one medicine to book');
      return;
    }

    window.open('https://www.apollopharmacy.in/upload-prescription', '_blank');
  };

  const addMedicine = () => {
    if (!currentMedicine.name || !currentMedicine.dosage || !currentMedicine.days) {
      setError('Please fill all medicine details');
      return;
    }

    const newMedicine: Medicine = {
      id: Date.now().toString(),
      name: currentMedicine.name,
      timing: currentMedicine.timing || [],
      beforeFood: currentMedicine.beforeFood || false,
      dosage: currentMedicine.dosage,
      days: currentMedicine.days,
    };

    setMedicines(prev => [...prev, newMedicine]);
    setCurrentMedicine({});
    setSearchTerm('');
    setSuggestions([]);
  };

  const removeMedicine = (id: string) => {
    setMedicines(prev => prev.filter(med => med.id !== id));
  };

  const handleSavePrescription = async () => {
    if (!patient || medicines.length === 0 || !doctorInfo) {
      setError('Please add at least one medicine and ensure all details are present');
      return;
    }
    
    setIsSaving(true);
    setError('');

    try {
      await savePrescription({
        uhid,
        medicines,
        doctor: doctorInfo,
        ...medicalHistory,
        createdAt: new Date()
      });

      const prescriptionData = {
        uhid,
        patientName: patient.name,
        patientAge: patient.age,
        patientGender: patient.gender,
        medicines,
        doctor: {
          name: doctorInfo.name,
          doctorId: doctorInfo.doctorId,
          department: doctorInfo.department,
          role: doctorInfo.role
        },
        ...medicalHistory,
        date: new Date().toLocaleDateString()
      };

      const doc = generatePrescription(prescriptionData);
      const pdfData = doc.output('datauristring');

      const currentDate = new Date().toISOString().split('T')[0];
      const title = `Prescription_${currentDate}`;

      await saveRecord({
        uhid,
        type: 'pdf',
        title,
        data: pdfData,
        createdAt: new Date()
      });

      setMedicines([]);
      setCurrentMedicine({});
      setMedicalHistory({
        allergies: '',
        symptoms: '',
        hereditaryDiseases: ''
      });
      
      doc.save(`${title}.pdf`);
    } catch (err) {
      setError('Failed to save prescription');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-8">
      <div className="bg-gray-800 p-6 rounded-lg">
        <div className="flex gap-4 items-end mb-6">
          <div className="flex-1">
            <label className="block text-gray-300 mb-2">Patient UHID</label>
            <input
              type="text"
              value={uhid}
              onChange={(e) => setUhid(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              placeholder="Enter 14-digit UHID"
              maxLength={14}
            />
          </div>
          <button
            onClick={() => handleUHIDSearch()}
            disabled={isLoading}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200 flex items-center">
            <AlertCircle className="mr-2" size={20} />
            <span>{error}</span>
          </div>
        )}

        {!patient && !error && !isLoading && (
          <button
            onClick={onRegisterClick}
            className="text-purple-400 hover:text-purple-300"
          >
            Patient not found? Register here
          </button>
        )}

        {patient && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-700 p-4 rounded-lg">
              <span className="block text-gray-400 text-sm">Name</span>
              <span className="text-white">{patient.name}</span>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <span className="block text-gray-400 text-sm">Age</span>
              <span className="text-white">{patient.age} years</span>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <span className="block text-gray-400 text-sm">Gender</span>
              <span className="text-white">{patient.gender}</span>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <span className="block text-gray-400 text-sm">Aadhaar</span>
              <span className="text-white">XXXX-XXXX-{patient.aadhaar.slice(-4)}</span>
            </div>
          </div>
        )}
      </div>

      {patient && (
        <>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-white mb-4">Medical History</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Symptoms</label>
                <div className="space-y-2">
                  <textarea
                    value={medicalHistory.symptoms}
                    onChange={(e) => setMedicalHistory(prev => ({ ...prev, symptoms: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white resize-none"
                    rows={3}
                    placeholder="Enter current symptoms..."
                  />
                  <VoiceInput onResult={handleVoiceInput('symptoms')} />
                </div>
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Allergies</label>
                <div className="space-y-2">
                  <textarea
                    value={medicalHistory.allergies}
                    onChange={(e) => setMedicalHistory(prev => ({ ...prev, allergies: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white resize-none"
                    rows={3}
                    placeholder="Enter known allergies..."
                  />
                  <VoiceInput onResult={handleVoiceInput('allergies')} />
                </div>
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Hereditary Diseases</label>
                <div className="space-y-2">
                  <textarea
                    value={medicalHistory.hereditaryDiseases}
                    onChange={(e) => setMedicalHistory(prev => ({ ...prev, hereditaryDiseases: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white resize-none"
                    rows={3}
                    placeholder="Enter hereditary diseases..."
                  />
                  <VoiceInput onResult={handleVoiceInput('hereditaryDiseases')} />
                </div>
              </div>
            </div>
          </div>

          {medicines.length > 0 && (
            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-white">Current Prescription</h3>
                <div className="flex gap-4">
                  <button
                    onClick={handleBookMedicine}
                    className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
                  >
                    <ShoppingCart size={20} />
                    Book Medicine
                  </button>
                  <button
                    onClick={handleSavePrescription}
                    disabled={isSaving}
                    className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={20} />
                        Save Prescription
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-white">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="p-4">S.No.</th>
                      <th className="p-4">Medicine</th>
                      <th className="p-4">Timing</th>
                      <th className="p-4">Food</th>
                      <th className="p-4">Dosage</th>
                      <th className="p-4">Days</th>
                      <th className="p-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicines.map((medicine, index) => (
                      <tr key={medicine.id} className="border-b border-gray-700">
                        <td className="p-4">{index + 1}</td>
                        <td className="p-4">{medicine.name}</td>
                        <td className="p-4">{medicine.timing.join(', ')}</td>
                        <td className="p-4">{medicine.beforeFood ? 'Before' : 'After'}</td>
                        <td className="p-4">{medicine.dosage}</td>
                        <td className="p-4">{medicine.days}</td>
                        <td className="p-4">
                          <button
                            onClick={() => removeMedicine(medicine.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <X size={20} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-white">Draw Medicine Name</h3>
                {isAnalyzing && (
                  <span className="text-purple-400">Analyzing...</span>
                )}
              </div>
              <DrawingCanvas onDrawingComplete={handleDrawingComplete} />
            </div>

            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-white mb-4">Medicine Details</h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-gray-300 mb-2">Search Medicine</label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    placeholder="Type to search medicines..."
                  />
                </div>

                <VoiceInput onResult={(text) => {
                  setSearchTerm(text);
                  const matchedDrug = findClosestDrug(text);
                  if (matchedDrug) {
                    setCurrentMedicine({ ...currentMedicine, name: matchedDrug });
                  }
                }} />
              </div>

              {(suggestions.length > 0 || currentMedicine.name) && (
                <div className="space-y-4">
                  {!currentMedicine.name && suggestions.map((drug) => (
                    <button
                      key={drug}
                      onClick={() => setCurrentMedicine({ ...currentMedicine, name: drug })}
                      className="block w-full text-left px-4 py-2 bg-gray-700 rounded-lg text-white hover:bg-gray-600"
                    >
                      {drug}
                    </button>
                  ))}

                  {currentMedicine.name && (
                    <>
                      <div>
                        <label className="block text-gray-300 mb-2">Selected Medicine</label>
                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-lg">
                          <span className="text-white flex-1">{currentMedicine.name}</span>
                          <button
                            onClick={() => setCurrentMedicine({})}
                            className="text-gray-400 hover:text-gray-300"
                          >
                            <X size={20} />
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-300 mb-2">Timing</label>
                        <div className="flex gap-4">
                          {['morning', 'afternoon', 'evening'].map((time) => (
                            <button
                              key={time}
                              onClick={() => {
                                const timing = currentMedicine.timing || [];
                                const newTiming = timing.includes(time as any)
                                  ? timing.filter(t => t !== time)
                                  : [...timing, time];
                                setCurrentMedicine({ ...currentMedicine, timing: newTiming as any[] });
                              }}
                              className={`px-4 py-2 rounded-lg ${
                                currentMedicine.timing?.includes(time as any)
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-gray-700 text-gray-300'
                              }`}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-300 mb-2">Food Preference</label>
                        <div className="flex gap-4">
                          <button
                            onClick={() => setCurrentMedicine({ ...currentMedicine, beforeFood: true })}
                            className={`px-4 py-2 rounded-lg ${
                              currentMedicine.beforeFood
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-700 text-gray-300'
                            }`}
                          >
                            Before Food
                          </button>
                          <button
                            onClick={() => setCurrentMedicine({ ...currentMedicine, beforeFood: false })}
                            className={`px-4 py-2 rounded-lg ${
                              currentMedicine.beforeFood === false
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-700 text-gray-300'
                            }`}
                          >
                            After Food
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-300 mb-2">Dosage</label>
                        <input
                          type="text"
                          value={currentMedicine.dosage || ''}
                          onChange={(e) => setCurrentMedicine({ ...currentMedicine, dosage: e.target.value })}
                          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                          placeholder="e.g., 1 tablet"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-300 mb-2">Number of Days</label>
                        <input
                          type="number"
                          value={currentMedicine.days || ''}
                          onChange={(e) => setCurrentMedicine({ ...currentMedicine, days: parseInt(e.target.value) })}
                          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                          min="1"
                        />
                      </div>

                      <button
                        onClick={addMedicine}
                        className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Plus size={20} />
                        Add Medicine
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NewPrescription;
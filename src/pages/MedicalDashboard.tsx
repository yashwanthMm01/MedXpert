import React, { useState } from 'react';
import { Search, FileText, AlertCircle, Loader2, X } from 'lucide-react';
import { getPatientByUHID, getPrescriptionsByUHID } from '../utils/db';
import { generatePrescription } from '../utils/pdf';
import type { Patient, Prescription } from '../utils/db';

const MedicalDashboard: React.FC = () => {
  const [uhid, setUhid] = useState('');
  const [patient, setPatient] = useState<Patient | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState<{
    title: string;
    data: string;
  } | null>(null);

  const handleSearch = async () => {
    if (uhid.length !== 14) {
      setError('Please enter a valid 14-digit UHID');
      return;
    }

    setIsLoading(true);
    setError('');
    setPatient(null);
    setPrescriptions([]);

    try {
      const patientData = await getPatientByUHID(uhid);
      if (!patientData) {
        setError('Patient not found');
        return;
      }
      setPatient(patientData);

      const prescriptionData = await getPrescriptionsByUHID(uhid);
      setPrescriptions(prescriptionData);
    } catch (err) {
      setError('Error fetching patient data');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = async (prescription: Prescription) => {
    if (!patient) return;

    const prescriptionData = {
      uhid: patient.uhid,
      patientName: patient.name,
      patientAge: patient.age,
      patientGender: patient.gender,
      medicines: prescription.medicines,
      allergies: prescription.allergies || '',
      symptoms: prescription.symptoms || '',
      hereditaryDiseases: prescription.hereditaryDiseases || '',
      date: new Date(prescription.createdAt).toLocaleDateString(),
      doctor: prescription.doctor || {
        name: 'Unknown Doctor',
        doctorId: 'N/A',
        department: 'N/A',
        role: 'N/A'
      }
    };

    const doc = generatePrescription(prescriptionData);
    const pdfData = doc.output('datauristring');
    
    setPreviewData({
      title: `Prescription - ${new Date(prescription.createdAt).toLocaleDateString()}`,
      data: pdfData
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl font-bold text-white mb-6">Medical Store Dashboard</h2>
          
          <div className="flex gap-4 items-end">
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
              onClick={handleSearch}
              disabled={isLoading}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Searching...
                </>
              ) : (
                <>
                  <Search size={20} />
                  Search
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200 flex items-center">
              <AlertCircle className="mr-2" size={20} />
              <span>{error}</span>
            </div>
          )}
        </div>

        {patient && (
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-white mb-4">Patient Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
                <span className="block text-gray-400 text-sm">UHID</span>
                <span className="text-white">{patient.uhid}</span>
              </div>
            </div>

            {prescriptions.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No prescriptions found for this patient
              </div>
            ) : (
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-white mb-3">Prescriptions</h4>
                {prescriptions.map((prescription, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <FileText className="text-purple-400" size={24} />
                      <div>
                        <h4 className="text-white font-medium">
                          Prescription - {new Date(prescription.createdAt).toLocaleDateString()}
                        </h4>
                        <p className="text-gray-400">
                          {prescription.medicines.length} medicine(s)
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handlePreview(prescription)}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Preview Modal */}
        {previewData && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <h3 className="text-xl font-semibold text-white">{previewData.title}</h3>
                <button
                  onClick={() => setPreviewData(null)}
                  className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-4">
                <iframe
                  src={previewData.data}
                  className="w-full h-full min-h-[60vh] rounded-lg"
                  title="Prescription Preview"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalDashboard;
import React, { useState } from 'react';
import { Search, FileText, Image, Download, Eye, AlertCircle, Loader2, X, Trash2 } from 'lucide-react';
import { getPatientByUHID, getPrescriptionsByUHID, getRecordsByUHID, deletePrescription, deleteRecord } from '../utils/db';
import { generatePrescription } from '../utils/pdf';
import type { Patient, Prescription, Record } from '../utils/db';

interface PreviousRecordsProps {
  initialUHID?: string;
}

const PreviousRecords: React.FC<PreviousRecordsProps> = ({ initialUHID = '' }) => {
  const [uhid, setUhid] = useState(initialUHID);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [records, setRecords] = useState<Record[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewData, setPreviewData] = useState<{
    title: string;
    type: 'pdf' | 'image';
    data: string;
  } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'prescription' | 'record';
    id: number;
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
    setRecords([]);

    try {
      const patientData = await getPatientByUHID(uhid);
      if (!patientData) {
        setError('Patient not found');
        return;
      }
      setPatient(patientData);

      const [prescriptionData, recordData] = await Promise.all([
        getPrescriptionsByUHID(uhid),
        getRecordsByUHID(uhid)
      ]);

      setPrescriptions(prescriptionData);
      setRecords(recordData);
    } catch (err) {
      setError('Error fetching patient records');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    setIsDeleting(true);
    try {
      if (deleteConfirm.type === 'prescription') {
        await deletePrescription(deleteConfirm.id);
        setPrescriptions(prev => prev.filter(p => p.id !== deleteConfirm.id));
      } else {
        await deleteRecord(deleteConfirm.id);
        setRecords(prev => prev.filter(r => r.id !== deleteConfirm.id));
      }
    } catch (err) {
      setError('Failed to delete record');
    } finally {
      setIsDeleting(false);
      setDeleteConfirm(null);
    }
  };

  const handlePreview = async (record: Record | Prescription) => {
    if (!patient) return;

    if ('medicines' in record) {
      // Handle prescription preview
      const prescriptionData = {
        uhid: patient.uhid,
        patientName: patient.name,
        patientAge: patient.age,
        patientGender: patient.gender,
        medicines: record.medicines,
        allergies: record.allergies || '',
        symptoms: record.symptoms || '',
        hereditaryDiseases: record.hereditaryDiseases || '',
        date: new Date(record.createdAt).toLocaleDateString(),
        doctor: record.doctor || {
          name: 'Unknown Doctor',
          doctorId: 'N/A',
          department: 'N/A',
          role: 'N/A'
        }
      };

      const doc = generatePrescription(prescriptionData);
      const pdfData = doc.output('datauristring');
      setPreviewData({
        title: `Prescription - ${new Date(record.createdAt).toLocaleDateString()}`,
        type: 'pdf',
        data: pdfData
      });
    } else {
      // Handle record preview
      setPreviewData({
        title: record.title,
        type: record.type === 'pdf' ? 'pdf' : 'image',
        data: record.data
      });
    }
  };

  const handleDownload = (record: Record | Prescription) => {
    if (!patient) return;

    if ('medicines' in record) {
      // Handle prescription download
      const prescriptionData = {
        uhid: patient.uhid,
        patientName: patient.name,
        patientAge: patient.age,
        patientGender: patient.gender,
        medicines: record.medicines,
        allergies: record.allergies || '',
        symptoms: record.symptoms || '',
        hereditaryDiseases: record.hereditaryDiseases || '',
        date: new Date(record.createdAt).toLocaleDateString(),
        doctor: record.doctor || {
          name: 'Unknown Doctor',
          doctorId: 'N/A',
          department: 'N/A',
          role: 'N/A'
        }
      };

      const doc = generatePrescription(prescriptionData);
      doc.save(`prescription_${uhid}_${Date.now()}.pdf`);
    } else {
      // Handle record download
      const base64Data = record.data;
      const link = document.createElement('a');
      
      if (record.type === 'pdf') {
        // For PDF files
        const binaryData = atob(base64Data.split(',')[1]);
        const array = new Uint8Array(binaryData.length);
        for (let i = 0; i < binaryData.length; i++) {
          array[i] = binaryData.charCodeAt(i);
        }
        const blob = new Blob([array], { type: 'application/pdf' });
        link.href = URL.createObjectURL(blob);
        link.download = `${record.title}.pdf`;
      } else {
        // For images
        link.href = base64Data;
        link.download = `${record.title}.${base64Data.split(';')[0].split('/')[1]}`;
      }
      
      link.click();
      URL.revokeObjectURL(link.href);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 p-6 rounded-lg">
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
              <span className="block text-gray-400 text-sm">Aadhaar</span>
              <span className="text-white">XXXX-XXXX-{patient.aadhaar.slice(-4)}</span>
            </div>
          </div>

          {prescriptions.length === 0 && records.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No previous records found for this patient
            </div>
          ) : (
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-white mb-3">Medical Records</h4>
              {prescriptions.map((prescription) => (
                <div
                  key={prescription.id}
                  className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <FileText className="text-purple-400" size={24} />
                    <div>
                      <h4 className="text-white font-medium">Prescription</h4>
                      <p className="text-gray-400">
                        {new Date(prescription.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-gray-400">
                        {prescription.medicines.length} medicine(s)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handlePreview(prescription)}
                      className="text-purple-400 hover:text-purple-300 p-2 rounded-full hover:bg-gray-500"
                      title="Preview"
                    >
                      <Eye size={20} />
                    </button>
                    <button 
                      onClick={() => handleDownload(prescription)}
                      className="text-purple-400 hover:text-purple-300 p-2 rounded-full hover:bg-gray-500"
                      title="Download"
                    >
                      <Download size={20} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm({ type: 'prescription', id: prescription.id! })}
                      className="text-red-400 hover:text-red-300 p-2 rounded-full hover:bg-gray-500"
                      title="Delete"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}

              {records.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {record.type === 'image' ? (
                      <Image className="text-purple-400" size={24} />
                    ) : (
                      <FileText className="text-purple-400" size={24} />
                    )}
                    <div>
                      <h4 className="text-white font-medium">{record.title}</h4>
                      <p className="text-gray-400">
                        {new Date(record.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-gray-400">
                        Type: {record.type.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handlePreview(record)}
                      className="text-purple-400 hover:text-purple-300 p-2 rounded-full hover:bg-gray-500"
                      title="Preview"
                    >
                      <Eye size={20} />
                    </button>
                    <button 
                      onClick={() => handleDownload(record)}
                      className="text-purple-400 hover:text-purple-300 p-2 rounded-full hover:bg-gray-500"
                      title="Download"
                    >
                      <Download size={20} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm({ type: 'record', id: record.id! })}
                      className="text-red-400 hover:text-red-300 p-2 rounded-full hover:bg-gray-500"
                      title="Delete"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
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
              {previewData.type === 'pdf' ? (
                <iframe
                  src={previewData.data}
                  className="w-full h-full min-h-[60vh] rounded-lg"
                  title="PDF Preview"
                />
              ) : (
                <img
                  src={previewData.data}
                  alt={previewData.title}
                  className="max-w-full h-auto mx-auto rounded-lg"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-white mb-4">Confirm Delete</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete this {deleteConfirm.type}? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreviousRecords;
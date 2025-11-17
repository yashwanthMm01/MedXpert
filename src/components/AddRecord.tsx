import React, { useState } from 'react';
import { Upload, Check, AlertCircle } from 'lucide-react';
import { saveRecord } from '../utils/db';

interface AddRecordProps {
  initialUHID?: string;
}

const AddRecord: React.FC<AddRecordProps> = ({ initialUHID = '' }) => {
  const [uhid, setUhid] = useState(initialUHID);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !uhid || !title) {
      setError('Please fill all fields and select a file');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess(false);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        const fileType = file.type.includes('pdf') ? 'pdf' : 'image';
        
        await saveRecord({
          uhid,
          type: fileType,
          title,
          data: base64Data,
          createdAt: new Date()
        });

        setSuccess(true);
        setFile(null);
        setTitle('');
        
        setTimeout(() => {
          setUploading(false);
          setSuccess(false);
        }, 2000);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      setError('Failed to save record');
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-gray-800 p-8 rounded-lg">
      <h2 className="text-2xl font-bold text-white mb-6">Add Previous Record</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200 flex items-center">
          <AlertCircle className="mr-2" size={20} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-300 mb-2">Patient UHID</label>
          <input
            type="text"
            required
            value={uhid}
            onChange={(e) => setUhid(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            placeholder="Enter 14-digit UHID"
            maxLength={14}
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-2">Record Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            placeholder="Enter record title"
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-2">Upload File</label>
          <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              <Upload size={48} className="text-gray-400 mb-4" />
              <span className="text-gray-300">
                {file ? file.name : 'Click to upload or drag and drop'}
              </span>
              <span className="text-gray-500 text-sm mt-2">
                Supported formats: Images, PDF
              </span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={!file || uploading}
          className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg ${
            success
              ? 'bg-green-600'
              : uploading
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-700'
          } text-white transition-colors`}
        >
          {success ? (
            <>
              <Check size={20} />
              Record Added Successfully
            </>
          ) : uploading ? (
            <>
              <Upload size={20} className="animate-bounce" />
              Uploading...
            </>
          ) : (
            <>
              <Upload size={20} />
              Upload Record
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default AddRecord;
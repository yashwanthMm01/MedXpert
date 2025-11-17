import React, { useState, useEffect } from 'react';
import { Edit2, Save, X, Camera, Loader2, AlertCircle } from 'lucide-react';
import { getCurrentUser } from '../utils/auth';

interface DoctorProfile {
  name: string;
  email: string;
  doctorId: string;
  department: string;
  role: string;
  photo: string;
}

const DoctorProfile: React.FC = () => {
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<DoctorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadProfile = () => {
      const user = getCurrentUser();
      if (user && user.role === 'doctor') {
        setProfile({
          name: user.name,
          email: user.email,
          doctorId: user.doctorId,
          department: user.department,
          role: user.role,
          photo: user.photo || ''
        });
        setEditedProfile({
          name: user.name,
          email: user.email,
          doctorId: user.doctorId,
          department: user.department,
          role: user.role,
          photo: user.photo || ''
        });
      }
      setIsLoading(false);
    };

    loadProfile();
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Photo size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedProfile(prev => prev ? {
          ...prev,
          photo: reader.result as string
        } : null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!editedProfile) return;

    setIsSaving(true);
    setError('');

    try {
      // In a real app, this would make an API call to update the profile
      // For now, we'll just update the local state
      setProfile(editedProfile);
      setIsEditing(false);
    } catch (err) {
      setError('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="animate-spin text-purple-500" size={32} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8 text-center text-gray-400">
        Profile not found
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      {error && (
        <div className="p-4 bg-red-900/50 border border-red-500 text-red-200 flex items-center">
          <AlertCircle className="mr-2" size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="relative">
        <div className="h-32 bg-gradient-to-r from-purple-600 to-blue-600"></div>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
          <div className="relative">
            <img
              src={editedProfile?.photo || '/default-avatar.png'}
              alt="Profile"
              className="w-32 h-32 rounded-full border-4 border-gray-800 bg-gray-700"
            />
            {isEditing && (
              <label className="absolute bottom-0 right-0 p-2 bg-purple-600 rounded-full cursor-pointer hover:bg-purple-700 transition-colors">
                <Camera size={20} className="text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>
      </div>

      <div className="pt-20 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Doctor Profile</h2>
          {isEditing ? (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditedProfile(profile);
                  setError('');
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <X size={16} />
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <Edit2 size={16} />
              Edit Profile
            </button>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-400 text-sm mb-1">Full Name</label>
            {isEditing ? (
              <input
                type="text"
                value={editedProfile?.name}
                onChange={(e) => setEditedProfile(prev => prev ? {
                  ...prev,
                  name: e.target.value
                } : null)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            ) : (
              <p className="text-white">{profile.name}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-1">Email</label>
            <p className="text-white">{profile.email}</p>
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-1">Doctor ID</label>
            <p className="text-white">{profile.doctorId}</p>
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-1">Department</label>
            {isEditing ? (
              <input
                type="text"
                value={editedProfile?.department}
                onChange={(e) => setEditedProfile(prev => prev ? {
                  ...prev,
                  department: e.target.value
                } : null)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            ) : (
              <p className="text-white">{profile.department}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-1">Role</label>
            <p className="text-white">{profile.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
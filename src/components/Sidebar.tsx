import React from 'react';
import { UserPlus, FileText, FolderPlus, History, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type ViewType = 'registration' | 'prescription' | 'previous-records' | 'add-record' | 'profile';

interface SidebarProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    { id: 'profile', label: 'Doctor Profile', icon: User },
    { id: 'registration', label: 'Patient Registration', icon: UserPlus },
    { id: 'prescription', label: 'New Prescription', icon: FileText },
    { id: 'previous-records', label: 'Patient Records', icon: History },
    { id: 'add-record', label: 'Add Previous Record', icon: FolderPlus },
  ];

  return (
    <div className="w-64 bg-gray-800 text-white p-4">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-purple-400">Doctor Dashboard</h2>
      </div>
      
      <nav>
        <ul className="space-y-2">
          {menuItems.map(({ id, label, icon: Icon }) => (
            <li key={id}>
              <button
                onClick={() => onViewChange(id as ViewType)}
                className={`w-full flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeView === id 
                    ? 'bg-purple-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Icon size={20} />
                <span>{label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="absolute bottom-4 w-56">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center space-x-2 px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};
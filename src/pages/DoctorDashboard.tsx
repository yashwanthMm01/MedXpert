import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { PatientRegistration } from '../components/PatientRegistration';
import NewPrescription from '../components/NewPrescription';
import PreviousRecords from '../components/PreviousRecords';
import AddRecord from '../components/AddRecord';
import DoctorProfile from '../components/DoctorProfile';

type ActiveView = 'registration' | 'prescription' | 'previous-records' | 'add-record' | 'profile';

const DoctorDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<ActiveView>('prescription');
  const [currentUHID, setCurrentUHID] = useState<string>('');

  const handleRegistrationComplete = (uhid: string) => {
    setCurrentUHID(uhid);
    setActiveView('prescription');
  };

  const renderContent = () => {
    switch (activeView) {
      case 'registration':
        return <PatientRegistration onRegistrationComplete={handleRegistrationComplete} />;
      case 'prescription':
        return <NewPrescription initialUHID={currentUHID} onRegisterClick={() => setActiveView('registration')} />;
      case 'previous-records':
        return <PreviousRecords initialUHID={currentUHID} />;
      case 'add-record':
        return <AddRecord initialUHID={currentUHID} />;
      case 'profile':
        return <DoctorProfile />;
      default:
        return <NewPrescription initialUHID={currentUHID} onRegisterClick={() => setActiveView('registration')} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-900">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
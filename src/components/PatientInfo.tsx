import React from 'react';

interface PatientInfo {
  name: string;
  age: number;
  gender: string;
  lastVisit: string;
}

interface PatientInfoProps {
  uhid: string;
  patientInfo?: PatientInfo;
}

const PatientInfo: React.FC<PatientInfoProps> = ({ uhid, patientInfo }) => {
  if (!patientInfo) return null;

  return (
    <div className="bg-gray-800 p-4 rounded-lg mb-6">
      <h3 className="text-lg font-medium text-gray-200 mb-2">Patient Information</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-gray-400">Name</p>
          <p className="text-white">{patientInfo.name}</p>
        </div>
        <div>
          <p className="text-gray-400">Age</p>
          <p className="text-white">{patientInfo.age} years</p>
        </div>
        <div>
          <p className="text-gray-400">Gender</p>
          <p className="text-white">{patientInfo.gender}</p>
        </div>
        <div>
          <p className="text-gray-400">Last Visit</p>
          <p className="text-white">{patientInfo.lastVisit}</p>
        </div>
      </div>
    </div>
  );
};

export default PatientInfo;
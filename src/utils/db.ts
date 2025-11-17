import Dexie, { Table } from 'dexie';

export interface Patient {
  id?: number;
  uhid: string;
  name: string;
  gender: 'male' | 'female' | 'other';
  age: number;
  dateOfBirth: string;
  bloodGroup: string;
  aadhaar: string;
  createdAt: Date;
}

export interface Doctor {
  id?: number;
  name: string;
  email: string;
  doctorId: string;
  department: string;
  role: string;
}

export interface Prescription {
  id?: number;
  uhid: string;
  medicines: Medicine[];
  allergies: string;
  symptoms: string;
  hereditaryDiseases: string;
  doctor: Doctor;
  createdAt: Date;
}

export interface Medicine {
  id: string;
  name: string;
  timing: ('morning' | 'afternoon' | 'evening')[];
  beforeFood: boolean;
  dosage: string;
  days: number;
}

export interface Record {
  id?: number;
  uhid: string;
  type: 'prescription' | 'image';
  title: string;
  data: string;
  createdAt: Date;
}

class HealthScriptDB extends Dexie {
  patients!: Table<Patient>;
  prescriptions!: Table<Prescription>;
  records!: Table<Record>;

  constructor() {
    super('HealthScriptDB');
    this.version(1).stores({
      patients: '++id, uhid, name, aadhaar',
      prescriptions: '++id, uhid, createdAt',
      records: '++id, uhid, type, createdAt'
    });
  }
}

export const db = new HealthScriptDB();

// Generate UHID
export const generateUHID = async (): Promise<string> => {
  const year = new Date().getFullYear().toString();
  let isUnique = false;
  let uhid = '';

  while (!isUnique) {
    const random = Math.floor(Math.random() * 10000000000).toString().padStart(10, '0');
    uhid = year + random;
    const exists = await db.patients.where('uhid').equals(uhid).count();
    if (exists === 0) {
      isUnique = true;
    }
  }
  return uhid;
};

// Patient functions
export const registerPatient = async (patient: Omit<Patient, 'id' | 'createdAt' | 'uhid'>): Promise<string> => {
  const uhid = await generateUHID();
  await db.patients.add({
    ...patient,
    uhid,
    createdAt: new Date()
  });
  return uhid;
};

export const getPatientByUHID = async (uhid: string): Promise<Patient | undefined> => {
  return await db.patients.where('uhid').equals(uhid).first();
};

export const getPatientByAadhaar = async (aadhaar: string): Promise<Patient | undefined> => {
  return await db.patients.where('aadhaar').equals(aadhaar).first();
};

// Prescription functions
export const savePrescription = async (prescription: Omit<Prescription, 'id' | 'createdAt'>): Promise<number> => {
  return await db.prescriptions.add({
    ...prescription,
    createdAt: new Date()
  });
};

export const getPrescriptionsByUHID = async (uhid: string): Promise<Prescription[]> => {
  return await db.prescriptions.where('uhid').equals(uhid).reverse().sortBy('createdAt');
};

export const deletePrescription = async (id: number): Promise<void> => {
  await db.prescriptions.delete(id);
};

// Record functions
export const saveRecord = async (record: Omit<Record, 'id' | 'createdAt'>): Promise<number> => {
  return await db.records.add({
    ...record,
    createdAt: new Date()
  });
};

export const getRecordsByUHID = async (uhid: string): Promise<Record[]> => {
  return await db.records.where('uhid').equals(uhid).reverse().sortBy('createdAt');
};

export const deleteRecord = async (id: number): Promise<void> => {
  await db.records.delete(id);
};
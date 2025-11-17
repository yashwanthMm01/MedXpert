import { jsPDF } from 'jspdf';

interface PrescriptionData {
  uhid: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  medicines: Array<{
    name: string;
    timing: string[];
    beforeFood: boolean;
    dosage: string;
    days: number;
  }>;
  allergies: string;
  symptoms: string;
  hereditaryDiseases: string;
  date: string;
  doctor: {
    name: string;
    doctorId: string;
    department: string;
    role: string;
  };
}

export const generatePrescription = (data: PrescriptionData): jsPDF => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text('Digital Prescription', 10, 20);
  doc.setFontSize(12);
  
  // Doctor details
  doc.line(10, 35, 200, 35);
  doc.text(`Dr. ${data.doctor.name}`, 10, 45);
  doc.text(`${data.doctor.role}`, 10, 52);
  doc.text(`${data.doctor.department}`, 10, 59);
  doc.text(`Doctor ID: ${data.doctor.doctorId}`, 10, 66);
  
  // Patient details
  doc.line(10, 75, 200, 75);
  doc.text(`UHID: ${data.uhid}`, 10, 85);
  doc.text(`Patient: ${data.patientName}`, 10, 92);
  doc.text(`Age: ${data.patientAge}`, 10, 99);
  doc.text(`Gender: ${data.patientGender}`, 80, 99);
  doc.text(`Date: ${data.date}`, 150, 85);
  
  // Medical History
  doc.line(10, 110, 200, 110);
  doc.setFontSize(14);
  doc.text('Medical History:', 10, 120);
  doc.setFontSize(12);
  
  let y = 130;
  
  if (data.symptoms) {
    doc.text('Symptoms:', 15, y);
    doc.setTextColor(60, 60, 60);
    const symptomsLines = doc.splitTextToSize(data.symptoms, 170);
    doc.text(symptomsLines, 25, y + 7);
    y += 7 + (symptomsLines.length * 7);
  }
  
  if (data.allergies) {
    doc.setTextColor(0, 0, 0);
    doc.text('Allergies:', 15, y + 7);
    doc.setTextColor(60, 60, 60);
    const allergiesLines = doc.splitTextToSize(data.allergies, 170);
    doc.text(allergiesLines, 25, y + 14);
    y += 14 + (allergiesLines.length * 7);
  }
  
  if (data.hereditaryDiseases) {
    doc.setTextColor(0, 0, 0);
    doc.text('Hereditary Diseases:', 15, y + 7);
    doc.setTextColor(60, 60, 60);
    const hereditaryLines = doc.splitTextToSize(data.hereditaryDiseases, 170);
    doc.text(hereditaryLines, 25, y + 14);
    y += 14 + (hereditaryLines.length * 7);
  }
  
  // Medicines
  doc.setTextColor(0, 0, 0);
  doc.line(10, y + 7, 200, y + 7);
  doc.setFontSize(14);
  doc.text('Prescribed Medicines:', 10, y + 17);
  doc.setFontSize(12);
  
  y += 27;
  data.medicines.forEach((med, index) => {
    doc.text(`${index + 1}. ${med.name}`, 20, y);
    doc.text(`Dosage: ${med.dosage}`, 30, y + 7);
    doc.text(`Timing: ${med.timing.join(', ')}`, 30, y + 14);
    doc.text(`${med.beforeFood ? 'Before' : 'After'} food`, 30, y + 21);
    doc.text(`Duration: ${med.days} days`, 30, y + 28);
    y += 35;
  });
  
  // Footer with digital signature
  doc.line(10, 270, 200, 270);
  doc.text('Digital Signature', 150, 280);
  doc.text(`Dr. ${data.doctor.name}`, 150, 287);
  doc.text(`${data.doctor.department}`, 150, 294);
  
  return doc;
};
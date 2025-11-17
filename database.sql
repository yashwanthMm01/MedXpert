-- Create database
CREATE DATABASE IF NOT EXISTS healthscript_ai;
USE healthscript_ai;

-- Patients table
CREATE TABLE IF NOT EXISTS patients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  uhid VARCHAR(14) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  gender ENUM('male', 'female', 'other') NOT NULL,
  age INT NOT NULL,
  aadhaar VARCHAR(12) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Prescriptions table
CREATE TABLE IF NOT EXISTS prescriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  uhid VARCHAR(14) NOT NULL,
  medicines JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uhid) REFERENCES patients(uhid)
);

-- Records table
CREATE TABLE IF NOT EXISTS records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  uhid VARCHAR(14) NOT NULL,
  type ENUM('prescription', 'image', 'pdf') NOT NULL,
  title VARCHAR(100) NOT NULL,
  file_path VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uhid) REFERENCES patients(uhid)
);

-- Sample data for patients
INSERT INTO patients (uhid, name, gender, age, aadhaar) VALUES
('20240000000001', 'John Doe', 'male', 35, '123456789001'),
('20240000000002', 'Jane Smith', 'female', 28, '123456789002'),
('20240000000003', 'Robert Johnson', 'male', 45, '123456789003'),
('20240000000004', 'Mary Williams', 'female', 52, '123456789004'),
('20240000000005', 'David Brown', 'male', 41, '123456789005'),
('20240000000006', 'Sarah Davis', 'female', 33, '123456789006'),
('20240000000007', 'Michael Miller', 'male', 29, '123456789007'),
('20240000000008', 'Elizabeth Wilson', 'female', 47, '123456789008'),
('20240000000009', 'James Anderson', 'male', 38, '123456789009'),
('20240000000010', 'Patricia Taylor', 'female', 44, '123456789010');

-- Sample prescriptions
INSERT INTO prescriptions (uhid, medicines) VALUES
('20240000000001', '[{"name": "DOLO 650", "timing": ["morning", "evening"], "beforeFood": true, "dosage": "1 tablet", "days": 5}]'),
('20240000000002', '[{"name": "Citrizene", "timing": ["night"], "beforeFood": false, "dosage": "1 tablet", "days": 7}]'),
('20240000000003', '[{"name": "calcium", "timing": ["morning"], "beforeFood": false, "dosage": "1 tablet", "days": 30}]');

-- Sample records
INSERT INTO records (uhid, type, title, file_path) VALUES
('20240000000001', 'prescription', 'General Checkup', '/records/20240000000001/prescription_001.pdf'),
('20240000000001', 'image', 'X-Ray Report', '/records/20240000000001/xray_001.jpg'),
('20240000000002', 'prescription', 'Fever Treatment', '/records/20240000000002/prescription_001.pdf'),
('20240000000003', 'image', 'Blood Test Report', '/records/20240000000003/blood_test_001.pdf');
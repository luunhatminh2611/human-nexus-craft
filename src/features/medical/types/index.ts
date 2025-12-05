export interface MedicalRecord {
  id: string;
  patientId: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  fileUrl: string;
  // EHR fields (entered by admin)
  bloodType?: string;
  height?: number;
  weight?: number;
  allergies?: string;
  chronicDiseases?: string;
  medications?: string;
  emergencyContact?: string;
  emergencyContactPhone?: string;
  lastCheckupDate?: string;
  notes?: string;
}

export type MedicalRecordStatus = 'Pending' | 'Approved' | 'Rejected';


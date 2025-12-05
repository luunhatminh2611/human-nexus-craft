export interface Employee {
  id: string;
  avatar?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  departmentId: string;
  position: string;
  grade: string; // G1, G2, G3
  startDate: string; // ISO
  contractType: 'Full-time' | 'Part-time' | 'Contract';
  managerId?: string;
  status: 'Active' | 'On Leave' | 'Resigned' | 'Probation';
  trainingsCompleted: string[];
  salary: {
    base: number;
    allowances?: { [key: string]: number };
    currency: string;
  };
  customSalaryItems?: Array<{
    id: string;
    name: string;
    type: 'EARNING' | 'DEDUCTION';
    method: 'FIXED' | 'PERCENT_BASE';
    value: number;
  }>;
  medicalRecordId?: string;
  documents?: { id: string; name: string; url?: string }[];
  address?: string;
  dateOfBirth?: string;
  familyMembers?: FamilyMember[];
  contracts?: EmployeeContract[];
}

export interface User {
  id: number;
  username: string;
  passwordHash: string;
  fullName: string;
  email: string;
  phone: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
}

export interface EmployeeContract {
  id: string;
  code: string;
  type: string;
  startDate: string;
  endDate?: string;
  status: 'Active' | 'Expired' | 'Terminated' | 'Pending';
  fileUrl?: string;
}

export interface FamilyMember {
  id: string;
  fullName: string;
  employeeId: string;
  relation:
    | 'Father'
    | 'Mother'
    | 'Spouse'
    | 'Son'
    | 'Daughter'
    | 'Brother'
    | 'Sister'
    | 'Other';
  dateOfBirth?: string;
  phone?: string;
  email?: string;
  address?: string;
  occupation?: string;
  isEmergencyContact?: boolean;
}

export type EmployeeStatus = 'Active' | 'On Leave' | 'Resigned' | 'Probation';
export type ContractType = 'Full-time' | 'Part-time' | 'Contract';


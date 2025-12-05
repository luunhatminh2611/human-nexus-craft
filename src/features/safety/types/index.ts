export interface SafetyItem {
  id: string;
  name: string;
  category: string;
  description?: string;
  replacementCycleDays: number;
  defaultExpireDays: number;
  quantityInStock: number;
  distributedDepartments: {
    department: string;
    quantity: number;
  }[];
}

export interface IssuedSafetyItem {
  id: string;
  safetyItemId: string;
  employeeId: string;
  issuedBy: string;
  issueDate: string;
  expireDate: string;
  status: 'In Use' | 'Expiring Soon' | 'Expired' | 'Replaced' | 'DamagedEarly';
  replacedById?: string;
  replacedFromId?: string;
  note?: string;
  replacedDate?: string;
}

export interface SafetyReplacementRequest {
  id: string;
  employeeId: string;
  safetyItemId: string;
  requestDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  processedBy?: string;
  processedDate?: string;
  note?: string;
}

export type SafetyItemStatus = 'In Use' | 'Expiring Soon' | 'Expired' | 'Replaced' | 'DamagedEarly';
export type ReplacementRequestStatus = 'Pending' | 'Approved' | 'Rejected';


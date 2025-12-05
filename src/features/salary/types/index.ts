export interface SalaryStructure {
  id: string;
  name: string;
  items: Array<{
    id: string;
    name: string;
    type: 'EARNING' | 'DEDUCTION';
    method: 'FIXED' | 'PERCENT_BASE' | 'FORMULA';
    value: number;
    applicableGrades: string[];
  }>;
}

export interface PayrollHistory {
  id: string;
  employeeId: string;
  month: string;
  year: number;
  grossSalary: number;
  netSalary: number;
  basicSalary: number;
  allowances: { [key: string]: number };
  bonuses: { [key: string]: number };
  deductions: { [key: string]: number };
  tax: number;
  insurance: number;
  paymentDate: string;
}

export type SalaryItemType = 'EARNING' | 'DEDUCTION';
export type CalculationMethod = 'FIXED' | 'PERCENT_BASE' | 'FORMULA';


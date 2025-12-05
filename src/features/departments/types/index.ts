export interface Department {
  id: string;
  name: string;
  parentId?: string;
  managerId?: string;
}

export interface JobTitle {
  id: string;
  name: string;
  description: string;
  departmentId?: string;
}

export interface Grade {
  id: string;
  jobTitleId?: string;
  name: string;
  description: string;
  competencies: string[];
  requiredSkills: string[];
  requiredTrainings: string[];
  order: number;
}

export interface Position {
  id: string;
  title: string;
  departmentId: string;
  gradeId: string;
}


export interface TrainingEmployeeType {
  employeeId: number;
  employeeName: string;
  employeeCode: string;
  educationSystem: {
    code: string;
    name: string;
  };
  trainingMethod: {
    code: string;
    name: string;
  };
  trainingSchool: {
    code: string;
    name: string;
  };
  educationLevel: {
    code: string;
    name: string;
  };
  trainingMajor: {
    code: string;
    name: string;
  };
  className: string;
  startDate: string;
  endDate: string;
  note: string;
}

export interface LookupOption {
  code: string;
  name: string;
}
export interface PerformanceReview {
  id: string;
  employeeId: string;
  reviewerId: string;
  period: string;
  year: number;
  selfAssessment?: {
    goals: { goal: string; achievement: string; score: number }[];
    strengths: string;
    improvements: string;
    comments: string;
  };
  managerAssessment?: {
    goals: { goal: string; feedback: string; score: number }[];
    overallRating: number;
    strengths: string;
    improvements: string;
    comments: string;
  };
  status: 'Draft' | 'Submitted' | 'Reviewed' | 'Completed';
  submittedDate?: string;
  reviewedDate?: string;
}

export interface Goal {
  id: string;
  employeeId: string;
  title: string;
  description: string;
  targetDate: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Delayed';
  progress: number;
  assignedBy: string;
  createdDate: string;
}

export type PerformanceReviewStatus = 'Draft' | 'Submitted' | 'Reviewed' | 'Completed';
export type GoalStatus = 'Not Started' | 'In Progress' | 'Completed' | 'Delayed';


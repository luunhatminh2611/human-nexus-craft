export interface TrainingQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface Training {
  id: string;
  title: string;
  description: string;
  requiredForGrades: string[];
  durationDays: number;
  status: 'Upcoming' | 'Ongoing' | 'Completed';
  completionRate?: number;
  deadline?: string;
  instructor?: string;
  location?: string;
  maxParticipants?: number;
  questions?: TrainingQuestion[];
}

export interface TrainingEnrollment {
  id: string;
  trainingId: string;
  employeeId: string;
  enrolledDate: string;
  completionDate?: string;
  status: 'Assigned' | 'In Progress' | 'Completed' | 'Failed';
  progress: number;
  testScore?: number;
  testAttempts?: number;
}

export interface TrainingFeedback {
  id: string;
  trainingId: string;
  employeeId: string;
  rating: number;
  contentRating: number;
  instructorRating: number;
  comments: string;
  date: string;
}

export type TrainingStatus = 'Upcoming' | 'Ongoing' | 'Completed';
export type EnrollmentStatus = 'Assigned' | 'In Progress' | 'Completed' | 'Failed';


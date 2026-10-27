import {
  GradeDto,
  AcademicHistoryDto,
  GradeCondition,
} from '@unicen/shared';

export type Grade = GradeDto;
export type AcademicHistory = AcademicHistoryDto;

export interface CourseGradesPayload {
  courseId: string;
  metrics: {
    courseAverage: number;
    projectedPassPercentage: number;
    atRiskCount: number;
    totalStudents: number;
  };
  records: Array<{
    id: string;
    enrollmentId: string;
    studentId: string;
    studentName: string;
    ru: string;
    career: string;
    partial1?: number | null;
    partial2?: number | null;
    labs?: number | null;
    finalExam?: number | null;
    finalGrade?: number | null;
    attendancePercentage?: number | null;
    condition: GradeCondition;
    isClosed: boolean;
  }>;
}

export interface UpdateGradeInput {
  partial1?: number | null;
  partial2?: number | null;
  labs?: number | null;
  finalExam?: number | null;
  attendancePercentage?: number | null;
}

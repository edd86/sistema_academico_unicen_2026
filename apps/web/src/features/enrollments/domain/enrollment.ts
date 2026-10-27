import { EnrollmentDto, StudentProfileDto, CourseDto } from '@unicen/shared';

export type Enrollment = EnrollmentDto;
export type StudentProfile = StudentProfileDto;
export type Course = CourseDto;

export interface ValidationIssue {
  type: 'SIN_CUPOS' | 'MATERIA_DUPLICADA' | 'CONFLICTO_HORARIO' | 'MATERIA_YA_APROBADA';
  message: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  details?: string;
}

export interface EnrollmentValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  totalCredits: number;
}

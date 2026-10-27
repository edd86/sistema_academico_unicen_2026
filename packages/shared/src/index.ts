export enum UserRole {
  ADMIN = 'ADMIN',
  DOCENTE = 'DOCENTE',
  ESTUDIANTE = 'ESTUDIANTE',
}

export enum CourseModality {
  PRESENCIAL = 'PRESENCIAL',
  HIBRIDA = 'HIBRIDA',
  VIRTUAL_SINCRONICA = 'VIRTUAL_SINCRONICA',
}

export enum EnrollmentStatus {
  CONFIRMADA = 'CONFIRMADA',
  CANCELADA = 'CANCELADA',
}

export enum GradeCondition {
  APROBADO = 'APROBADO',
  EN_RIESGO = 'EN_RIESGO',
  REPROBADO = 'REPROBADO',
  PENDIENTE = 'PENDIENTE',
}

export const EVALUATION_WEIGHTS = {
  PARCIAL_1: 0.25,
  PARCIAL_2: 0.25,
  PRACTICAS: 0.20,
  EXAMEN_FINAL: 0.30,
} as const;

export const MIN_PASSING_GRADE = 51;

export interface UserDto {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  department?: string;
  createdAt?: string;
}

export interface StudentProfileDto {
  id: string;
  userId: string;
  ru: string;
  career: string;
  studyPlan: string;
  academicStanding: string;
  cumulativeGpa: number;
  completedCredits: number;
  totalCreditsRequired: number;
  currentSemester: number;
  user?: UserDto;
}

export interface SubjectDto {
  id: string;
  code: string;
  name: string;
  credits: number;
  semester: number;
  area: string;
  department: string;
  prerequisites?: string[];
  createdAt?: string;
}

export interface CourseScheduleDto {
  days: string;
  startTime: string;
  endTime: string;
}

export interface CourseDto {
  id: string;
  subjectId: string;
  term: string;
  parallel: string;
  classroom: string;
  physicalCapacity: number;
  maxCapacity: number;
  enrolledCount: number;
  modality: CourseModality;
  teacherId?: string;
  teacherName?: string;
  teacherTitle?: string;
  schedule: CourseScheduleDto;
  subject?: SubjectDto;
}

export interface EnrollmentDto {
  id: string;
  studentId: string;
  courseId: string;
  term: string;
  enrolledAt: string;
  status: EnrollmentStatus;
  course?: CourseDto;
  student?: StudentProfileDto;
}

export interface GradeDto {
  id: string;
  enrollmentId: string;
  partial1?: number | null;
  partial2?: number | null;
  labs?: number | null;
  finalExam?: number | null;
  finalGrade?: number | null;
  attendancePercentage?: number | null;
  condition: GradeCondition;
  isClosed: boolean;
  enrollment?: EnrollmentDto;
}

export interface AcademicHistoryItemDto {
  id: string;
  term: string;
  subjectCode: string;
  subjectName: string;
  credits: number;
  parallel: string;
  teacherName: string;
  finalGrade: number;
  condition: GradeCondition;
  attendancePercentage: number;
}

export interface AcademicHistoryDto {
  student: StudentProfileDto;
  overallGpa: number;
  totalCreditsApproved: number;
  recordsByTerm: Record<string, AcademicHistoryItemDto[]>;
}

export interface CourseMetricsDto {
  totalCoursesOffered: number;
  totalAvailableSeats: number;
  totalEnrolledSeats: number;
  occupancyPercentage: number;
  criticalCoursesCount: number;
}

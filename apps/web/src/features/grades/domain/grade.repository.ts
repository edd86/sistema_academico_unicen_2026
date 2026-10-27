import {
  CourseGradesPayload,
  AcademicHistory,
  UpdateGradeInput,
  Grade,
} from './grade';

export interface IGradeRepository {
  getCourseGrades(courseId: string): Promise<CourseGradesPayload>;
  updateGrade(enrollmentId: string, input: UpdateGradeInput): Promise<Grade>;
  closeActa(courseId: string): Promise<any>;
  getMyAcademicHistory(): Promise<AcademicHistory>;
  getStudentAcademicHistory(studentId: string): Promise<AcademicHistory>;
}

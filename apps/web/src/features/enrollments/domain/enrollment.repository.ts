import { Enrollment, StudentProfile, Course } from './enrollment';

export interface IEnrollmentRepository {
  getMyEnrollments(term?: string): Promise<Enrollment[]>;
  getStudentEnrollments(studentId: string, term?: string): Promise<Enrollment[]>;
  enrollStudent(studentId: string, courseId: string, term?: string): Promise<Enrollment>;
  getStudents(): Promise<StudentProfile[]>;
  getStudentById(id: string): Promise<StudentProfile>;
  createStudent(studentData: any): Promise<StudentProfile>;
  getCourses(term?: string): Promise<Course[]>;
}

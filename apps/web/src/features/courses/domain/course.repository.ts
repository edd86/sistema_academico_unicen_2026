import { Course, CourseMetrics, CourseFilter, Subject } from './course';

export interface ICourseRepository {
  getCourses(filters?: CourseFilter): Promise<Course[]>;
  getCourseMetrics(term?: string): Promise<CourseMetrics>;
  getSubjects(): Promise<Subject[]>;
  createSubject(subjectData: Partial<Subject>): Promise<Subject>;
  createCourse(courseData: any): Promise<Course>;
}

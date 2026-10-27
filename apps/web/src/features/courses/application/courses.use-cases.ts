import { ICourseRepository } from '../domain/course.repository';
import { CourseFilter } from '../domain/course';

export const coursesUseCases = {
  getCatalog: (repo: ICourseRepository, filters?: CourseFilter) =>
    repo.getCourses(filters),
  getMetrics: (repo: ICourseRepository, term?: string) =>
    repo.getCourseMetrics(term),
  getSubjects: (repo: ICourseRepository) => repo.getSubjects(),
  createSubject: (repo: ICourseRepository, data: any) =>
    repo.createSubject(data),
  createCourse: (repo: ICourseRepository, data: any) =>
    repo.createCourse(data),
};

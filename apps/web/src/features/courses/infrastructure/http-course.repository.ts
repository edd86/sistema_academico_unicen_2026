import { ICourseRepository } from '../domain/course.repository';
import { Course, CourseMetrics, CourseFilter, Subject } from '../domain/course';
import { apiClient } from '../../../core/http/apiClient';

export class HttpCourseRepository implements ICourseRepository {
  async getCourses(filters?: CourseFilter): Promise<Course[]> {
    const response = await apiClient.get<Course[]>('/courses', {
      params: filters,
    });
    return response.data;
  }

  async getCourseMetrics(term?: string): Promise<CourseMetrics> {
    const response = await apiClient.get<CourseMetrics>('/courses/metrics', {
      params: { term },
    });
    return response.data;
  }

  async getSubjects(): Promise<Subject[]> {
    const response = await apiClient.get<Subject[]>('/subjects');
    return response.data;
  }

  async createSubject(subjectData: Partial<Subject>): Promise<Subject> {
    const response = await apiClient.post<Subject>('/subjects', subjectData);
    return response.data;
  }

  async createCourse(courseData: any): Promise<Course> {
    const response = await apiClient.post<Course>('/courses', courseData);
    return response.data;
  }
}

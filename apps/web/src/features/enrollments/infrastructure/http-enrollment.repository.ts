import { IEnrollmentRepository } from '../domain/enrollment.repository';
import { Enrollment, StudentProfile, Course } from '../domain/enrollment';
import { apiClient } from '../../../core/http/apiClient';

export class HttpEnrollmentRepository implements IEnrollmentRepository {
  async getMyEnrollments(term?: string): Promise<Enrollment[]> {
    const response = await apiClient.get<Enrollment[]>('/enrollments/my', {
      params: { term },
    });
    return response.data;
  }

  async getStudentEnrollments(
    studentId: string,
    term?: string,
  ): Promise<Enrollment[]> {
    const response = await apiClient.get<Enrollment[]>(
      `/enrollments/student/${studentId}`,
      { params: { term } },
    );
    return response.data;
  }

  async enrollStudent(
    studentId: string,
    courseId: string,
    term?: string,
  ): Promise<Enrollment> {
    const response = await apiClient.post<Enrollment>('/enrollments', {
      studentId,
      courseId,
      term,
    });
    return response.data;
  }

  async getStudents(): Promise<StudentProfile[]> {
    const response = await apiClient.get<StudentProfile[]>('/students');
    return response.data;
  }

  async getStudentById(id: string): Promise<StudentProfile> {
    const response = await apiClient.get<StudentProfile>(`/students/${id}`);
    return response.data;
  }

  async createStudent(studentData: any): Promise<StudentProfile> {
    const response = await apiClient.post<StudentProfile>(
      '/students',
      studentData,
    );
    return response.data;
  }

  async getCourses(term = '2026-I'): Promise<Course[]> {
    const response = await apiClient.get<Course[]>('/courses', {
      params: { term },
    });
    return response.data;
  }
}

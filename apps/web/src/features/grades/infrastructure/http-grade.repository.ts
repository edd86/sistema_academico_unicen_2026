import { IGradeRepository } from '../domain/grade.repository';
import {
  CourseGradesPayload,
  AcademicHistory,
  UpdateGradeInput,
  Grade,
} from '../domain/grade';
import { apiClient } from '../../../core/http/apiClient';

export class HttpGradeRepository implements IGradeRepository {
  async getCourseGrades(courseId: string): Promise<CourseGradesPayload> {
    const response = await apiClient.get<CourseGradesPayload>(
      `/grades/course/${courseId}`,
    );
    return response.data;
  }

  async updateGrade(
    enrollmentId: string,
    input: UpdateGradeInput,
  ): Promise<Grade> {
    const response = await apiClient.put<Grade>(
      `/grades/enrollment/${enrollmentId}`,
      input,
    );
    return response.data;
  }

  async closeActa(courseId: string): Promise<any> {
    const response = await apiClient.post(
      `/grades/course/${courseId}/close-acta`,
    );
    return response.data;
  }

  async getMyAcademicHistory(): Promise<AcademicHistory> {
    const response = await apiClient.get<AcademicHistory>('/grades/history/me');
    return response.data;
  }

  async getStudentAcademicHistory(studentId: string): Promise<AcademicHistory> {
    const response = await apiClient.get<AcademicHistory>(
      `/grades/history/${studentId}`,
    );
    return response.data;
  }
}

import { IGradeRepository } from '../domain/grade.repository';
import { UpdateGradeInput } from '../domain/grade';

export const gradesUseCases = {
  getCourseGrades: (repo: IGradeRepository, courseId: string) =>
    repo.getCourseGrades(courseId),
  updateGrade: (
    repo: IGradeRepository,
    enrollmentId: string,
    input: UpdateGradeInput,
  ) => repo.updateGrade(enrollmentId, input),
  closeActa: (repo: IGradeRepository, courseId: string) =>
    repo.closeActa(courseId),
  getMyAcademicHistory: (repo: IGradeRepository) =>
    repo.getMyAcademicHistory(),
  getStudentAcademicHistory: (repo: IGradeRepository, studentId: string) =>
    repo.getStudentAcademicHistory(studentId),
};

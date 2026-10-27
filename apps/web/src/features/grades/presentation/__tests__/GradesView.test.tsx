import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { GradesAndHistoryPage } from '../GradesAndHistoryPage';
import * as useAuthModule from '../../auth/application/useAuth';
import { gradesUseCases } from '../../grades/application/grades.use-cases';
import { coursesUseCases } from '../../courses/application/courses.use-cases';
import { UserRole, GradeCondition, CourseModality } from '@unicen/shared';

vi.mock('../../grades/application/grades.use-cases', () => ({
  gradesUseCases: {
    getCourseGrades: vi.fn(),
    updateGrade: vi.fn(),
    closeActa: vi.fn(),
    getMyAcademicHistory: vi.fn(),
    getStudentAcademicHistory: vi.fn(),
  },
}));

vi.mock('../../courses/application/courses.use-cases', () => ({
  coursesUseCases: {
    getCatalog: vi.fn(),
    getMetrics: vi.fn(),
    getSubjects: vi.fn(),
  },
}));

describe('GradesView Integration Tests (Control de Acceso y Edición por Rol)', () => {
  const mockCourseData = [
    {
      id: 'course-1',
      subjectId: 'sub-sis-301',
      parallel: 'Paralelo A',
      days: 'Lun - Mié',
      term: '2026-I',
      subject: {
        code: 'SIS-301',
        name: 'Estructuras de Datos Avanzadas',
        semester: 5,
        credits: 5,
      },
    },
  ];

  const mockGradesPayload = {
    courseId: 'course-1',
    metrics: {
      courseAverage: 78.4,
      projectedPassPercentage: 87.5,
      atRiskCount: 1,
      totalStudents: 1,
    },
    records: [
      {
        id: 'grade-1',
        enrollmentId: 'enr-1',
        studentId: 'student-1',
        studentName: 'Carlos Ariel Mendoza Arce',
        ru: 'RU-2023-09418',
        career: 'Ingeniería de Sistemas',
        partial1: 23,
        partial2: 22,
        labs: 19,
        finalExam: 28,
        finalGrade: 92,
        attendancePercentage: 96,
        condition: GradeCondition.APROBADO,
        isClosed: false,
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (coursesUseCases.getCatalog as any).mockResolvedValue(mockCourseData);
    (gradesUseCases.getCourseGrades as any).mockResolvedValue(mockGradesPayload);
  });

  it('el input de notas debe ser EDITABLE si el usuario autenticado tiene rol DOCENTE', async () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: {
        id: 'docente-1',
        email: 'carlos.mendoza@unicen.edu.bo',
        fullName: 'Dr. Carlos Mendoza S.',
        role: UserRole.DOCENTE,
      },
      token: 'valid-jwt-token',
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <MemoryRouter>
        <GradesAndHistoryPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      const inputPartial1 = screen.getByLabelText(
        /Parcial 1 para Carlos Ariel Mendoza Arce/i,
      );
      expect(inputPartial1).toBeInTheDocument();
      expect(inputPartial1).toBeEnabled();
    });
  });

  it('el input de notas debe ser EDITABLE si el usuario autenticado tiene rol ADMIN', async () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: {
        id: 'admin-1',
        email: 'coordinacion.acad@unicen.edu.bo',
        fullName: 'Dra. Elena Valenzuela',
        role: UserRole.ADMIN,
      },
      token: 'valid-jwt-token',
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <MemoryRouter>
        <GradesAndHistoryPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      const inputPartial1 = screen.getByLabelText(
        /Parcial 1 para Carlos Ariel Mendoza Arce/i,
      );
      expect(inputPartial1).toBeInTheDocument();
      expect(inputPartial1).toBeEnabled();
    });
  });

  it('el input de notas NO debe ser editable (disabled) si el rol autenticado es ESTUDIANTE', async () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: {
        id: 'student-1',
        email: 'mateo.morales@unicen.edu.bo',
        fullName: 'Mateo Andrés Morales Soliz',
        role: UserRole.ESTUDIANTE,
        student: {
          id: 'student-1',
          ru: 'RU-2023-01984',
          career: 'Ingeniería de Sistemas',
        },
      },
      token: 'valid-jwt-token',
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <MemoryRouter>
        <GradesAndHistoryPage />
      </MemoryRouter>,
    );

    // Cambiar a la pestaña de vista docente (modo solo lectura para estudiante)
    const teacherTabBtn = screen.getByRole('button', {
      name: /Vista Docente: Planilla y Matriz/i,
    });
    teacherTabBtn.click();

    await waitFor(() => {
      const inputPartial1 = screen.getByLabelText(
        /Parcial 1 para Carlos Ariel Mendoza Arce/i,
      );
      expect(inputPartial1).toBeInTheDocument();
      expect(inputPartial1).toBeDisabled();
    });
  });
});

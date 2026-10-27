import { describe, it, expect } from 'vitest';
import { validateEnrollmentSelection } from '../validateEnrollment';
import { Course } from '../../domain/enrollment';
import { CourseModality } from '@unicen/shared';

describe('validateEnrollmentSelection (Domain / Use Case Unit Tests)', () => {
  const baseCourse: Course = {
    id: 'course-1',
    subjectId: 'sub-sis-301',
    term: '2026-I',
    parallel: 'Paralelo A',
    classroom: 'Aula 204',
    physicalCapacity: 45,
    maxCapacity: 40,
    enrolledCount: 30, // 10 cupos libres
    modality: CourseModality.PRESENCIAL,
    days: 'Lun - Mié',
    startTime: '08:00',
    endTime: '10:00',
    subject: {
      id: 'sub-sis-301',
      code: 'SIS-301',
      name: 'Estructuras de Datos Avanzadas',
      credits: 5,
      semester: 5,
      area: 'Algoritmos',
      department: 'Ingeniería',
    },
  };

  it('debe validar exitosamente cuando hay cupos disponibles y la materia no está seleccionada', () => {
    const selectedCourses: Course[] = [];
    const result = validateEnrollmentSelection(selectedCourses, baseCourse);

    expect(result.isValid).toBe(true);
    expect(result.issues).toHaveLength(0);
    expect(result.totalCredits).toBe(5);
  });

  it('debe impedir continuar si cuposDisponibles <= 0 (cupo agotado)', () => {
    const fullCourse: Course = {
      ...baseCourse,
      id: 'course-full',
      enrolledCount: 40,
      maxCapacity: 40, // 0 cupos libres
    };

    const selectedCourses: Course[] = [];
    const result = validateEnrollmentSelection(selectedCourses, fullCourse);

    expect(result.isValid).toBe(false);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'SIN_CUPOS',
          message: expect.stringMatching(/no cuenta con cupos disponibles/i),
        }),
      ]),
    );
  });

  it('debe impedir continuar si la materia ya está en la lista de seleccionadas (duplicidad)', () => {
    // La materia ya fue seleccionada previamente en otro paralelo o el mismo
    const existingSelectedCourse: Course = {
      ...baseCourse,
      id: 'course-already-selected',
      parallel: 'Paralelo B',
    };

    const newCourseSameSubject: Course = {
      ...baseCourse,
      id: 'course-duplicate-try',
      parallel: 'Paralelo A',
    };

    const selectedCourses: Course[] = [existingSelectedCourse];
    const result = validateEnrollmentSelection(
      selectedCourses,
      newCourseSameSubject,
    );

    expect(result.isValid).toBe(false);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'MATERIA_DUPLICADA',
          message: expect.stringMatching(/ya está en la lista de seleccionadas/i),
        }),
      ]),
    );
  });

  it('debe detectar conflicto horario si los horarios colisionan en los mismos días', () => {
    const selectedCourse: Course = {
      ...baseCourse,
      id: 'course-mat-204',
      subjectId: 'sub-mat-204',
      days: 'Lun - Mié',
      startTime: '09:00', // Traslapa con 08:00 - 10:00
      endTime: '11:00',
      subject: {
        id: 'sub-mat-204',
        code: 'MAT-204',
        name: 'Ecuaciones Diferenciales',
        credits: 5,
        semester: 4,
        area: 'Ciencias Básicas',
        department: 'Matemática',
      },
    };

    const result = validateEnrollmentSelection([selectedCourse], baseCourse);

    expect(result.isValid).toBe(false);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'CONFLICTO_HORARIO',
          message: expect.stringMatching(/Conflicto crítico de horario/i),
        }),
      ]),
    );
  });

  it('debe bloquear si la materia ya figura como aprobada en el historial del estudiante', () => {
    const approvedCodes = ['SIS-301'];
    const result = validateEnrollmentSelection([], baseCourse, approvedCodes);

    expect(result.isValid).toBe(false);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'MATERIA_YA_APROBADA',
          message: expect.stringMatching(/ya figura como APROBADO en su historial/i),
        }),
      ]),
    );
  });
});

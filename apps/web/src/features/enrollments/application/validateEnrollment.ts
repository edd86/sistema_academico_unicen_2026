import { Course, EnrollmentValidationResult, ValidationIssue } from '../domain/enrollment';

function parseTimeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + (minutes || 0);
}

function hasScheduleConflict(courseA: Course, courseB: Course): boolean {
  if (courseA.id === courseB.id) return false;

  // Si los días no coinciden, no hay conflicto
  const daysA = courseA.days.toLowerCase().split(/[\s,-]+/);
  const daysB = courseB.days.toLowerCase().split(/[\s,-]+/);
  const commonDays = daysA.filter((d: string) => d && daysB.includes(d));
  if (commonDays.length === 0) return false;

  const startA = parseTimeToMinutes(courseA.startTime);
  const endA = parseTimeToMinutes(courseA.endTime);
  const startB = parseTimeToMinutes(courseB.startTime);
  const endB = parseTimeToMinutes(courseB.endTime);

  // Traslape en minutos
  return Math.max(startA, startB) < Math.min(endA, endB);
}

export function validateEnrollmentSelection(
  selectedCourses: Course[],
  newCourse: Course,
  alreadyApprovedCodes: string[] = [],
): EnrollmentValidationResult {
  const issues: ValidationIssue[] = [];

  const availableSeats = newCourse.maxCapacity - newCourse.enrolledCount;

  // 1. Validación de Cupo Disponible (cuposDisponibles <= 0)
  if (availableSeats <= 0) {
    issues.push({
      type: 'SIN_CUPOS',
      courseId: newCourse.id,
      courseCode: newCourse.subject?.code || '',
      courseName: newCourse.subject?.name || '',
      message: `No es posible agregar ${newCourse.subject?.code}: no cuenta con cupos disponibles (0 vacantes).`,
      details: `Capacidad máxima: ${newCourse.maxCapacity}, ocupados: ${newCourse.enrolledCount}`,
    });
  }

  // 2. Validación de Duplicidad en la Lista Seleccionada
  const isDuplicateInSelection = selectedCourses.some(
    (c) =>
      c.id === newCourse.id ||
      c.subjectId === newCourse.subjectId ||
      (c.subject?.code && c.subject.code === newCourse.subject?.code),
  );

  if (isDuplicateInSelection) {
    issues.push({
      type: 'MATERIA_DUPLICADA',
      courseId: newCourse.id,
      courseCode: newCourse.subject?.code || '',
      courseName: newCourse.subject?.name || '',
      message: `La materia ${newCourse.subject?.code} ya está en la lista de seleccionadas.`,
      details: 'No se permite inscribir dos veces la misma asignatura en un mismo período.',
    });
  }

  // 3. Validación de Historial Académico (Materias ya cursadas y aprobadas)
  if (
    newCourse.subject?.code &&
    alreadyApprovedCodes.includes(newCourse.subject.code)
  ) {
    issues.push({
      type: 'MATERIA_YA_APROBADA',
      courseId: newCourse.id,
      courseCode: newCourse.subject?.code || '',
      courseName: newCourse.subject?.name || '',
      message: `Alerta: ${newCourse.subject?.code} ya figura como APROBADO en su historial académico.`,
      details: 'Reglamento Estudiantil Art. 44: No es posible re-inscribir materias ya acreditadas.',
    });
  }

  // 4. Validación de Conflicto Horario con materias ya seleccionadas
  for (const existingCourse of selectedCourses) {
    if (hasScheduleConflict(existingCourse, newCourse)) {
      issues.push({
        type: 'CONFLICTO_HORARIO',
        courseId: newCourse.id,
        courseCode: newCourse.subject?.code || '',
        courseName: newCourse.subject?.name || '',
        message: `Conflicto crítico de horario entre ${newCourse.subject?.code} (${newCourse.days} ${newCourse.startTime}-${newCourse.endTime}) y ${existingCourse.subject?.code} (${existingCourse.days} ${existingCourse.startTime}-${existingCourse.endTime}).`,
        details: 'El motor de registro no permite traslapes horarios entre asignaturas.',
      });
      break;
    }
  }

  const totalCredits =
    selectedCourses.reduce(
      (sum, c) => sum + (c.subject?.credits || 0),
      0,
    ) + (issues.length === 0 ? newCourse.subject?.credits || 0 : 0);

  return {
    isValid: issues.length === 0,
    issues,
    totalCredits,
  };
}

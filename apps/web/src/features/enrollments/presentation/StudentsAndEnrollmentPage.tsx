import React, { useEffect, useState, useMemo } from 'react';
import {
  UserCheck,
  AlertTriangle,
  Check,
  Plus,
  Trash2,
  Lock,
  Clock,
  BookOpen,
  Calendar,
  ShieldAlert,
  Search,
  UserPlus,
} from 'lucide-react';
import { HttpEnrollmentRepository } from '../infrastructure/http-enrollment.repository';
import { validateEnrollmentSelection } from '../application/validateEnrollment';
import {
  Course,
  StudentProfile,
  Enrollment,
  ValidationIssue,
} from '../domain/enrollment';
import { Button } from '../../../core/ui/Button';
import { Badge } from '../../../core/ui/Badge';
import { Modal } from '../../../core/ui/Modal';
import { useAuth } from '../../auth/application/useAuth';
import { UserRole } from '@unicen/shared';

const enrollmentRepository = new HttpEnrollmentRepository();

export const StudentsAndEnrollmentPage: React.FC = () => {
  const { user } = useAuth();

  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(
    null,
  );
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);
  const [confirmedEnrollments, setConfirmedEnrollments] = useState<
    Enrollment[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search & Filters en catálogo
  const [courseSearch, setCourseSearch] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('TODOS');

  // Modal de Conflictos
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);
  const [currentIssues, setCurrentIssues] = useState<ValidationIssue[]>([]);

  // Modal Nuevo Estudiante (Admin)
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentRu, setNewStudentRu] = useState('');
  const [newStudentCareer, setNewStudentCareer] = useState(
    'Ingeniería de Sistemas',
  );

  // Cargar estudiantes y cursos disponibles
  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [studentsList, coursesList] = await Promise.all([
        enrollmentRepository.getStudents(),
        enrollmentRepository.getCourses('2026-I'),
      ]);
      setStudents(studentsList);
      setAvailableCourses(coursesList);

      // Si el usuario es estudiante, encontrar su propio perfil
      if (user?.role === UserRole.ESTUDIANTE && user.student) {
        const myProfile = studentsList.find(
          (s) => s.id === user.student?.id || s.userId === user.id,
        );
        if (myProfile) {
          setSelectedStudent(myProfile);
          loadStudentEnrollments(myProfile.id);
        }
      } else if (studentsList.length > 0) {
        // Por defecto para Admin o Docente, seleccionar el primer estudiante (Mateo Morales)
        const mateo =
          studentsList.find((s) => s.ru === 'RU-2023-01984') || studentsList[0];
        setSelectedStudent(mateo);
        loadStudentEnrollments(mateo.id);
      }
    } catch (err) {
      console.error('Error al cargar datos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStudentEnrollments = async (studentId: string) => {
    try {
      const enrs = await enrollmentRepository.getStudentEnrollments(
        studentId,
        '2026-I',
      );
      setConfirmedEnrollments(enrs);
    } catch (err) {
      console.error('Error al cargar inscripciones del estudiante:', err);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [user]);

  const handleSelectStudent = (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    if (student) {
      setSelectedStudent(student);
      setSelectedCourses([]);
      loadStudentEnrollments(student.id);
    }
  };

  // Agregar materia a la boleta provisoria con validación
  const handleAddCourse = (course: Course) => {
    // Lista de materias ya aprobadas (ej. SIS-201 en el historial)
    const alreadyApprovedCodes = ['SIS-201'];

    // Validar regla de negocio
    const validation = validateEnrollmentSelection(
      selectedCourses,
      course,
      alreadyApprovedCodes,
    );

    if (!validation.isValid) {
      setCurrentIssues(validation.issues);
      setIsConflictModalOpen(true);
      return;
    }

    setSelectedCourses([...selectedCourses, course]);
  };

  const handleRemoveCourse = (courseId: string) => {
    setSelectedCourses(selectedCourses.filter((c) => c.id !== courseId));
  };

  // Confirmar matrícula de todas las materias seleccionadas
  const handleConfirmEnrollment = async () => {
    if (!selectedStudent || selectedCourses.length === 0) return;

    setIsSubmitting(true);
    let successCount = 0;
    const errors: string[] = [];

    for (const course of selectedCourses) {
      try {
        await enrollmentRepository.enrollStudent(
          selectedStudent.id,
          course.id,
          '2026-I',
        );
        successCount++;
      } catch (err: any) {
        errors.push(
          `${course.subject?.code}: ${
            err.response?.data?.message || err.message
          }`,
        );
      }
    }

    setIsSubmitting(false);

    if (errors.length > 0) {
      alert(`Ocurrieron observaciones durante la matrícula:\n${errors.join('\n')}`);
    } else {
      alert(
        `¡Matrícula confirmada con éxito! Se inscribieron ${successCount} asignaturas en la Gestión 2026-I. Boleta generada.`,
      );
    }

    setSelectedCourses([]);
    await loadInitialData();
    if (selectedStudent) {
      await loadStudentEnrollments(selectedStudent.id);
    }
  };

  // Crear estudiante (Admin)
  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await enrollmentRepository.createStudent({
        email: newStudentEmail,
        fullName: newStudentName,
        ru: newStudentRu,
        career: newStudentCareer,
        studyPlan: 'Plan Curricular 2022',
        currentSemester: 1,
      });
      alert('Estudiante registrado exitosamente');
      setIsStudentModalOpen(false);
      setNewStudentEmail('');
      setNewStudentName('');
      setNewStudentRu('');
      await loadInitialData();
      setSelectedStudent(created);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al registrar estudiante');
    }
  };

  // Filtro de cursos
  const filteredCourses = useMemo(() => {
    return availableCourses.filter((c) => {
      const matchSearch =
        !courseSearch ||
        c.subject?.code.toLowerCase().includes(courseSearch.toLowerCase()) ||
        c.subject?.name.toLowerCase().includes(courseSearch.toLowerCase()) ||
        c.teacherName?.toLowerCase().includes(courseSearch.toLowerCase());

      const matchSemester =
        semesterFilter === 'TODOS' ||
        String(c.subject?.semester) === semesterFilter;

      return matchSearch && matchSemester;
    });
  }, [availableCourses, courseSearch, semesterFilter]);

  const totalSelectedCredits = selectedCourses.reduce(
    (acc, c) => acc + (c.subject?.credits || 0),
    0,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">
            PORTAL ACADÉMICO • MATRÍCULA Y ASIGNATURAS • GESTIÓN 2026-I
          </div>
          <h1 className="text-2xl font-bold font-display text-[#0f172a] mt-0.5">
            Matriculación e Inscripción de Materias — Período 2026-I
          </h1>
          <p className="text-xs text-[#64748b] mt-1">
            Búsqueda de alumno, selección de materias con validación de
            prerrequisitos y confirmación segura de matrícula.
          </p>
        </div>

        {user?.role === UserRole.ADMIN && (
          <Button
            variant="institutional"
            size="md"
            onClick={() => setIsStudentModalOpen(true)}
            className="flex items-center gap-2 bg-[#1e3a8a]"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Registrar Estudiante</span>
          </Button>
        )}
      </div>

      {/* Student Selector & Profile Card */}
      <div className="bg-white border border-[#e2e8f0] rounded-lg p-5 shadow-academic-sm">
        {user?.role === UserRole.ADMIN && (
          <div className="mb-4 pb-4 border-b border-[#e2e8f0] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#0f172a]">
                Seleccionar Estudiante a Matricular:
              </span>
              <select
                value={selectedStudent?.id || ''}
                onChange={(e) => handleSelectStudent(e.target.value)}
                className="h-8 px-3 text-xs bg-white border border-[#cbd5e1] rounded-md font-medium text-[#0f172a]"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.ru} — {s.user?.fullName} ({s.career})
                  </option>
                ))}
              </select>
            </div>
            <span className="text-xs text-[#059669] font-semibold bg-[#ecfdf5] px-2.5 py-1 rounded border border-[#a7f3d0]">
              ✓ Perfil Habilitado para Inscripción 2026-I
            </span>
          </div>
        )}

        {selectedStudent && (
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            {/* Student Info */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center font-bold text-xl ring-2 ring-[#e2e8f0]">
                {selectedStudent.user?.fullName ? selectedStudent.user.fullName[0] : 'E'}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-bold font-display text-[#0f172a]">
                    {selectedStudent.user?.fullName || 'Estudiante UNICEN'}
                  </h2>
                  <span className="px-2 py-0.5 bg-[#0f172a] text-white text-[10px] font-bold font-mono rounded">
                    {selectedStudent.ru}
                  </span>
                </div>
                <div className="text-xs text-[#64748b]">
                  {selectedStudent.career} •{' '}
                  <span className="text-[#334155] font-medium">
                    {selectedStudent.studyPlan}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full lg:w-auto text-xs">
              <div className="border-l-2 border-[#1e3a8a] pl-3">
                <div className="text-[10px] text-[#64748b] uppercase font-bold">
                  Avance Curricular
                </div>
                <div className="text-sm font-bold text-[#0f172a] tabular-nums mt-0.5">
                  {selectedStudent.completedCredits} Créditos
                </div>
                <div className="text-[10px] text-[#059669]">
                  Semestre {selectedStudent.currentSemester}
                </div>
              </div>

              <div className="border-l-2 border-[#2563eb] pl-3">
                <div className="text-[10px] text-[#64748b] uppercase font-bold">
                  Promedio Gral.
                </div>
                <div className="text-sm font-bold text-[#0f172a] tabular-nums mt-0.5">
                  {selectedStudent.cumulativeGpa} / 100
                </div>
                <div className="text-[10px] text-[#64748b]">Rendimiento Superior</div>
              </div>

              <div className="border-l-2 border-[#059669] pl-3">
                <div className="text-[10px] text-[#64748b] uppercase font-bold">
                  Estado
                </div>
                <div className="text-sm font-bold text-[#059669] mt-0.5">
                  {selectedStudent.academicStanding}
                </div>
                <div className="text-[10px] text-[#64748b]">Sin observaciones</div>
              </div>

              <div className="border-l-2 border-[#d97706] pl-3">
                <div className="text-[10px] text-[#64748b] uppercase font-bold">
                  Créditos Seleccionados
                </div>
                <div className="text-sm font-bold text-[#0f172a] tabular-nums mt-0.5">
                  {totalSelectedCredits} / 24 CR
                </div>
                <div className="text-[10px] text-[#64748b]">
                  {24 - totalSelectedCredits} CR disponibles
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Two-Column Enrollment Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Courses Catalog (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Catalog Controls */}
          <div className="bg-white border border-[#e2e8f0] rounded-lg p-3 shadow-academic-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-[#0f172a]">Catálogo de Oferta 2026-I:</span>
              <select
                value={semesterFilter}
                onChange={(e) => setSemesterFilter(e.target.value)}
                className="h-8 px-2.5 text-xs bg-[#f8fafc] border border-[#e2e8f0] rounded-md text-[#0f172a]"
              >
                <option value="TODOS">Todos los Semestres</option>
                <option value="4">4° Semestre</option>
                <option value="5">5° Semestre</option>
                <option value="6">6° Semestre</option>
              </select>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#94a3b8]" />
              <input
                type="text"
                value={courseSearch}
                onChange={(e) => setCourseSearch(e.target.value)}
                placeholder="Buscar materia o código..."
                className="h-8 pl-8 pr-3 text-xs bg-[#f8fafc] border border-[#e2e8f0] rounded-md text-[#0f172a] w-56 placeholder-[#94a3b8]"
              />
            </div>
          </div>

          {/* Courses List */}
          <div className="space-y-3">
            {filteredCourses.map((course) => {
              const availableSeats = course.maxCapacity - course.enrolledCount;
              const isFull = availableSeats <= 0;
              const isAlreadySelected = selectedCourses.some(
                (c) => c.id === course.id,
              );
              const isAlreadyEnrolled = confirmedEnrollments.some(
                (enr) => enr.courseId === course.id,
              );

              return (
                <div
                  key={course.id}
                  className={`bg-white border rounded-lg p-4 shadow-academic-sm transition-all ${
                    isAlreadySelected
                      ? 'border-[#1e3a8a] bg-[#f8fafc] ring-1 ring-[#1e3a8a]'
                      : isFull
                      ? 'border-[#fecaca] bg-[#fffafb]'
                      : 'border-[#e2e8f0] hover:border-[#cbd5e1]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    {/* Course details */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-[#0f172a] text-white text-[10px] font-bold font-mono rounded">
                          {course.subject?.code}
                        </span>
                        <span className="text-[11px] font-bold text-[#1e3a8a]">
                          {course.parallel}
                        </span>
                        <span className="text-xs text-[#64748b]">
                          • Semestre {course.subject?.semester}
                        </span>
                      </div>

                      <div className="font-bold text-sm text-[#0f172a] font-display">
                        {course.subject?.name}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#64748b]">
                        <span>Docente: <strong>{course.teacherName}</strong></span>
                        <span>•</span>
                        <span>Aula: <strong>{course.classroom}</strong></span>
                        <span>•</span>
                        <span className="text-[#0f172a] font-bold">
                          {course.subject?.credits} Créditos
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-[#475569] pt-1">
                        <Clock className="w-3.5 h-3.5 text-[#1e3a8a]" />
                        <span>
                          {course.days} ({course.startTime} - {course.endTime})
                        </span>
                      </div>
                    </div>

                    {/* Capacity badge & Action */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2">
                      <div>
                        {isFull ? (
                          <Badge variant="danger">Cupo Lleno (0 Vacantes)</Badge>
                        ) : (
                          <Badge variant="active">
                            Cupo Disponible ({availableSeats} libres)
                          </Badge>
                        )}
                      </div>

                      <div>
                        {isAlreadyEnrolled ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-[#059669] bg-[#ecfdf5] px-2.5 py-1 rounded border border-[#a7f3d0]">
                            <Check className="w-3.5 h-3.5" /> Matriculado
                          </span>
                        ) : isAlreadySelected ? (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveCourse(course.id)}
                            className="flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" /> Quitar
                          </Button>
                        ) : (
                          <Button
                            variant={isFull ? 'outline' : 'institutional'}
                            size="sm"
                            disabled={isFull}
                            onClick={() => handleAddCourse(course)}
                            className="flex items-center gap-1.5"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>{isFull ? 'Cupo Agotado' : 'Agregar Asignatura'}</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Enrollment Summary / Boleta (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-[#e2e8f0] rounded-lg p-5 shadow-academic-sm sticky top-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-3">
              <div>
                <h3 className="text-sm font-bold font-display text-[#0f172a]">
                  Resumen de Inscripción
                </h3>
                <span className="text-[11px] text-[#64748b]">
                  Boleta provisoria sujeta a validación
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase text-[#1e3a8a] bg-[#eff6ff] px-2 py-0.5 rounded border border-[#bfdbfe]">
                Borrador Activo
              </span>
            </div>

            {/* Credits Progress */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#64748b]">Créditos Seleccionados:</span>
                <span className="font-bold tabular-nums text-[#0f172a]">
                  {totalSelectedCredits} / 24 CR
                </span>
              </div>
              <div className="w-full bg-[#e2e8f0] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#1e3a8a] h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min((totalSelectedCredits / 24) * 100, 100)}%`,
                  }}
                ></div>
              </div>
              <div className="text-[10px] text-[#64748b] mt-1 text-right">
                {24 - totalSelectedCredits} créditos disponibles restantes
              </div>
            </div>

            {/* Selected Courses List */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">
                Materias en Boleta ({selectedCourses.length}):
              </div>

              {selectedCourses.length === 0 ? (
                <div className="p-6 border border-dashed border-[#cbd5e1] rounded-md text-center text-xs text-[#64748b]">
                  No has seleccionado asignaturas aún. Selecciona cursos del
                  catálogo a la izquierda para armar tu semestre.
                </div>
              ) : (
                selectedCourses.map((c) => (
                  <div
                    key={c.id}
                    className="p-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-md flex items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="font-bold text-[#0f172a]">
                        {c.subject?.code} - {c.subject?.name}
                      </div>
                      <div className="text-[10px] text-[#64748b]">
                        {c.parallel} • {c.days} ({c.startTime}-{c.endTime}) •{' '}
                        <strong>{c.subject?.credits} CR</strong>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveCourse(c.id)}
                      className="p-1 text-[#dc2626] hover:bg-[#fef2f2] rounded transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Confirmed Enrollments in Term */}
            {confirmedEnrollments.length > 0 && (
              <div className="pt-3 border-t border-[#e2e8f0]">
                <div className="text-[11px] font-bold text-[#059669] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>Materias ya Confirmadas ({confirmedEnrollments.length}):</span>
                </div>
                <div className="space-y-1.5">
                  {confirmedEnrollments.map((enr) => (
                    <div
                      key={enr.id}
                      className="text-xs p-2 bg-[#ecfdf5] border border-[#a7f3d0] rounded text-[#065f46] flex justify-between"
                    >
                      <span>
                        {enr.course?.subject?.code} - {enr.course?.parallel}
                      </span>
                      <span className="font-bold">
                        {enr.course?.subject?.credits} CR
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action CTA */}
            <div className="pt-2">
              <Button
                variant="primary"
                size="lg"
                disabled={selectedCourses.length === 0}
                isLoading={isSubmitting}
                onClick={handleConfirmEnrollment}
                className="w-full bg-[#0f172a] hover:bg-[#1e293b] flex items-center justify-center gap-2 text-xs uppercase tracking-wide font-bold"
              >
                <Lock className="w-4 h-4" />
                <span>Confirmar y Finalizar Matrícula 2026-I</span>
              </Button>
              <p className="text-[10px] text-[#64748b] text-center mt-2">
                Validación criptográfica y firma digital emitida al guardar.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Validación de Matrícula y Prevención de Conflictos (Exact from students_and_register.png) */}
      <Modal
        isOpen={isConflictModalOpen}
        onClose={() => setIsConflictModalOpen(false)}
        title="Validación de Matrícula y Prevención de Conflictos"
        subtitle="Auditoría académica en tiempo real • Sistema UNICEN 2026"
        maxWidth="xl"
      >
        <div className="space-y-4">
          <div className="p-3 bg-[#fef2f2] border border-[#fecaca] rounded-md flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#dc2626] flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-xs text-[#991b1b]">
                ¡Atención! Se han detectado observaciones en la selección de materias:
              </h4>
              <p className="text-xs text-[#7f1d1d] mt-0.5">
                El motor de registro institucional no permite emitir la boleta
                final con colisiones de horario, cupos agotados o re-inscripción
                de materias ya aprobadas.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {currentIssues.map((issue, idx) => (
              <div
                key={idx}
                className="p-3 bg-[#fffafb] border border-[#fecaca] rounded-md text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#dc2626] uppercase text-[11px] flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    {issue.type}
                  </span>
                  <span className="text-[10px] bg-[#dc2626] text-white font-bold px-1.5 py-0.2 rounded">
                    BLOQUEO PREVENTIVO
                  </span>
                </div>
                <div className="font-bold text-[#0f172a] text-xs">
                  {issue.message}
                </div>
                {issue.details && (
                  <div className="text-[11px] text-[#64748b]">
                    {issue.details}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-md text-xs flex items-center justify-between text-[#64748b]">
            <span>
              Estudiante: <strong>{selectedStudent?.user?.fullName}</strong> ({selectedStudent?.ru})
            </span>
            <span className="tabular-nums">
              {new Date().toLocaleDateString('es-BO')}
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#e2e8f0]">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsConflictModalOpen(false)}
            >
              Ajustar Selección de Paralelos
            </Button>
            <Button
              variant="institutional"
              size="sm"
              onClick={() => setIsConflictModalOpen(false)}
            >
              Entendido
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Registrar Estudiante (Admin) */}
      <Modal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        title="Registrar Nuevo Estudiante UNICEN"
        subtitle="Crea el usuario y la ficha académica oficial del estudiante"
        maxWidth="md"
      >
        <form onSubmit={handleCreateStudent} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold mb-1 text-[#0f172a]">
              Nombre Completo:
            </label>
            <input
              type="text"
              required
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
              placeholder="Ej. Lucas Alexander Torrico"
              className="w-full h-9 px-3 bg-white border border-[#e2e8f0] rounded-md"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-[#0f172a]">
              Correo Institucional:
            </label>
            <input
              type="email"
              required
              value={newStudentEmail}
              onChange={(e) => setNewStudentEmail(e.target.value)}
              placeholder="lucas.torrico@unicen.edu.bo"
              className="w-full h-9 px-3 bg-white border border-[#e2e8f0] rounded-md"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1 text-[#0f172a]">
                RU (Registro Universitario):
              </label>
              <input
                type="text"
                required
                value={newStudentRu}
                onChange={(e) => setNewStudentRu(e.target.value)}
                placeholder="RU-2026-02480"
                className="w-full h-9 px-3 bg-white border border-[#e2e8f0] rounded-md font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-[#0f172a]">
                Carrera:
              </label>
              <select
                value={newStudentCareer}
                onChange={(e) => setNewStudentCareer(e.target.value)}
                className="w-full h-9 px-3 bg-white border border-[#e2e8f0] rounded-md"
              >
                <option value="Ingeniería de Sistemas">Ingeniería de Sistemas</option>
                <option value="Ingeniería Comercial">Ingeniería Comercial</option>
                <option value="Derecho">Derecho</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-[#e2e8f0]">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setIsStudentModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button variant="institutional" size="sm" type="submit">
              Guardar y Habilitar Matrícula
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

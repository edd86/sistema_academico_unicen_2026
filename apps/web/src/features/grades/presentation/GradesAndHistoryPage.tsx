import React, { useEffect, useState, useMemo } from 'react';
import {
  GraduationCap,
  History,
  FileCheck2,
  Lock,
  Save,
  Calculator,
  Search,
  Filter,
  AlertTriangle,
  RotateCcw,
  CheckCircle,
} from 'lucide-react';
import { HttpGradeRepository } from '../infrastructure/http-grade.repository';
import { HttpCourseRepository } from '../../courses/infrastructure/http-course.repository';
import { HttpEnrollmentRepository } from '../../enrollments/infrastructure/http-enrollment.repository';
import { gradesUseCases } from '../application/grades.use-cases';
import { coursesUseCases } from '../../courses/application/courses.use-cases';
import { CourseGradesPayload, AcademicHistory } from '../domain/grade';
import { Course } from '../../courses/domain/course';
import { StudentProfile } from '../../enrollments/domain/enrollment';
import { MetricCard } from '../../../core/ui/MetricCard';
import { Badge } from '../../../core/ui/Badge';
import { Button } from '../../../core/ui/Button';
import { useAuth } from '../../auth/application/useAuth';
import { UserRole, GradeCondition } from '@unicen/shared';

const gradeRepository = new HttpGradeRepository();
const courseRepository = new HttpCourseRepository();
const enrollmentRepository = new HttpEnrollmentRepository();

export const GradesAndHistoryPage: React.FC = () => {
  const { user } = useAuth();

  // Permiso de edición de notas: sólo DOCENTE o ADMIN
  const isEditable =
    user?.role === UserRole.DOCENTE || user?.role === UserRole.ADMIN;

  const [activeTab, setActiveTab] = useState<'teacher' | 'student'>(
    user?.role === UserRole.ESTUDIANTE ? 'student' : 'teacher',
  );

  // Cursos disponibles para el selector docente
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');

  // Datos de la planilla docente
  const [gradesData, setGradesData] = useState<CourseGradesPayload | null>(null);
  const [localRecords, setLocalRecords] = useState<any[]>([]);
  const [filterOnlyAtRisk, setFilterOnlyAtRisk] = useState(false);
  const [searchStudent, setSearchStudent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Datos del historial estudiantil
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [academicHistory, setAcademicHistory] =
    useState<AcademicHistory | null>(null);

  // 1. Cargar cursos iniciales
  useEffect(() => {
    const init = async () => {
      try {
        const [courseList, studentList] = await Promise.all([
          coursesUseCases.getCatalog(courseRepository, { term: '2026-I' }),
          enrollmentRepository.getStudents().catch(() => []),
        ]);
        setCourses(courseList);
        setStudents(studentList);

        if (courseList.length > 0) {
          // Seleccionar por defecto SIS-301 Paralelo A
          const sis301 =
            courseList.find(
              (c) =>
                c.subject?.code === 'SIS-301' && c.parallel === 'Paralelo A',
            ) || courseList[0];
          setSelectedCourseId(sis301.id);
        }

        if (user?.role === UserRole.ESTUDIANTE && user.student) {
          setSelectedStudentId(user.student.id);
        } else if (studentList.length > 0) {
          const mateo =
            studentList.find((s) => s.ru === 'RU-2023-01984') || studentList[0];
          setSelectedStudentId(mateo.id);
        }
      } catch (err) {
        console.error('Error al inicializar calificaciones:', err);
      }
    };
    init();
  }, [user]);

  // 2. Cargar notas de curso cuando cambie selectedCourseId
  const loadCourseGrades = async () => {
    if (!selectedCourseId) return;
    setIsLoading(true);
    try {
      const data = await gradesUseCases.getCourseGrades(
        gradeRepository,
        selectedCourseId,
      );
      setGradesData(data);
      setLocalRecords(data.records);
    } catch (err) {
      console.error('Error al cargar matriz de notas:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'teacher' && selectedCourseId) {
      loadCourseGrades();
    }
  }, [selectedCourseId, activeTab]);

  // 3. Cargar historial académico
  const loadHistory = async () => {
    try {
      if (user?.role === UserRole.ESTUDIANTE) {
        const history = await gradesUseCases.getMyAcademicHistory(gradeRepository);
        setAcademicHistory(history);
      } else if (selectedStudentId) {
        const history = await gradesUseCases.getStudentAcademicHistory(
          gradeRepository,
          selectedStudentId,
        );
        setAcademicHistory(history);
      }
    } catch (err) {
      console.error('Error al cargar historial académico:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'student') {
      loadHistory();
    }
  }, [selectedStudentId, activeTab]);

  // Manejo de cambio en inputs numéricos de notas
  const handleScoreChange = (
    enrollmentId: string,
    field: 'partial1' | 'partial2' | 'labs' | 'finalExam' | 'attendancePercentage',
    value: string,
  ) => {
    if (!isEditable) return;

    const numValue = value === '' ? null : Number(value);

    setLocalRecords((prev) =>
      prev.map((r) => {
        if (r.enrollmentId !== enrollmentId) return r;

        const updated = { ...r, [field]: numValue };

        // Recalcular nota final en tiempo real en la UI
        const p1 = updated.partial1 != null ? Number(updated.partial1) : 0;
        const p2 = updated.partial2 != null ? Number(updated.partial2) : 0;
        const lb = updated.labs != null ? Number(updated.labs) : 0;
        const fe = updated.finalExam != null ? Number(updated.finalExam) : 0;

        const sum = Math.round(p1 + p2 + lb + fe);
        updated.finalGrade = sum;

        if (sum >= 51) {
          updated.condition = GradeCondition.APROBADO;
        } else if (sum >= 40) {
          updated.condition = GradeCondition.EN_RIESGO;
        } else {
          updated.condition = GradeCondition.REPROBADO;
        }

        return updated;
      }),
    );
  };

  // Guardar todas las notas modificadas
  const handleSaveGrades = async () => {
    if (!isEditable) return;
    setIsSaving(true);
    try {
      for (const r of localRecords) {
        await gradesUseCases.updateGrade(gradeRepository, r.enrollmentId, {
          partial1: r.partial1,
          partial2: r.partial2,
          labs: r.labs,
          finalExam: r.finalExam,
          attendancePercentage: r.attendancePercentage,
        });
      }
      alert('Planilla de calificaciones guardada y sincronizada con éxito');
      await loadCourseGrades();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al guardar calificaciones');
    } finally {
      setIsSaving(false);
    }
  };

  // Cerrar acta
  const handleCloseActa = async () => {
    if (!isEditable || !selectedCourseId) return;
    if (
      !confirm(
        '¿Está seguro de firmar digitalmente y cerrar el acta oficial? Esta acción es irreversible.',
      )
    ) {
      return;
    }

    try {
      await gradesUseCases.closeActa(gradeRepository, selectedCourseId);
      alert('Acta firmada digitalmente y cerrada exitosamente.');
      await loadCourseGrades();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al cerrar acta');
    }
  };

  // Filtrado de estudiantes en la planilla
  const filteredRecords = useMemo(() => {
    return localRecords.filter((r) => {
      const matchSearch =
        !searchStudent ||
        r.studentName.toLowerCase().includes(searchStudent.toLowerCase()) ||
        r.ru.toLowerCase().includes(searchStudent.toLowerCase());

      const matchAtRisk = !filterOnlyAtRisk || r.condition === GradeCondition.EN_RIESGO || (r.finalGrade != null && r.finalGrade < 51);

      return matchSearch && matchAtRisk;
    });
  }, [localRecords, searchStudent, filterOnlyAtRisk]);

  const selectedCourse = courses.find((c) => c.id === selectedCourseId);

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">
            UNICEN SISACAD • FACULTAD DE INGENIERÍA Y CIENCIAS • MÓDULO 4: CALIFICACIONES Y ACTAS
          </div>
          <h1 className="text-2xl font-bold font-display text-[#0f172a] mt-0.5">
            Calificaciones, Actas e Historial Académico
          </h1>
          <p className="text-xs text-[#64748b] mt-1">
            Registro ponderado de evaluaciones continuas, emisión de actas
            oficiales y consulta del expediente estudiantil.
          </p>
        </div>

        {/* View Switcher Tabs (Matching grades_history.png top switcher) */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-[#cbd5e1] shadow-academic-sm">
          <button
            onClick={() => setActiveTab('teacher')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'teacher'
                ? 'bg-[#1e3a8a] text-white shadow-academic-sm'
                : 'text-[#475569] hover:bg-[#f1f5f9]'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Vista Docente: Planilla y Matriz</span>
            <span className="px-1.5 py-0.2 bg-white/20 text-white text-[10px] rounded">
              SIS-301
            </span>
          </button>

          <button
            onClick={() => setActiveTab('student')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'student'
                ? 'bg-[#1e3a8a] text-white shadow-academic-sm'
                : 'text-[#475569] hover:bg-[#f1f5f9]'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Vista Estudiante: Historial y Expediente</span>
            <span className="px-1.5 py-0.2 bg-white/20 text-white text-[10px] rounded">
              Consolidado
            </span>
          </button>
        </div>
      </div>

      {activeTab === 'teacher' ? (
        /* ================= VISTA DOCENTE ================= */
        <div className="space-y-6">
          {/* Course Banner & Actions */}
          <div className="bg-white border border-[#e2e8f0] rounded-lg p-5 shadow-academic-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-[#0f172a] text-white text-xs font-bold font-mono rounded">
                  {selectedCourse?.subject?.code || 'SIS-301'}
                </span>
                <h2 className="text-lg font-bold font-display text-[#0f172a]">
                  {selectedCourse?.subject?.name ||
                    'Estructuras de Datos Avanzadas'} — {selectedCourse?.parallel || 'Paralelo A'}
                </h2>
                <span className="px-2 py-0.5 bg-[#eff6ff] text-[#1e3a8a] border border-[#bfdbfe] text-[11px] font-semibold rounded">
                  Gestión 2026-I
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-[#64748b]">
                <span>
                  Docente Titular: <strong>{selectedCourse?.teacherName || user?.fullName}</strong>
                </span>
                <span>•</span>
                <span>
                  Alumnos Matriculados: <strong>{localRecords.length} inscritos</strong>
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1.5 text-[#059669] font-semibold">
                  <span className="w-2 h-2 rounded-full bg-[#059669]"></span>
                  <span>Estado: En Proceso de Llenado</span>
                </span>
              </div>
            </div>

            {/* Selector de Cursos y Botones de Acción */}
            <div className="flex flex-wrap items-center gap-2.5">
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="h-9 px-3 text-xs bg-white border border-[#cbd5e1] rounded-md font-semibold text-[#0f172a]"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.subject?.code} - {c.parallel} ({c.days})
                  </option>
                ))}
              </select>

              {isEditable && (
                <>
                  <Button
                    variant="secondary"
                    size="md"
                    isLoading={isSaving}
                    onClick={handleSaveGrades}
                    className="flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4 text-[#1e3a8a]" />
                    <span>Guardar Borrador</span>
                  </Button>

                  <Button
                    variant="institutional"
                    size="md"
                    onClick={handleSaveGrades}
                    className="flex items-center gap-1.5 bg-[#eff6ff] text-[#1e3a8a] border-[#bfdbfe] hover:bg-[#dbeafe]"
                  >
                    <Calculator className="w-4 h-4" />
                    <span>Calcular Ponderaciones</span>
                  </Button>

                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleCloseActa}
                    className="flex items-center gap-1.5 bg-[#0f172a] hover:bg-[#1e293b]"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Firmar Digitalmente y Cerrar Acta</span>
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* 3 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricCard
              label="Promedio General del Curso"
              value={`${gradesData?.metrics.courseAverage || 78.4} / 100 pts`}
              accentColor="#1e3a8a"
              subValue="+3.2 pts vs semestre 2025-II"
            />

            <MetricCard
              label="% Aprobados Proyectados"
              value={`${gradesData?.metrics.projectedPassPercentage || 87.5}%`}
              accentColor="#059669"
              subValue={`${Math.round(
                ((gradesData?.metrics.projectedPassPercentage || 87.5) *
                  localRecords.length) /
                  100,
              )} de ${localRecords.length} alumnos`}
            />

            <MetricCard
              label="Estudiantes en Riesgo (<51 pts)"
              value={`${gradesData?.metrics.atRiskCount || 0} alumnos`}
              accentColor="#dc2626"
              badge={
                <button
                  onClick={() => setFilterOnlyAtRisk(!filterOnlyAtRisk)}
                  className={`px-2 py-0.5 text-xs font-bold rounded border cursor-pointer transition-colors flex items-center gap-1 ${
                    filterOnlyAtRisk
                      ? 'bg-[#dc2626] text-white border-[#dc2626]'
                      : 'bg-[#fef2f2] text-[#dc2626] border-[#fecaca] hover:bg-[#fee2e2]'
                  }`}
                >
                  <Filter className="w-3 h-3" />
                  <span>{filterOnlyAtRisk ? 'Ver Todos' : 'Filtrar'}</span>
                </button>
              }
              subValue="Requieren tutoría de refuerzo UAP"
            />
          </div>

          {/* Evaluation Matrix Data Table */}
          <div className="bg-white border border-[#e2e8f0] rounded-lg shadow-academic-sm overflow-hidden">
            {/* Table Header Filter */}
            <div className="p-4 border-b border-[#e2e8f0] flex flex-wrap items-center justify-between gap-3 bg-[#f8fafc]">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-[#0f172a] font-display">
                  Registro Nominal de Evaluaciones:
                </span>
                <span className="text-xs bg-[#e2e8f0] text-[#334155] font-semibold px-2 py-0.5 rounded">
                  {filteredRecords.length} de {localRecords.length} Registros
                </span>
                {!isEditable && (
                  <span className="text-[11px] font-semibold text-[#64748b] bg-[#fffbeb] px-2 py-0.5 rounded border border-[#fde68a]">
                    Modo Lectura (Rol: {user?.role})
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#94a3b8]" />
                  <input
                    type="text"
                    value={searchStudent}
                    onChange={(e) => setSearchStudent(e.target.value)}
                    placeholder="Buscar por apellido o RU..."
                    className="h-8 pl-8 pr-3 text-xs bg-white border border-[#cbd5e1] rounded-md text-[#0f172a] w-56"
                  />
                </div>
                <button
                  onClick={() => {
                    setSearchStudent('');
                    setFilterOnlyAtRisk(false);
                  }}
                  title="Restablecer filtros"
                  className="h-8 px-2.5 bg-white border border-[#cbd5e1] rounded-md text-xs text-[#64748b] hover:text-[#0f172a] flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restablecer</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="h-10 bg-[#f8fafc] border-b border-[#cbd5e1] text-[#475569] font-bold text-[11px] uppercase tracking-wider">
                    <th className="px-3 py-2 w-12 text-center">#</th>
                    <th className="px-4 py-2">Estudiante / Matrícula</th>
                    <th className="px-3 py-2 text-center">
                      Parcial 1<br />
                      <span className="text-[10px] text-[#64748b] font-normal">
                        25 PTS (25%)
                      </span>
                    </th>
                    <th className="px-3 py-2 text-center">
                      Parcial 2<br />
                      <span className="text-[10px] text-[#64748b] font-normal">
                        25 PTS (25%)
                      </span>
                    </th>
                    <th className="px-3 py-2 text-center">
                      Labs / Práct.<br />
                      <span className="text-[10px] text-[#64748b] font-normal">
                        20 PTS (20%)
                      </span>
                    </th>
                    <th className="px-3 py-2 text-center">
                      Examen Final<br />
                      <span className="text-[10px] text-[#64748b] font-normal">
                        30 PTS (30%)
                      </span>
                    </th>
                    <th className="px-4 py-2 text-center bg-[#f1f5f9] border-x border-[#e2e8f0]">
                      Nota Final<br />
                      <span className="text-[10px] text-[#1e3a8a] font-normal">
                        Ponderado 100
                      </span>
                    </th>
                    <th className="px-3 py-2 text-center">Condición Semántica</th>
                    <th className="px-3 py-2 text-center">Asistencia</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#e2e8f0]">
                  {isLoading ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-[#64748b]">
                        Cargando matriz de calificaciones...
                      </td>
                    </tr>
                  ) : filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-[#64748b]">
                        No se encontraron registros de estudiantes en este paralelo.
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((record, index) => {
                      const isPassing =
                        record.finalGrade != null && record.finalGrade >= 51;
                      const isAtRisk =
                        record.finalGrade != null && record.finalGrade < 51;

                      return (
                        <tr
                          key={record.id}
                          className="hover:bg-[#f8fafc] transition-colors"
                        >
                          {/* # */}
                          <td className="px-3 py-2 text-center font-mono text-[#64748b] tabular-nums">
                            {String(index + 1).padStart(2, '0')}
                          </td>

                          {/* Estudiante / Matrícula */}
                          <td className="px-4 py-2.5">
                            <div className="font-bold text-xs text-[#0f172a]">
                              {record.studentName}
                            </div>
                            <div className="text-[10px] text-[#64748b] font-mono">
                              {record.ru} • {record.career}
                            </div>
                          </td>

                          {/* Parcial 1 (25) */}
                          <td className="px-3 py-2 text-center">
                            <input
                              type="number"
                              min={0}
                              max={25}
                              aria-label={`Parcial 1 para ${record.studentName}`}
                              disabled={!isEditable || record.isClosed}
                              value={record.partial1 ?? ''}
                              onChange={(e) =>
                                handleScoreChange(
                                  record.enrollmentId,
                                  'partial1',
                                  e.target.value,
                                )
                              }
                              className={`w-14 h-8 text-center font-bold font-mono text-xs border rounded-md transition-colors tabular-nums ${
                                !isEditable || record.isClosed
                                  ? 'bg-[#f1f5f9] text-[#64748b] border-[#cbd5e1] cursor-not-allowed'
                                  : 'bg-white border-[#cbd5e1] text-[#0f172a] focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]'
                              }`}
                            />
                          </td>

                          {/* Parcial 2 (25) */}
                          <td className="px-3 py-2 text-center">
                            <input
                              type="number"
                              min={0}
                              max={25}
                              aria-label={`Parcial 2 para ${record.studentName}`}
                              disabled={!isEditable || record.isClosed}
                              value={record.partial2 ?? ''}
                              onChange={(e) =>
                                handleScoreChange(
                                  record.enrollmentId,
                                  'partial2',
                                  e.target.value,
                                )
                              }
                              className={`w-14 h-8 text-center font-bold font-mono text-xs border rounded-md transition-colors tabular-nums ${
                                !isEditable || record.isClosed
                                  ? 'bg-[#f1f5f9] text-[#64748b] border-[#cbd5e1] cursor-not-allowed'
                                  : 'bg-white border-[#cbd5e1] text-[#0f172a] focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]'
                              }`}
                            />
                          </td>

                          {/* Labs (20) */}
                          <td className="px-3 py-2 text-center">
                            <input
                              type="number"
                              min={0}
                              max={20}
                              aria-label={`Labs para ${record.studentName}`}
                              disabled={!isEditable || record.isClosed}
                              value={record.labs ?? ''}
                              onChange={(e) =>
                                handleScoreChange(
                                  record.enrollmentId,
                                  'labs',
                                  e.target.value,
                                )
                              }
                              className={`w-14 h-8 text-center font-bold font-mono text-xs border rounded-md transition-colors tabular-nums ${
                                !isEditable || record.isClosed
                                  ? 'bg-[#f1f5f9] text-[#64748b] border-[#cbd5e1] cursor-not-allowed'
                                  : 'bg-white border-[#cbd5e1] text-[#0f172a] focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]'
                              }`}
                            />
                          </td>

                          {/* Examen Final (30) */}
                          <td className="px-3 py-2 text-center">
                            <input
                              type="number"
                              min={0}
                              max={30}
                              aria-label={`Examen Final para ${record.studentName}`}
                              disabled={!isEditable || record.isClosed}
                              value={record.finalExam ?? ''}
                              onChange={(e) =>
                                handleScoreChange(
                                  record.enrollmentId,
                                  'finalExam',
                                  e.target.value,
                                )
                              }
                              className={`w-14 h-8 text-center font-bold font-mono text-xs border rounded-md transition-colors tabular-nums ${
                                !isEditable || record.isClosed
                                  ? 'bg-[#f1f5f9] text-[#64748b] border-[#cbd5e1] cursor-not-allowed'
                                  : 'bg-white border-[#cbd5e1] text-[#0f172a] focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]'
                              }`}
                            />
                          </td>

                          {/* Nota Final */}
                          <td className="px-4 py-2 text-center bg-[#f8fafc] border-x border-[#e2e8f0]">
                            <span
                              className={`text-sm font-bold font-mono tabular-nums ${
                                isPassing
                                  ? 'text-[#0f172a]'
                                  : isAtRisk
                                  ? 'text-[#dc2626]'
                                  : 'text-[#64748b]'
                              }`}
                            >
                              {record.finalGrade != null
                                ? record.finalGrade
                                : '--'}
                            </span>
                          </td>

                          {/* Condición */}
                          <td className="px-3 py-2 text-center">
                            {record.condition === GradeCondition.APROBADO ? (
                              <Badge variant="active">APROBADO</Badge>
                            ) : record.condition === GradeCondition.EN_RIESGO ? (
                              <Badge variant="danger">EN RIESGO</Badge>
                            ) : record.condition === GradeCondition.REPROBADO ? (
                              <Badge variant="danger">REPROBADO</Badge>
                            ) : (
                              <Badge variant="neutral">PENDIENTE</Badge>
                            )}
                          </td>

                          {/* Asistencia */}
                          <td className="px-3 py-2 text-center font-mono text-xs tabular-nums text-[#334155]">
                            {record.attendancePercentage != null
                              ? `${record.attendancePercentage}%`
                              : '100%'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer Status */}
            <div className="p-3 border-t border-[#e2e8f0] bg-[#f8fafc] flex items-center justify-between text-xs text-[#64748b]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#059669]"></span>
                <span>Auto-guardado local activo • Ponderación automática UNICEN</span>
              </div>
              <span className="font-mono text-[11px]">
                Reglamento Académico Art. 62
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* ================= VISTA ESTUDIANTE (HISTORIAL ACADÉMICO) ================= */
        <div className="space-y-6">
          {/* Header Ficha Estudiantil */}
          {user?.role !== UserRole.ESTUDIANTE && (
            <div className="bg-white border border-[#e2e8f0] rounded-lg p-4 shadow-academic-sm flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-[#0f172a]">
                  Consultar Historial del Estudiante:
                </span>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="h-8 px-3 text-xs bg-white border border-[#cbd5e1] rounded-md font-medium text-[#0f172a]"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.ru} — {s.user?.fullName} ({s.career})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {academicHistory && (
            <>
              {/* Summary KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <MetricCard
                  label="Promedio General Ponderado"
                  value={`${academicHistory.overallGpa} / 100`}
                  accentColor="#1e3a8a"
                  subValue="Histórico acumulado de notas"
                />

                <MetricCard
                  label="Total Créditos Aprobados"
                  value={`${academicHistory.totalCreditsApproved} CR`}
                  accentColor="#059669"
                  subValue={`De ${academicHistory.student?.totalCreditsRequired || 210} créditos del plan`}
                />

                <MetricCard
                  label="Estado Académico Oficial"
                  value={academicHistory.student?.academicStanding || 'Regular'}
                  accentColor="#2563eb"
                  subValue={academicHistory.student?.studyPlan || 'Plan 2022'}
                />
              </div>

              {/* Records grouped by Term */}
              {Object.keys(academicHistory.recordsByTerm).map((term) => {
                const termRecords = academicHistory.recordsByTerm[term];

                return (
                  <div
                    key={term}
                    className="bg-white border border-[#e2e8f0] rounded-lg shadow-academic-sm overflow-hidden"
                  >
                    <div className="px-5 py-3.5 bg-[#f8fafc] border-b border-[#cbd5e1] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm font-display text-[#0f172a]">
                          Período Académico {term}
                        </span>
                        <span className="text-xs bg-[#eff6ff] text-[#1e3a8a] border border-[#bfdbfe] px-2 py-0.5 rounded font-semibold">
                          {termRecords.length} Asignaturas
                        </span>
                      </div>
                      <span className="text-xs text-[#64748b]">
                        Facultad de Ingeniería y Ciencias
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="h-9 bg-[#f8fafc] border-b border-[#e2e8f0] text-[#475569] font-semibold text-[11px] uppercase tracking-wider">
                            <th className="px-4 py-2">Código</th>
                            <th className="px-4 py-2">Asignatura</th>
                            <th className="px-4 py-2 text-center">Créditos</th>
                            <th className="px-4 py-2">Docente</th>
                            <th className="px-4 py-2 text-center">Nota Final</th>
                            <th className="px-4 py-2 text-center">Condición</th>
                            <th className="px-4 py-2 text-center">Asistencia</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e2e8f0]">
                          {termRecords.map((item) => (
                            <tr
                              key={item.id}
                              className="hover:bg-[#f8fafc] transition-colors"
                            >
                              <td className="px-4 py-2.5 font-mono font-bold text-[#0f172a]">
                                {item.subjectCode}
                              </td>
                              <td className="px-4 py-2.5 font-semibold text-[#0f172a]">
                                {item.subjectName}
                              </td>
                              <td className="px-4 py-2.5 text-center font-mono">
                                {item.credits} CR
                              </td>
                              <td className="px-4 py-2.5 text-[#475569]">
                                {item.teacherName}
                              </td>
                              <td className="px-4 py-2.5 text-center font-bold font-mono text-sm tabular-nums text-[#0f172a]">
                                {item.finalGrade != null ? item.finalGrade : '--'}
                              </td>
                              <td className="px-4 py-2.5 text-center">
                                {item.condition === GradeCondition.APROBADO ? (
                                  <Badge variant="active">APROBADO</Badge>
                                ) : item.condition ===
                                  GradeCondition.EN_RIESGO ? (
                                  <Badge variant="warning">EN RIESGO</Badge>
                                ) : item.condition ===
                                  GradeCondition.REPROBADO ? (
                                  <Badge variant="danger">REPROBADO</Badge>
                                ) : (
                                  <Badge variant="neutral">EN CURSO</Badge>
                                )}
                              </td>
                              <td className="px-4 py-2.5 text-center font-mono text-[#334155]">
                                {item.attendancePercentage}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
};

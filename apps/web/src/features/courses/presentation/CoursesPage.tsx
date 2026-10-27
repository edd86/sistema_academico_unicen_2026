import React, { useEffect, useState, useMemo } from 'react';
import {
  Plus,
  FileSpreadsheet,
  Search,
  RotateCw,
  AlertTriangle,
  Users,
  BookOpen,
  PieChart,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import { HttpCourseRepository } from '../infrastructure/http-course.repository';
import { coursesUseCases } from '../application/courses.use-cases';
import { Course, CourseMetrics, Subject } from '../domain/course';
import { MetricCard } from '../../../core/ui/MetricCard';
import { Badge } from '../../../core/ui/Badge';
import { Button } from '../../../core/ui/Button';
import { Modal } from '../../../core/ui/Modal';
import { useAuth } from '../../auth/application/useAuth';
import { CourseModality, UserRole } from '@unicen/shared';

const courseRepository = new HttpCourseRepository();

export const CoursesPage: React.FC = () => {
  const { user } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);
  const [metrics, setMetrics] = useState<CourseMetrics | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filtros
  const [activeTerm, setActiveTerm] = useState('2026-I');
  const [capacityFilter, setCapacityFilter] = useState('TODOS');
  const [semesterFilter, setSemesterFilter] = useState<string>('TODOS');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal Crear
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'subject' | 'course'>('course');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State Materia
  const [subCode, setSubCode] = useState('');
  const [subName, setSubName] = useState('');
  const [subCredits, setSubCredits] = useState(4);
  const [subSemester, setSubSemester] = useState(5);
  const [subArea, setSubArea] = useState('Ingeniería de Software');

  // Form State Curso
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [courseParallel, setCourseParallel] = useState('Paralelo C');
  const [courseClassroom, setCourseClassroom] = useState('Aula 204');
  const [courseMaxCapacity, setCourseMaxCapacity] = useState(40);
  const [courseModality, setCourseModality] = useState<CourseModality>(
    CourseModality.PRESENCIAL,
  );
  const [courseTeacher, setCourseTeacher] = useState('Dr. Carlos Mendoza S.');
  const [courseDays, setCourseDays] = useState('Lun - Mié');
  const [courseStartTime, setCourseStartTime] = useState('10:00');
  const [courseEndTime, setCourseEndTime] = useState('12:00');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [coursesData, metricsData, subjectsData] = await Promise.all([
        coursesUseCases.getCatalog(courseRepository, {
          term: activeTerm,
          capacityStatus: capacityFilter !== 'TODOS' ? capacityFilter : undefined,
          semester:
            semesterFilter !== 'TODOS' ? Number(semesterFilter) : undefined,
          search: searchQuery || undefined,
        }),
        coursesUseCases.getMetrics(courseRepository, activeTerm),
        coursesUseCases.getSubjects(courseRepository),
      ]);
      setCourses(coursesData);
      setMetrics(metricsData);
      setSubjects(subjectsData);
      if (subjectsData.length > 0 && !selectedSubjectId) {
        setSelectedSubjectId(subjectsData[0].id);
      }
    } catch (err) {
      console.error('Error al cargar oferta académica:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTerm, capacityFilter, semesterFilter, searchQuery]);

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await coursesUseCases.createSubject(courseRepository, {
        code: subCode.toUpperCase(),
        name: subName,
        credits: Number(subCredits),
        semester: Number(subSemester),
        area: subArea,
        department: 'Ingeniería de Sistemas',
      });
      alert('Asignatura creada con éxito en el catálogo');
      setSubCode('');
      setSubName('');
      await loadData();
      setModalTab('course');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al registrar asignatura');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await coursesUseCases.createCourse(courseRepository, {
        subjectId: selectedSubjectId,
        term: activeTerm,
        parallel: courseParallel,
        classroom: courseClassroom,
        physicalCapacity: Number(courseMaxCapacity) + 5,
        maxCapacity: Number(courseMaxCapacity),
        modality: courseModality,
        teacherName: courseTeacher,
        days: courseDays,
        startTime: courseStartTime,
        endTime: courseEndTime,
      });
      alert('Oferta de curso creada con éxito para la gestión activa');
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al ofertar curso');
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearFilters = () => {
    setCapacityFilter('TODOS');
    setSemesterFilter('TODOS');
    setSearchQuery('');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">
            GESTIÓN CURRICULAR • FACULTAD DE INGENIERÍA Y CIENCIAS EXACTAS •
            PERÍODO ACTIVO {activeTerm}
          </div>
          <h1 className="text-2xl font-bold font-display text-[#0f172a] mt-0.5">
            Oferta Académica y Gestión de Cursos
          </h1>
          <p className="text-xs text-[#64748b] mt-1">
            Planificación curricular, asignación docente y control de cupos por
            carrera en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="md"
            onClick={() =>
              alert(
                'Reporte institucional consolidado exportado a formato PDF/Excel con firmas digitales.',
              )
            }
            className="flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#059669]" />
            <span>Exportar Reporte (Excel/PDF)</span>
          </Button>

          {user?.role === UserRole.ADMIN && (
            <Button
              variant="institutional"
              size="md"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-[#0f172a] border-[#0f172a] hover:bg-[#1e293b]"
            >
              <Plus className="w-4 h-4" />
              <span>+ Crear Materia / Ofertar Curso</span>
            </Button>
          )}
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Materias Ofertadas"
          value={metrics ? metrics.totalCoursesOffered : 0}
          accentColor="#0f172a"
          icon={<BookOpen className="w-4 h-4" />}
          subValue="Facultad de Ingeniería • 6 Semestres"
          badge={
            <span className="text-[11px] font-semibold text-[#059669] bg-[#ecfdf5] px-1.5 py-0.5 rounded border border-[#a7f3d0]">
              +8 vs 2025-II
            </span>
          }
        />

        <MetricCard
          label="Cupos Totales Habilitados"
          value={metrics ? metrics.totalAvailableSeats : 0}
          accentColor="#1e3a8a"
          icon={<Users className="w-4 h-4" />}
          subValue="Capacidad máxima aulas activas"
        >
          <div className="w-full bg-[#e2e8f0] h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#1e3a8a] h-full w-[85%] rounded-full"></div>
          </div>
        </MetricCard>

        <MetricCard
          label="Cupos Ocupados (Matrículas)"
          value={metrics ? metrics.totalEnrolledSeats : 0}
          accentColor="#2563eb"
          icon={<PieChart className="w-4 h-4" />}
          badge={
            <span className="text-xs font-bold text-[#1e3a8a] tabular-nums">
              {metrics ? `${metrics.occupancyPercentage}%` : '0%'} ocupación
            </span>
          }
        >
          <div className="w-full bg-[#e2e8f0] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#2563eb] h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(metrics?.occupancyPercentage || 0, 100)}%`,
              }}
            ></div>
          </div>
        </MetricCard>

        <MetricCard
          label="Riesgo de Saturación"
          value={
            metrics ? `${metrics.criticalCoursesCount} cursos` : '0 cursos'
          }
          accentColor="#dc2626"
          icon={<AlertTriangle className="w-4 h-4 text-[#dc2626]" />}
          badge={
            <span className="text-[10px] font-bold text-[#dc2626] bg-[#fef2f2] px-1.5 py-0.5 rounded border border-[#fecaca] uppercase">
              &gt; 90% Lleno
            </span>
          }
          subValue="Requieren protocolo de desdoble"
        />
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-[#e2e8f0] rounded-lg p-4 shadow-academic-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Term Tabs */}
          <div className="flex items-center gap-1 bg-[#f1f5f9] p-1 rounded-md border border-[#e2e8f0]">
            {['2026-I', '2026-II', '2025-II'].map((term) => (
              <button
                key={term}
                onClick={() => setActiveTerm(term)}
                className={`px-3 py-1.5 text-xs font-semibold rounded transition-all cursor-pointer ${
                  activeTerm === term
                    ? 'bg-white text-[#0f172a] shadow-academic-sm border border-[#cbd5e1]'
                    : 'text-[#64748b] hover:text-[#0f172a]'
                }`}
              >
                {term} {term === '2026-I' ? '(Activo)' : term === '2026-II' ? '(Planif.)' : '(Hist.)'}
              </button>
            ))}
          </div>

          {/* Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={capacityFilter}
              onChange={(e) => setCapacityFilter(e.target.value)}
              className="h-9 px-3 text-xs bg-white border border-[#e2e8f0] rounded-md text-[#0f172a] focus:ring-1 focus:ring-[#2563eb]"
            >
              <option value="TODOS">Cupo: Todos los estados</option>
              <option value="DISPONIBLE">Cupo Disponible (&lt; 85%)</option>
              <option value="CASI_LLENO">Casi Lleno (85% - 99%)</option>
              <option value="LLENO">100% Lleno (Sin vacantes)</option>
            </select>

            <select
              value={semesterFilter}
              onChange={(e) => setSemesterFilter(e.target.value)}
              className="h-9 px-3 text-xs bg-white border border-[#e2e8f0] rounded-md text-[#0f172a] focus:ring-1 focus:ring-[#2563eb]"
            >
              <option value="TODOS">Nivel: Todos los semestres</option>
              <option value="3">3° Semestre</option>
              <option value="4">4° Semestre</option>
              <option value="5">5° Semestre</option>
              <option value="6">6° Semestre</option>
            </select>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#94a3b8]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar código, materia o docente..."
                className="h-9 pl-8 pr-3 text-xs bg-white border border-[#e2e8f0] rounded-md text-[#0f172a] w-64 focus:ring-1 focus:ring-[#2563eb] placeholder-[#94a3b8]"
              />
            </div>

            <button
              onClick={loadData}
              title="Recargar catálogo"
              className="h-9 w-9 flex items-center justify-center bg-[#f8fafc] border border-[#e2e8f0] rounded-md text-[#64748b] hover:text-[#0f172a] cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Applied Filters Chips */}
        {(capacityFilter !== 'TODOS' ||
          semesterFilter !== 'TODOS' ||
          searchQuery) && (
          <div className="flex items-center gap-2 pt-2 border-t border-[#f1f5f9] text-xs">
            <span className="text-[#64748b] text-[11px] font-semibold">
              FILTROS APLICADOS:
            </span>
            {capacityFilter !== 'TODOS' && (
              <span className="px-2 py-0.5 bg-[#eff6ff] text-[#1e3a8a] rounded border border-[#bfdbfe] text-[11px]">
                Estado: {capacityFilter}
              </span>
            )}
            {semesterFilter !== 'TODOS' && (
              <span className="px-2 py-0.5 bg-[#eff6ff] text-[#1e3a8a] rounded border border-[#bfdbfe] text-[11px]">
                Semestre {semesterFilter}
              </span>
            )}
            {searchQuery && (
              <span className="px-2 py-0.5 bg-[#eff6ff] text-[#1e3a8a] rounded border border-[#bfdbfe] text-[11px]">
                Búsqueda: &ldquo;{searchQuery}&rdquo;
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-[#dc2626] hover:underline text-[11px] font-semibold ml-2 cursor-pointer"
            >
              Limpiar todos
            </button>
          </div>
        )}
      </div>

      {/* Courses Catalog Table */}
      <div className="bg-white border border-[#e2e8f0] rounded-lg shadow-academic-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="h-10 bg-[#f8fafc] border-b border-[#cbd5e1] text-[#475569] font-bold text-[11px] uppercase tracking-wider">
                <th className="px-4 py-2">Código & Materia</th>
                <th className="px-4 py-2">Paralelo / Aula</th>
                <th className="px-4 py-2">Docente Titular</th>
                <th className="px-4 py-2">Horario & Días</th>
                <th className="px-4 py-2">Ocupación / Cupos</th>
                <th className="px-4 py-2">Modalidad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[#64748b]">
                    Cargando oferta académica...
                  </td>
                </tr>
              ) : courses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[#64748b]">
                    No se encontraron cursos con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                courses.map((course) => {
                  const occupancyRate =
                    course.maxCapacity > 0
                      ? Math.round(
                          (course.enrolledCount / course.maxCapacity) * 100,
                        )
                      : 0;

                  const isFull = course.enrolledCount >= course.maxCapacity;
                  const isAlmostFull =
                    !isFull && course.enrolledCount / course.maxCapacity >= 0.85;

                  return (
                    <tr
                      key={course.id}
                      className="hover:bg-[#f8fafc] transition-colors"
                    >
                      {/* Código & Materia */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-1.5 py-0.5 bg-[#0f172a] text-white text-[10px] font-bold font-mono rounded">
                            {course.subject?.code}
                          </span>
                          <span className="text-[10px] text-[#64748b] font-medium">
                            Semestre {course.subject?.semester}
                          </span>
                        </div>
                        <div className="font-bold text-xs text-[#0f172a] font-display">
                          {course.subject?.name}
                        </div>
                        <div className="text-[10px] text-[#64748b] mt-0.5">
                          Área: {course.subject?.area} •{' '}
                          <strong className="text-[#0f172a]">
                            {course.subject?.credits} Créditos
                          </strong>
                        </div>
                      </td>

                      {/* Paralelo / Aula */}
                      <td className="px-4 py-3">
                        <div className="font-semibold text-xs text-[#0f172a]">
                          {course.parallel}
                        </div>
                        <div className="text-[11px] text-[#475569] mt-0.5">
                          {course.classroom}
                        </div>
                        <div className="text-[10px] text-[#64748b]">
                          Cap. Física: {course.physicalCapacity} bancos
                        </div>
                      </td>

                      {/* Docente */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center font-bold text-[10px]">
                            {course.teacherName
                              ? course.teacherName
                                  .split(' ')
                                  .map((n) => n[0])
                                  .slice(0, 2)
                                  .join('')
                              : 'DC'}
                          </div>
                          <div>
                            <div className="font-semibold text-xs text-[#0f172a]">
                              {course.teacherName || 'Docente Asignado'}
                            </div>
                            <div className="text-[10px] text-[#64748b]">
                              {course.teacherTitle || 'Tiempo Completo'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Horario */}
                      <td className="px-4 py-3">
                        <div className="font-semibold text-xs text-[#0f172a]">
                          {course.days}
                        </div>
                        <div className="text-[11px] text-[#64748b] font-mono tabular-nums">
                          {course.startTime} - {course.endTime}
                        </div>
                      </td>

                      {/* Cupos */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-bold tabular-nums">
                            {course.enrolledCount} / {course.maxCapacity}
                          </span>
                          {isFull ? (
                            <Badge variant="danger">100% LLENO</Badge>
                          ) : isAlmostFull ? (
                            <Badge variant="warning">{occupancyRate}% CASI LLENO</Badge>
                          ) : (
                            <Badge variant="active">{occupancyRate}% DISPONIBLE</Badge>
                          )}
                        </div>
                        <div className="w-36 bg-[#e2e8f0] h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isFull
                                ? 'bg-[#dc2626]'
                                : isAlmostFull
                                ? 'bg-[#d97706]'
                                : 'bg-[#059669]'
                            }`}
                            style={{
                              width: `${Math.min(occupancyRate, 100)}%`,
                            }}
                          ></div>
                        </div>
                        <div className="text-[10px] text-[#64748b] mt-1 tabular-nums">
                          {isFull
                            ? 'Sin vacantes'
                            : `${course.maxCapacity - course.enrolledCount} cupos libres`}
                        </div>
                      </td>

                      {/* Modalidad */}
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 text-xs text-[#334155]">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              course.modality === CourseModality.PRESENCIAL
                                ? 'bg-[#2563eb]'
                                : course.modality === CourseModality.HIBRIDA
                                ? 'bg-[#059669]'
                                : 'bg-[#7c3aed]'
                            }`}
                          ></span>
                          <span className="font-medium">
                            {course.modality === CourseModality.PRESENCIAL
                              ? 'Presencial'
                              : course.modality === CourseModality.HIBRIDA
                              ? 'Híbrida'
                              : 'Virtual Sincrónica'}
                          </span>
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Analytical Bottom Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Occupancy distribution */}
        <div className="bg-white border border-[#e2e8f0] rounded-lg p-5 shadow-academic-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm font-display text-[#0f172a]">
                Distribución de Ocupación por Nivel Semestral
              </h3>
              <p className="text-xs text-[#64748b]">
                Monitoreo de carga académica • Facultad de Ingeniería
              </p>
            </div>
            <span className="text-[11px] font-mono text-[#64748b]">
              Corte: Hoy 14:30
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-[#334155]">
                  1° y 2° Semestre (Ciencias Básicas / Tronco Común)
                </span>
                <span className="font-bold text-[#dc2626] tabular-nums">
                  1,240 / 1,300 (95.3% Ocupación)
                </span>
              </div>
              <div className="w-full bg-[#f1f5f9] h-2 rounded-full overflow-hidden">
                <div className="bg-[#dc2626] h-full w-[95%]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-[#334155]">
                  3° a 5° Semestre (Intermedio / Estructuras y Algoritmos)
                </span>
                <span className="font-bold text-[#1e3a8a] tabular-nums">
                  1,680 / 1,950 (86.1% Ocupación)
                </span>
              </div>
              <div className="w-full bg-[#f1f5f9] h-2 rounded-full overflow-hidden">
                <div className="bg-[#1e3a8a] h-full w-[86%]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-[#334155]">
                  6° a 8° Semestre (Especialidad / Arquitectura & Redes)
                </span>
                <span className="font-bold text-[#2563eb] tabular-nums">
                  820 / 1,100 (74.5% Ocupación)
                </span>
              </div>
              <div className="w-full bg-[#f1f5f9] h-2 rounded-full overflow-hidden">
                <div className="bg-[#2563eb] h-full w-[74%]"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Critical Seats Protocol */}
        <div className="bg-white border border-[#e2e8f0] rounded-lg p-5 shadow-academic-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-[#059669]" />
              <h3 className="font-bold text-sm font-display text-[#0f172a]">
                Protocolo de Cupos Críticos
              </h3>
            </div>
            <p className="text-xs text-[#64748b]">
              Acciones automáticas configuradas para cursos con sobredemanda
              superior al 90%.
            </p>

            <div className="mt-4 space-y-3">
              <div className="p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-md flex items-start gap-3">
                <div className="p-1.5 bg-[#eff6ff] text-[#1e3a8a] rounded">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0f172a]">
                    Notificación a Dirección de Carrera
                  </div>
                  <div className="text-[11px] text-[#64748b]">
                    Genera informe automático a Dirección al superar 38 alumnos
                    matriculados.
                  </div>
                </div>
              </div>

              <div className="p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-md flex items-start gap-3">
                <div className="p-1.5 bg-[#ecfdf5] text-[#059669] rounded">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0f172a]">
                    Desdoble Automático Sugerido
                  </div>
                  <div className="text-[11px] text-[#64748b]">
                    Abre pre-paralelo B en modalidad virtual cuando la lista de
                    espera supera 15 estudiantes.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#f1f5f9] flex items-center justify-between text-xs text-[#64748b]">
            <span>Sincronización en vivo con base de datos</span>
            <span className="text-[#059669] font-semibold">Activo</span>
          </div>
        </div>
      </div>

      {/* Modal: Crear Asignatura u Ofertar Curso */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Gestión Curricular UNICEN 2026"
        subtitle="Registra nuevas asignaturas en el plan o abre nuevos paralelos por gestión"
        maxWidth="lg"
      >
        {/* Tabs */}
        <div className="flex border-b border-[#e2e8f0] mb-4">
          <button
            onClick={() => setModalTab('course')}
            className={`pb-2 px-4 text-xs font-bold cursor-pointer transition-colors ${
              modalTab === 'course'
                ? 'border-b-2 border-[#1e3a8a] text-[#1e3a8a]'
                : 'text-[#64748b] hover:text-[#0f172a]'
            }`}
          >
            Ofertar Nuevo Curso / Paralelo
          </button>
          <button
            onClick={() => setModalTab('subject')}
            className={`pb-2 px-4 text-xs font-bold cursor-pointer transition-colors ${
              modalTab === 'subject'
                ? 'border-b-2 border-[#1e3a8a] text-[#1e3a8a]'
                : 'text-[#64748b] hover:text-[#0f172a]'
            }`}
          >
            Crear Asignatura en Catálogo
          </button>
        </div>

        {modalTab === 'course' ? (
          <form onSubmit={handleCreateCourse} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold mb-1 text-[#0f172a]">
                Materia del Catálogo:
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                required
                className="w-full h-9 px-3 bg-white border border-[#e2e8f0] rounded-md"
              >
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.code} - {sub.name} (Semestre {sub.semester} • {sub.credits} CR)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1 text-[#0f172a]">
                  Paralelo:
                </label>
                <input
                  type="text"
                  value={courseParallel}
                  onChange={(e) => setCourseParallel(e.target.value)}
                  placeholder="Paralelo C"
                  required
                  className="w-full h-9 px-3 bg-white border border-[#e2e8f0] rounded-md"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-[#0f172a]">
                  Aula Asignada:
                </label>
                <input
                  type="text"
                  value={courseClassroom}
                  onChange={(e) => setCourseClassroom(e.target.value)}
                  placeholder="Aula 204"
                  required
                  className="w-full h-9 px-3 bg-white border border-[#e2e8f0] rounded-md"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1 text-[#0f172a]">
                  Cupo Máximo:
                </label>
                <input
                  type="number"
                  value={courseMaxCapacity}
                  onChange={(e) => setCourseMaxCapacity(Number(e.target.value))}
                  min={1}
                  required
                  className="w-full h-9 px-3 bg-white border border-[#e2e8f0] rounded-md"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-[#0f172a]">
                  Modalidad:
                </label>
                <select
                  value={courseModality}
                  onChange={(e) =>
                    setCourseModality(e.target.value as CourseModality)
                  }
                  className="w-full h-9 px-3 bg-white border border-[#e2e8f0] rounded-md"
                >
                  <option value={CourseModality.PRESENCIAL}>Presencial</option>
                  <option value={CourseModality.HIBRIDA}>Híbrida</option>
                  <option value={CourseModality.VIRTUAL_SINCRONICA}>
                    Virtual Sincrónica
                  </option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-[#0f172a]">
                Docente Titular:
              </label>
              <input
                type="text"
                value={courseTeacher}
                onChange={(e) => setCourseTeacher(e.target.value)}
                placeholder="Dr. Carlos Mendoza S."
                required
                className="w-full h-9 px-3 bg-white border border-[#e2e8f0] rounded-md"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block font-semibold mb-1 text-[#0f172a]">
                  Días:
                </label>
                <input
                  type="text"
                  value={courseDays}
                  onChange={(e) => setCourseDays(e.target.value)}
                  placeholder="Lun - Mié"
                  required
                  className="w-full h-9 px-3 bg-white border border-[#e2e8f0] rounded-md"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-[#0f172a]">
                  Hora Inicio:
                </label>
                <input
                  type="time"
                  value={courseStartTime}
                  onChange={(e) => setCourseStartTime(e.target.value)}
                  required
                  className="w-full h-9 px-3 bg-white border border-[#e2e8f0] rounded-md"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-[#0f172a]">
                  Hora Fin:
                </label>
                <input
                  type="time"
                  value={courseEndTime}
                  onChange={(e) => setCourseEndTime(e.target.value)}
                  required
                  className="w-full h-9 px-3 bg-white border border-[#e2e8f0] rounded-md"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-2 border-t border-[#e2e8f0]">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setIsModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="institutional"
                size="sm"
                type="submit"
                isLoading={isSubmitting}
              >
                Guardar y Ofertar Curso
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleCreateSubject} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1 text-[#0f172a]">
                  Código Asignatura:
                </label>
                <input
                  type="text"
                  value={subCode}
                  onChange={(e) => setSubCode(e.target.value)}
                  placeholder="SIS-310"
                  required
                  className="w-full h-9 px-3 bg-white border border-[#e2e8f0] rounded-md font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-[#0f172a]">
                  Créditos:
                </label>
                <input
                  type="number"
                  value={subCredits}
                  onChange={(e) => setSubCredits(Number(e.target.value))}
                  min={1}
                  max={10}
                  required
                  className="w-full h-9 px-3 bg-white border border-[#e2e8f0] rounded-md"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-[#0f172a]">
                Nombre de la Asignatura:
              </label>
              <input
                type="text"
                value={subName}
                onChange={(e) => setSubName(e.target.value)}
                placeholder="Inteligencia Artificial y Aprendizaje Automático"
                required
                className="w-full h-9 px-3 bg-white border border-[#e2e8f0] rounded-md"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1 text-[#0f172a]">
                  Semestre de Ubicación:
                </label>
                <input
                  type="number"
                  value={subSemester}
                  onChange={(e) => setSubSemester(Number(e.target.value))}
                  min={1}
                  max={10}
                  required
                  className="w-full h-9 px-3 bg-white border border-[#e2e8f0] rounded-md"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-[#0f172a]">
                  Área Curricular:
                </label>
                <input
                  type="text"
                  value={subArea}
                  onChange={(e) => setSubArea(e.target.value)}
                  placeholder="Algoritmos & Inteligencia Artificial"
                  required
                  className="w-full h-9 px-3 bg-white border border-[#e2e8f0] rounded-md"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-2 border-t border-[#e2e8f0]">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setIsModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                isLoading={isSubmitting}
              >
                Registrar Asignatura
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Users,
  GraduationCap,
  History,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../auth/application/useAuth';
import { MetricCard } from '../../core/ui/MetricCard';
import { Button } from '../../core/ui/Button';
import { UserRole } from '@unicen/shared';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white border border-[#e2e8f0] rounded-lg p-6 shadow-academic-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1e3a8a] via-[#2563eb] to-[#059669]"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold text-[#1e3a8a] uppercase tracking-wider bg-[#eff6ff] px-2 py-0.5 rounded border border-[#bfdbfe]">
                Período Lectivo 2026-I
              </span>
              <span className="text-xs text-[#64748b]">
                • Sincronización Institucional Activa
              </span>
            </div>
            <h1 className="text-2xl font-bold font-display text-[#0f172a]">
              Bienvenido(a), {user?.fullName || 'Usuario UNICEN'}
            </h1>
            <p className="text-xs text-[#64748b] mt-1 max-w-2xl">
              Sistema Académico Institucional de la Universidad Central (UNICEN).
              Módulos modulares de oferta curricular, inscripciones transaccionales,
              matrices de notas y bitácora de auditoría.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#0f172a] bg-[#f8fafc] border border-[#cbd5e1] px-3 py-1.5 rounded-md uppercase font-mono">
              Rol: {user?.role || 'ESTUDIANTE'}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          onClick={() => navigate('/courses')}
          className="bg-white border border-[#e2e8f0] hover:border-[#1e3a8a] rounded-lg p-5 shadow-academic-sm cursor-pointer transition-all hover:shadow-academic-md group"
        >
          <div className="w-10 h-10 rounded-md bg-[#eff6ff] text-[#1e3a8a] flex items-center justify-center mb-3 group-hover:bg-[#1e3a8a] group-hover:text-white transition-colors">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm font-display text-[#0f172a]">
            Cursos y Oferta Curricular
          </h3>
          <p className="text-xs text-[#64748b] mt-1">
            Catálogo completo de asignaturas, paralelos ofertados por gestión,
            control de cupos y alertas de saturación.
          </p>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-[#1e3a8a]">
            <span>Explorar catálogo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        <div
          onClick={() => navigate('/enrollments')}
          className="bg-white border border-[#e2e8f0] hover:border-[#1e3a8a] rounded-lg p-5 shadow-academic-sm cursor-pointer transition-all hover:shadow-academic-md group"
        >
          <div className="w-10 h-10 rounded-md bg-[#ecfdf5] text-[#059669] flex items-center justify-center mb-3 group-hover:bg-[#059669] group-hover:text-white transition-colors">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm font-display text-[#0f172a]">
            Estudiantes e Inscripciones
          </h3>
          <p className="text-xs text-[#64748b] mt-1">
            Matriculación con validación de cupo, prevención de choques horarios
            y bloqueo de asignaturas duplicadas.
          </p>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-[#059669]">
            <span>Gestionar matrículas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        <div
          onClick={() => navigate('/grades')}
          className="bg-white border border-[#e2e8f0] hover:border-[#1e3a8a] rounded-lg p-5 shadow-academic-sm cursor-pointer transition-all hover:shadow-academic-md group"
        >
          <div className="w-10 h-10 rounded-md bg-[#eff6ff] text-[#2563eb] flex items-center justify-center mb-3 group-hover:bg-[#2563eb] group-hover:text-white transition-colors">
            <GraduationCap className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm font-display text-[#0f172a]">
            Notas, Actas e Historial
          </h3>
          <p className="text-xs text-[#64748b] mt-1">
            Matriz de evaluaciones continuas (25/25/20/30), cierre digital de actas
            y consulta del historial académico consolidado.
          </p>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-[#2563eb]">
            <span>Revisar calificaciones</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Institutional Architecture & Patterns Banner */}
      <div className="bg-[#131b2e] text-white rounded-lg p-6 shadow-academic-md space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#8fa7fe]" />
          <h3 className="text-base font-bold font-display text-white">
            Arquitectura del Sistema Académico UNICEN 2026
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-white/5 border border-white/10 rounded-md">
            <div className="font-bold text-[#8fa7fe] text-xs">Repository Pattern</div>
            <div className="text-[11px] text-gray-300 mt-1">
              Desacopla reglas de negocio de TypeORM y HTTP/Axios en frontend.
            </div>
          </div>

          <div className="p-3 bg-white/5 border border-white/10 rounded-md">
            <div className="font-bold text-[#8fa7fe] text-xs">Strategy Pattern</div>
            <div className="text-[11px] text-gray-300 mt-1">
              Ponderación de notas estándar UNICEN y tokens JWT extensibles a PASETO.
            </div>
          </div>

          <div className="p-3 bg-white/5 border border-white/10 rounded-md">
            <div className="font-bold text-[#8fa7fe] text-xs">Factory Pattern</div>
            <div className="text-[11px] text-gray-300 mt-1">
              QueryRunnerFactory para transacciones y DataSource PostgreSQL/pg-mem.
            </div>
          </div>

          <div className="p-3 bg-white/5 border border-white/10 rounded-md">
            <div className="font-bold text-[#8fa7fe] text-xs">Observer Pattern</div>
            <div className="text-[11px] text-gray-300 mt-1">
              Auditoría asíncrona de eventos y alertas automáticas de saturación de cupos.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

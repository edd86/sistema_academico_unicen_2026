import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  GraduationCap,
  History,
  ShieldAlert,
  LogOut,
  Calendar,
  Search,
  Bell,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../../features/auth/application/useAuth';
import { UserRole } from '@unicen/shared';

export interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard / Inicio',
      icon: <LayoutDashboard className="w-4 h-4" />,
      roles: [UserRole.ADMIN, UserRole.DOCENTE, UserRole.ESTUDIANTE],
    },
    {
      to: '/courses',
      label: 'Cursos y Oferta Académica',
      icon: <BookOpen className="w-4 h-4" />,
      roles: [UserRole.ADMIN, UserRole.DOCENTE, UserRole.ESTUDIANTE],
    },
    {
      to: '/enrollments',
      label: 'Inscripciones y Estudiantes',
      icon: <Users className="w-4 h-4" />,
      roles: [UserRole.ADMIN, UserRole.DOCENTE, UserRole.ESTUDIANTE],
    },
    {
      to: '/grades',
      label: 'Calificaciones y Actas',
      icon: <GraduationCap className="w-4 h-4" />,
      roles: [UserRole.ADMIN, UserRole.DOCENTE, UserRole.ESTUDIANTE],
    },
    {
      to: '/history',
      label: 'Historial Académico',
      icon: <History className="w-4 h-4" />,
      roles: [UserRole.ADMIN, UserRole.DOCENTE, UserRole.ESTUDIANTE],
    },
    {
      to: '/audit',
      label: 'Configuración / Auditoría',
      icon: <ShieldAlert className="w-4 h-4" />,
      roles: [UserRole.ADMIN],
    },
  ];

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] text-[#0f172a] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-white border-r border-[#e2e8f0] flex flex-col justify-between select-none">
        <div>
          {/* Header */}
          <div className="h-16 px-5 border-b border-[#e2e8f0] flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#1e3a8a] text-white flex items-center justify-center font-bold text-sm">
              U
            </div>
            <div>
              <div className="font-bold text-xs tracking-wider text-[#0f172a] uppercase font-display">
                UNICEN
              </div>
              <div className="text-[11px] text-[#64748b] font-medium">
                SIST. ACADÉMICO <span className="text-[#1e3a8a] font-semibold">v2.6</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="px-3 py-4">
            <div className="px-3 mb-2 text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider">
              Navegación Principal
            </div>
            <nav className="space-y-1">
              {navItems
                .filter((item) => !user || item.roles.includes(user.role))
                .map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                        isActive
                          ? 'bg-[#131b2e] text-white shadow-academic-sm'
                          : 'text-[#475569] hover:bg-[#f1f5f9] hover:text-[#0f172a]'
                      }`
                    }
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </NavLink>
                ))}
            </nav>
          </div>
        </div>

        {/* Bottom system status */}
        <div className="p-4 border-t border-[#e2e8f0] bg-[#f8fafc] flex items-center justify-between text-[11px] text-[#64748b]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#059669]"></span>
            <span>En línea</span>
          </div>
          <span className="tabular-nums font-mono">v2.6.0 - 2026</span>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-[#e2e8f0] px-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-[#64748b]">
              <span className="font-semibold text-[#0f172a]">Sistema Académico</span>
              <span>/</span>
              <span>Facultad de Ingeniería y Ciencias</span>
            </div>

            <div className="hidden md:flex items-center gap-2 bg-[#f1f5f9] border border-[#e2e8f0] px-3 py-1.5 rounded-md text-xs font-medium text-[#1e3a8a]">
              <Calendar className="w-3.5 h-3.5 text-[#1e3a8a]" />
              <span>Gestión Activa: <strong>2026-I (Semestre Regular)</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Search */}
            <div className="hidden lg:flex items-center gap-2 bg-[#f8fafc] border border-[#e2e8f0] px-3 py-1.5 rounded-md text-xs text-[#94a3b8] w-56">
              <Search className="w-3.5 h-3.5" />
              <span>Buscar... ⌘K</span>
            </div>

            <button className="p-2 text-[#64748b] hover:text-[#0f172a] hover:bg-[#f1f5f9] rounded-md transition-colors cursor-pointer">
              <Bell className="w-4 h-4" />
            </button>
            <button className="p-2 text-[#64748b] hover:text-[#0f172a] hover:bg-[#f1f5f9] rounded-md transition-colors cursor-pointer">
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* User Profile */}
            <div className="h-8 w-[1px] bg-[#e2e8f0] mx-1"></div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold text-[#0f172a]">
                  {user?.fullName || 'Usuario UNICEN'}
                </div>
                <div className="text-[10px] text-[#64748b] font-medium flex items-center justify-end gap-1">
                  <span className="uppercase font-semibold text-[#1e3a8a]">
                    {user?.role || 'ESTUDIANTE'}
                  </span>
                  <span>•</span>
                  <span>{user?.department || 'Facultad de Ingeniería'}</span>
                </div>
              </div>

              <div className="w-8 h-8 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center font-bold text-xs ring-2 ring-[#e2e8f0]">
                {user?.fullName ? user.fullName[0] : 'U'}
              </div>

              <button
                onClick={handleLogout}
                title="Cerrar Sesión"
                className="p-1.5 text-[#dc2626] hover:bg-[#fef2f2] rounded-md transition-colors cursor-pointer ml-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Viewport */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#f8fafc]">
          {children}
        </main>
      </div>
    </div>
  );
};

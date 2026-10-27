import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  GraduationCap,
  BookOpen,
  Building,
} from 'lucide-react';
import { useAuth } from '../application/useAuth';
import { UserRole } from '@unicen/shared';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('coordinacion.acad@unicen.edu.bo');
  const [password, setPassword] = useState('Unicen2026*');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [selectedRoleTab, setSelectedRoleTab] = useState<UserRole>(
    UserRole.ADMIN,
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRoleTab(role);
    setError(null);
    if (role === UserRole.ADMIN) {
      setEmail('coordinacion.acad@unicen.edu.bo');
      setPassword('Unicen2026*');
    } else if (role === UserRole.DOCENTE) {
      setEmail('carlos.mendoza@unicen.edu.bo');
      setPassword('Unicen2026*');
    } else if (role === UserRole.ESTUDIANTE) {
      setEmail('mateo.morales@unicen.edu.bo');
      setPassword('Unicen2026*');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const user = await login({ email, password });
      // Redirección inteligente según rol
      if (user.role === UserRole.ADMIN) {
        navigate('/courses');
      } else if (user.role === UserRole.DOCENTE) {
        navigate('/grades');
      } else if (user.role === UserRole.ESTUDIANTE) {
        navigate('/enrollments');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Las credenciales ingresadas no corresponden al período lectivo 2026-I o la cuenta requiere verificación.';
      setError(
        typeof msg === 'string'
          ? msg
          : 'Las credenciales ingresadas no corresponden al período lectivo 2026-I.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white border border-[#cbd5e1] rounded-lg shadow-academic-lg overflow-hidden">
        {/* Top Status Bar */}
        <div className="px-6 py-2.5 bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center justify-between text-xs text-[#64748b]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2563eb]"></span>
            <span className="font-semibold text-[#0f172a] uppercase tracking-wider text-[11px]">
              PERÍODO LECTIVO 2026-I
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#eff6ff] text-[#1e3a8a] border border-[#bfdbfe] rounded text-[11px] font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>TLS 1.3 Seguro</span>
          </div>
        </div>

        {/* Brand & Title */}
        <div className="p-8 pb-4 text-center">
          <div className="inline-flex items-center justify-center gap-2 mb-3">
            <div className="w-9 h-9 rounded bg-[#1e3a8a] text-white flex items-center justify-center font-bold text-base">
              A
            </div>
            <div className="text-left">
              <div className="font-extrabold text-sm tracking-wider text-[#0f172a] uppercase font-display leading-none">
                UNICEN
              </div>
              <div className="text-[10px] text-[#64748b] font-medium tracking-tight">
                UNIVERSIDAD CENTRAL
              </div>
            </div>
          </div>

          <h1 className="text-2xl font-bold font-display text-[#0f172a] tracking-tight">
            Portal Académico Institucional 2026
          </h1>
          <p className="text-xs text-[#64748b] mt-1.5 max-w-xs mx-auto">
            Ingresa con tus credenciales unificadas de la Universidad Central
          </p>

          {/* Quick Role Selector */}
          <div className="mt-6 text-left">
            <label className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wider block mb-2">
              Tipo de Usuario / Acceso:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleRoleSelect(UserRole.ADMIN)}
                className={`relative p-2.5 rounded-md border text-left transition-all cursor-pointer ${
                  selectedRoleTab === UserRole.ADMIN
                    ? 'border-[#1e3a8a] bg-[#eff6ff] text-[#0f172a] shadow-academic-sm ring-1 ring-[#1e3a8a]'
                    : 'border-[#e2e8f0] bg-white hover:bg-[#f8fafc] text-[#475569]'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold font-display">
                  <Building className="w-3.5 h-3.5 text-[#1e3a8a]" />
                  <span>Admin / Coord</span>
                </div>
                <div className="text-[10px] text-[#64748b] mt-0.5">
                  Gestión Global
                </div>
                <span className="absolute -top-2 right-1 px-1.5 py-0.2 bg-[#1e3a8a] text-white text-[9px] font-bold rounded">
                  Acceso Total
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect(UserRole.DOCENTE)}
                className={`p-2.5 rounded-md border text-left transition-all cursor-pointer ${
                  selectedRoleTab === UserRole.DOCENTE
                    ? 'border-[#1e3a8a] bg-[#eff6ff] text-[#0f172a] shadow-academic-sm ring-1 ring-[#1e3a8a]'
                    : 'border-[#e2e8f0] bg-white hover:bg-[#f8fafc] text-[#475569]'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold font-display">
                  <GraduationCap className="w-3.5 h-3.5 text-[#1e3a8a]" />
                  <span>Docente</span>
                </div>
                <div className="text-[10px] text-[#64748b] mt-0.5">
                  Cátedra y Actas
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect(UserRole.ESTUDIANTE)}
                className={`p-2.5 rounded-md border text-left transition-all cursor-pointer ${
                  selectedRoleTab === UserRole.ESTUDIANTE
                    ? 'border-[#1e3a8a] bg-[#eff6ff] text-[#0f172a] shadow-academic-sm ring-1 ring-[#1e3a8a]'
                    : 'border-[#e2e8f0] bg-white hover:bg-[#f8fafc] text-[#475569]'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold font-display">
                  <BookOpen className="w-3.5 h-3.5 text-[#1e3a8a]" />
                  <span>Estudiante</span>
                </div>
                <div className="text-[10px] text-[#64748b] mt-0.5">
                  Matrícula y Notas
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-4">
          {/* Error Banner */}
          {error && (
            <div
              role="alert"
              className="p-3 bg-[#fef2f2] border border-[#fecaca] rounded-md text-xs text-[#991b1b] flex items-start gap-2.5 animate-in fade-in"
            >
              <AlertCircle className="w-4 h-4 text-[#dc2626] flex-shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block">
                  Error de autenticación
                </strong>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Email input */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label
                htmlFor="email"
                className="text-xs font-semibold text-[#0f172a]"
              >
                Correo Electrónico Institucional
              </label>
              <span className="text-[10px] text-[#64748b]">
                Dominio @unicen.edu.bo
              </span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94a3b8]">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="coordinacion.acad@unicen.edu.bo"
                className="w-full h-10 pl-9 pr-3 text-xs bg-white border border-[#e2e8f0] rounded-md focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] focus:outline-none transition-all text-[#0f172a] placeholder-[#94a3b8]"
              />
            </div>
          </div>

          {/* Password input */}
          <div>
            <label
              htmlFor="password"
              className="text-xs font-semibold text-[#0f172a] block mb-1"
            >
              Contraseña Institucional
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94a3b8]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full h-10 pl-9 pr-10 text-xs bg-white border border-[#e2e8f0] rounded-md focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] focus:outline-none transition-all text-[#0f172a] placeholder-[#94a3b8]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#94a3b8] hover:text-[#0f172a] cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Remember me & forgot password */}
          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer select-none text-[#475569]">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 text-[#2563eb] border-[#cbd5e1] rounded focus:ring-[#2563eb]"
              />
              <span>Mantener sesión iniciada</span>
            </label>
            <a
              href="#help"
              onClick={(e) => {
                e.preventDefault();
                alert(
                  'Para restablecer su clave institucional, comuníquese con Mesa de Ayuda TI (Int. 4022) o dev.asi3@unicen.edu.bo',
                );
              }}
              className="text-[#1e3a8a] hover:underline font-medium"
            >
              ¿Cuenta bloqueada o clave?
            </a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-[#0f172a] text-white hover:bg-[#1e293b] active:bg-[#020617] rounded-md text-xs font-bold tracking-wide uppercase flex items-center justify-center gap-2 transition-all cursor-pointer shadow-academic-sm disabled:opacity-60"
          >
            {isLoading ? (
              <span>Autenticando...</span>
            ) : (
              <>
                <span>Iniciar Sesión en UNICEN 2026</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Footer separator */}
          <div className="pt-2 text-center text-[10px] text-[#64748b] border-t border-[#f1f5f9] flex justify-center gap-4">
            <a href="#privacy" className="hover:underline">
              Políticas de Privacidad
            </a>
            <span>•</span>
            <a href="#helpdesk" className="hover:underline">
              Mesa de Ayuda TI (Int. 4022)
            </a>
            <span>•</span>
            <a href="#terms" className="hover:underline">
              Reglamento TI
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

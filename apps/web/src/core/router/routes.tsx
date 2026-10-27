import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/application/useAuth';
import { LoginPage } from '../../features/auth/presentation/LoginPage';
import { CoursesPage } from '../../features/courses/presentation/CoursesPage';
import { StudentsAndEnrollmentPage } from '../../features/enrollments/presentation/StudentsAndEnrollmentPage';
import { GradesAndHistoryPage } from '../../features/grades/presentation/GradesAndHistoryPage';
import { DashboardPage } from '../../features/dashboard/DashboardPage';
import { AuditPage } from '../../features/audit/AuditPage';
import { AppShell } from '../ui/AppShell';
import { UserRole } from '@unicen/shared';

const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}> = ({ children, allowedRoles }) => {
  const { user, token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#f8fafc] text-xs font-semibold text-[#64748b]">
        Verificando credenciales institucionales...
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <AppShell>{children}</AppShell>;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/courses"
        element={
          <ProtectedRoute>
            <CoursesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/enrollments"
        element={
          <ProtectedRoute>
            <StudentsAndEnrollmentPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/grades"
        element={
          <ProtectedRoute>
            <GradesAndHistoryPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <GradesAndHistoryPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/audit"
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
            <AuditPage />
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

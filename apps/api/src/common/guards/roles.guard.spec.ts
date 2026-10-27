import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { UserRole } from '@unicen/shared';

describe('RolesGuard (Security Unit Tests)', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  const createMockContext = (user: any): ExecutionContext => {
    return {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as unknown as ExecutionContext;
  };

  it('debe permitir acceso si la ruta no tiene roles requeridos (@Roles omitido)', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const context = createMockContext({ role: UserRole.ESTUDIANTE });

    const result = guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('debe lanzar ForbiddenException si un usuario con rol ESTUDIANTE intenta acceder a ruta restringida para DOCENTE o ADMIN (ej. registro de notas)', () => {
    // Configura roles requeridos para la ruta de notas: DOCENTE o ADMIN
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([UserRole.DOCENTE, UserRole.ADMIN]);

    // Usuario con rol ESTUDIANTE
    const context = createMockContext({
      id: 'student-uuid',
      email: 'mateo.morales@unicen.edu.bo',
      role: UserRole.ESTUDIANTE,
    });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    expect(() => guard.canActivate(context)).toThrow(/Acceso denegado/);
  });

  it('debe permitir acceso si el usuario tiene rol DOCENTE en ruta restringida para DOCENTE o ADMIN', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([UserRole.DOCENTE, UserRole.ADMIN]);

    const context = createMockContext({
      id: 'docente-uuid',
      email: 'carlos.mendoza@unicen.edu.bo',
      role: UserRole.DOCENTE,
    });

    const result = guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('debe permitir acceso si el usuario tiene rol ADMIN en ruta restringida para DOCENTE o ADMIN', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([UserRole.DOCENTE, UserRole.ADMIN]);

    const context = createMockContext({
      id: 'admin-uuid',
      email: 'coordinacion.acad@unicen.edu.bo',
      role: UserRole.ADMIN,
    });

    const result = guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('debe lanzar ForbiddenException si el usuario no tiene rol o request no incluye usuario', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([UserRole.ADMIN]);

    const context = createMockContext(null);

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});

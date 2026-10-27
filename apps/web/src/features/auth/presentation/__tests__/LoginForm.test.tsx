import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { LoginPage } from '../LoginPage';
import * as useAuthModule from '../../application/useAuth';
import { UserRole } from '@unicen/shared';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('LoginForm Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('comprueba el renderizado de errores ante credenciales inválidas', async () => {
    const mockLogin = vi.fn().mockRejectedValue({
      response: {
        data: {
          message:
            'Las credenciales ingresadas no corresponden al período lectivo 2026-I.',
        },
      },
    });

    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: null,
      token: null,
      isLoading: false,
      login: mockLogin,
      logout: vi.fn(),
    });

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    const emailInput = screen.getByLabelText(/Correo Electrónico Institucional/i);
    const passwordInput = screen.getByLabelText(/Contraseña Institucional/i);
    const submitBtn = screen.getByRole('button', {
      name: /Iniciar Sesión en UNICEN 2026/i,
    });

    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, 'usuario.invalido@unicen.edu.bo');
    await userEvent.clear(passwordInput);
    await userEvent.type(passwordInput, 'ClaveIncorrecta');

    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'usuario.invalido@unicen.edu.bo',
        password: 'ClaveIncorrecta',
      });
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveTextContent(
        /Las credenciales ingresadas no corresponden al período lectivo 2026-I/i,
      );
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('comprueba la redirección según rol al iniciar sesión exitosamente (ADMIN -> /courses)', async () => {
    const mockLogin = vi.fn().mockResolvedValue({
      id: 'admin-uuid',
      email: 'coordinacion.acad@unicen.edu.bo',
      fullName: 'Dra. Elena Valenzuela',
      role: UserRole.ADMIN,
    });

    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: null,
      token: null,
      isLoading: false,
      login: mockLogin,
      logout: vi.fn(),
    });

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    const submitBtn = screen.getByRole('button', {
      name: /Iniciar Sesión en UNICEN 2026/i,
    });
    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/courses');
    });
  });

  it('comprueba la redirección para rol DOCENTE -> /grades', async () => {
    const mockLogin = vi.fn().mockResolvedValue({
      id: 'docente-uuid',
      email: 'carlos.mendoza@unicen.edu.bo',
      fullName: 'Dr. Carlos Mendoza S.',
      role: UserRole.DOCENTE,
    });

    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: null,
      token: null,
      isLoading: false,
      login: mockLogin,
      logout: vi.fn(),
    });

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    const submitBtn = screen.getByRole('button', {
      name: /Iniciar Sesión en UNICEN 2026/i,
    });
    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/grades');
    });
  });

  it('comprueba la redirección para rol ESTUDIANTE -> /enrollments', async () => {
    const mockLogin = vi.fn().mockResolvedValue({
      id: 'student-uuid',
      email: 'mateo.morales@unicen.edu.bo',
      fullName: 'Mateo Andrés Morales Soliz',
      role: UserRole.ESTUDIANTE,
    });

    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: null,
      token: null,
      isLoading: false,
      login: mockLogin,
      logout: vi.fn(),
    });

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    const submitBtn = screen.getByRole('button', {
      name: /Iniciar Sesión en UNICEN 2026/i,
    });
    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/enrollments');
    });
  });
});

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser, Credentials } from '../domain/user';
import { HttpAuthRepository } from '../infrastructure/http-auth.repository';
import { loginUseCase } from './login.use-case';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: Credentials) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const authRepository = new HttpAuthRepository();

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('unicen_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('unicen_token'),
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem('unicen_token');
      if (savedToken) {
        try {
          const me = await authRepository.getMe();
          setUser(me);
          localStorage.setItem('unicen_user', JSON.stringify(me));
        } catch {
          logout();
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (credentials: Credentials): Promise<AuthUser> => {
    const result = await loginUseCase(authRepository, credentials);
    setToken(result.accessToken);
    setUser(result.user);
    localStorage.setItem('unicen_token', result.accessToken);
    localStorage.setItem('unicen_user', JSON.stringify(result.user));
    return result.user;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('unicen_token');
    localStorage.removeItem('unicen_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};

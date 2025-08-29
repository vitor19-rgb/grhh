'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import useLocalStorage from './use-local-storage';
import { Patient } from '@/lib/types';
import { AUTH_KEY, PATIENTS_KEY } from '@/lib/data';
import { Loader2 } from 'lucide-react';

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: Patient | null;
  isLoading: boolean;
  login: (email: string, pass: string) => boolean;
  adminLogin: (user: string, pass: string) => boolean;
  logout: () => void;
  register: (patient: Patient) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthState {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: Patient | null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [auth, setAuth] = useLocalStorage<AuthState>(AUTH_KEY, {
    isAuthenticated: false,
    isAdmin: false,
    user: null,
  });
  const [patients, setPatients] = useLocalStorage<Patient[]>(PATIENTS_KEY, []);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const login = (email: string, pass: string): boolean => {
    const patient = patients.find(p => p.email === email && p.password === pass);
    if (patient) {
      setAuth({ isAuthenticated: true, isAdmin: false, user: patient });
      return true;
    }
    return false;
  };

  const adminLogin = (user: string, pass: string): boolean => {
    if (user === 'admin@consu.online' && pass === 'admin123') {
      setAuth({ isAuthenticated: true, isAdmin: true, user: { id: 'admin', name: 'Admin', email: 'admin@consu.online', password: '' } });
      return true;
    }
    return false;
  };

  const logout = () => {
    const wasAdmin = auth.isAdmin;
    setAuth({ isAuthenticated: false, isAdmin: false, user: null });
    router.push(wasAdmin ? '/admin/login' : '/login');
  };
  
  const register = (patient: Patient): boolean => {
    if (patients.some(p => p.email === patient.email)) {
      return false; // User already exists
    }
    setPatients([...patients, patient]);
    return true;
  };

  const contextValue: AuthContextType = { ...auth, isLoading, login, adminLogin, logout, register };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const ProtectRoute = ({ children, adminOnly = false }: { children: ReactNode, adminOnly?: boolean }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push(adminOnly ? '/admin/login' : '/login');
      } else if (adminOnly && !isAdmin) {
        router.push('/dashboard');
      } else if (!adminOnly && isAdmin) {
        router.push('/admin/dashboard');
      }
    }
  }, [isAuthenticated, isAdmin, isLoading, router, adminOnly]);

  if (isLoading || !isAuthenticated || (adminOnly && !isAdmin)) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
};

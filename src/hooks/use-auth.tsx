'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import useLocalStorage from './use-local-storage';
import { Doctor, Patient } from '@/lib/types';
import { AUTH_KEY, DOCTORS_KEY, PATIENTS_KEY, initialDoctors } from '@/lib/data';
import { Loader2 } from 'lucide-react';

type User = Patient | Doctor;

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  isDoctor: boolean;
  user: User | null;
  isLoading: boolean;
  login: (email: string, pass: string) => boolean;
  doctorLogin: (email: string, pass: string) => boolean;
  adminLogin: (user: string, pass: string) => boolean;
  logout: () => void;
  register: (patient: Patient) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthState {
  isAuthenticated: boolean;
  isAdmin: boolean;
  isDoctor: boolean;
  user: User | null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [auth, setAuth] = useLocalStorage<AuthState>(AUTH_KEY, {
    isAuthenticated: false,
    isAdmin: false,
    isDoctor: false,
    user: null,
  });
  const [patients, setPatients] = useLocalStorage<Patient[]>(PATIENTS_KEY, []);
  const [doctors, setDoctors] = useLocalStorage<Doctor[]>(DOCTORS_KEY, initialDoctors);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This effect seeds the initial doctors into localStorage ONLY if it's not already present.
    // This ensures that any changes made by the admin are persisted and not overwritten on page load.
    const storedDoctors = localStorage.getItem(DOCTORS_KEY);
    if (!storedDoctors || JSON.parse(storedDoctors).length === 0) {
      setDoctors(initialDoctors);
    }
    setIsLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = (email: string, pass: string): boolean => {
    const patient = patients.find(p => p.email === email && p.password === pass);
    if (patient) {
      setAuth({ isAuthenticated: true, isAdmin: false, isDoctor: false, user: patient });
      return true;
    }
    return false;
  };
  
  const doctorLogin = (email: string, pass: string): boolean => {
    const doctor = doctors.find(d => d.email === email && d.password === pass);
    if (doctor) {
      setAuth({ isAuthenticated: true, isAdmin: false, isDoctor: true, user: doctor });
      return true;
    }
    return false;
  };

  const adminLogin = (user: string, pass: string): boolean => {
    if (user === 'admin@consu.online' && pass === 'admin123') {
      setAuth({ isAuthenticated: true, isAdmin: true, isDoctor: false, user: { id: 'admin', name: 'Admin', email: 'admin@consu.online', password: '' } });
      return true;
    }
    return false;
  };

  const logout = () => {
    const wasAdmin = auth.isAdmin;
    const wasDoctor = auth.isDoctor;
    setAuth({ isAuthenticated: false, isAdmin: false, isDoctor: false, user: null });
    if (wasAdmin) {
        router.push('/admin/login');
    } else if (wasDoctor) {
        router.push('/doctor/login');
    } else {
        router.push('/login');
    }
  };
  
  const register = (patient: Patient): boolean => {
    if (patients.some(p => p.email === patient.email)) {
      return false; // User already exists
    }
    setPatients([...patients, patient]);
    return true;
  };

  const contextValue: AuthContextType = { ...auth, isLoading, login, doctorLogin, adminLogin, logout, register };

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

export const ProtectRoute = ({ children, adminOnly = false, doctorOnly = false }: { children: ReactNode, adminOnly?: boolean, doctorOnly?: boolean }) => {
  const { isAuthenticated, isAdmin, isDoctor, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        if (adminOnly) router.push('/admin/login');
        else if (doctorOnly) router.push('/doctor/login');
        else router.push('/login');
      } else {
        if (adminOnly && !isAdmin) router.push('/dashboard');
        if (doctorOnly && !isDoctor) router.push('/dashboard');
        if (!adminOnly && !doctorOnly && (isAdmin || isDoctor)) {
            // A regular user is trying to access a patient dashboard, but is an admin or doctor
            if(isAdmin) router.push('/admin/dashboard');
            if(isDoctor) router.push('/doctor/dashboard');
        }
      }
    }
  }, [isAuthenticated, isAdmin, isDoctor, isLoading, router, adminOnly, doctorOnly]);

  if (isLoading || !isAuthenticated || (adminOnly && !isAdmin) || (doctorOnly && !isDoctor)) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
};

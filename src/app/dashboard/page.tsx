'use client';

import { useState } from 'react';
import useLocalStorage from '@/hooks/use-local-storage';
import { useAuth } from '@/hooks/use-auth';
import type { Appointment, Doctor, Patient } from '@/lib/types';
import { APPOINTMENTS_KEY, DOCTORS_KEY, PATIENTS_KEY, initialDoctors } from '@/lib/data';
import UpcomingAppointments from '@/components/dashboard/UpcomingAppointments';
import AppointmentScheduler from '@/components/dashboard/AppointmentScheduler';
import PatientSchedule from '@/components/dashboard/PatientSchedule';

export default function DashboardPage() {
  const { user } = useAuth();
  
  const [appointments, setAppointments] = useLocalStorage<Appointment[]>(APPOINTMENTS_KEY, []);
  const [doctors] = useLocalStorage<Doctor[]>(DOCTORS_KEY, initialDoctors);
  const [patients, setPatients] = useLocalStorage<Patient[]>(PATIENTS_KEY, []);

  const [refreshKey, setRefreshKey] = useState(0);

  const handleAppointmentBooked = () => {
    setRefreshKey(prev => prev + 1);
  };
  
  const handleScheduleUpdate = (newSchedule: string) => {
    if (user) {
      const updatedPatients = patients.map(p => 
        p.id === user.id ? { ...p, schedule: newSchedule } : p
      );
      setPatients(updatedPatients);
    }
  };
  
  const patientAppointments = appointments.filter(
    (app) => app.patientId === user?.id
  );

  const generalPractitioner = doctors.find(doc => doc.specialty === 'Clínico Geral');

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 font-headline">Bem-vindo(a), {user?.name}!</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           {generalPractitioner ? (
            <AppointmentScheduler
              doctor={generalPractitioner}
              appointments={appointments}
              setAppointments={setAppointments}
              onAppointmentBooked={handleAppointmentBooked}
              patientSchedule={user?.schedule ?? ""}
            />
          ) : (
             <p className="text-center text-muted-foreground">Nenhum clínico geral disponível para agendamento no momento.</p>
          )}
        </div>
        <div className="space-y-8">
          <UpcomingAppointments appointments={patientAppointments} doctors={doctors} key={refreshKey} />
          <PatientSchedule
            initialSchedule={user?.schedule ?? ""}
            onUpdate={handleScheduleUpdate}
          />
        </div>
      </div>
    </div>
  );
}

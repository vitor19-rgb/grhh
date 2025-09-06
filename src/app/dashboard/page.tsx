'use client';

import { useState, useEffect } from 'react';
import useLocalStorage from '@/hooks/use-local-storage';
import { useAuth } from '@/hooks/use-auth';
import type { Appointment, Doctor, Patient } from '@/lib/types';
import { APPOINTMENTS_KEY, DOCTORS_KEY, PATIENTS_KEY } from '@/lib/data';
import UpcomingAppointments from '@/components/dashboard/UpcomingAppointments';
import AppointmentScheduler from '@/components/dashboard/AppointmentScheduler';
import PatientSchedule from '@/components/dashboard/PatientSchedule';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { user } = useAuth();
  
  // Initialize with empty arrays, they will be populated by the effect.
  const [appointments, setAppointments] = useLocalStorage<Appointment[]>(APPOINTMENTS_KEY, []);
  const [doctors, setDoctors] = useLocalStorage<Doctor[]>(DOCTORS_KEY, []);
  const [patients, setPatients] = useLocalStorage<Patient[]>(PATIENTS_KEY, []);

  const [refreshKey, setRefreshKey] = useState(0);
  const [newReferral, setNewReferral] = useState<Appointment | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    // This effect runs on the client after hydration and ensures that the state
    // is updated with the values from localStorage before rendering the child components.
    const storedDoctors = localStorage.getItem(DOCTORS_KEY);
    if(storedDoctors) {
        setDoctors(JSON.parse(storedDoctors));
    }
    const storedPatients = localStorage.getItem(PATIENTS_KEY);
    if(storedPatients) {
        setPatients(JSON.parse(storedPatients));
    }
    const storedAppointments = localStorage.getItem(APPOINTMENTS_KEY);
    if(storedAppointments) {
        setAppointments(JSON.parse(storedAppointments));
    }
    // Only after attempting to load everything from localStorage, we set loading to false.
    setIsDataLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // This effect checks for new referrals once the data is confirmed to be loaded.
    if (user && appointments.length > 0 && !isDataLoading) {
      const newAppointment = appointments.find(
        (app) => app.patientId === user.id && app.isNew
      );
      if (newAppointment) {
        setNewReferral(newAppointment);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, appointments, refreshKey, isDataLoading]);
  
  useEffect(() => {
    // When user changes, reset the referral state
    setNewReferral(null);
  }, [user?.id]);


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
  
  const handleCloseReferralAlert = () => {
    if (newReferral) {
      const updatedAppointments = appointments.map(app =>
        app.id === newReferral.id ? { ...app, isNew: false } : app
      );
      setAppointments(updatedAppointments);
      setNewReferral(null);
    }
  };

  const patientAppointments = appointments.filter(
    (app) => app.patientId === user?.id
  );

  // Find the practitioner only after data has been loaded.
  const generalPractitioner = isDataLoading ? undefined : doctors.find(doc => doc.specialty.toLowerCase() === 'clínico geral');

  return (
    <>
      <div className="container mx-auto p-4 sm:p-6 md:p-8">
        <h1 className="text-3xl font-bold mb-6 font-headline">Bem-vindo(a), {user?.name}!</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {isDataLoading ? (
              <Skeleton className="h-[400px] w-full" />
            ) : (
              <AppointmentScheduler
                doctor={generalPractitioner}
                appointments={appointments}
                setAppointments={setAppointments}
                onAppointmentBooked={handleAppointmentBooked}
                patientSchedule={patients.find(p => p.id === user?.id)?.schedule ?? ""}
              />
            )}
          </div>
          <div className="space-y-8">
             {isDataLoading ? (
               <Skeleton className="h-[200px] w-full" />
            ) : (
              <UpcomingAppointments appointments={patientAppointments} doctors={doctors} key={refreshKey} />
            )}
             {isDataLoading ? (
               <Skeleton className="h-[200px] w-full" />
            ) : (
              <PatientSchedule
                initialSchedule={patients.find(p => p.id === user?.id)?.schedule ?? ""}
                onUpdate={handleScheduleUpdate}
              />
            )}
          </div>
        </div>
      </div>
      
      {newReferral && (
        <AlertDialog open={!!newReferral} onOpenChange={() => handleCloseReferralAlert()}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Novo Encaminhamento!</AlertDialogTitle>
              <AlertDialogDescription>
                Seu clínico geral agendou uma nova consulta para você com um especialista.
              </AlertDialogDescription>
              <div className="mt-4 text-left text-sm p-3 bg-secondary rounded-md space-y-2 text-secondary-foreground">
                <div><strong>Médico:</strong> {newReferral.doctorName}</div>
                <div><strong>Especialidade:</strong> {doctors.find(d => d.id === newReferral.doctorId)?.specialty}</div>
                <div><strong>Data:</strong> {format(new Date(newReferral.dateTime), 'PPP', { locale: ptBR })}</div>
                <div><strong>Hora:</strong> {format(new Date(newReferral.dateTime), 'p', { locale: ptBR })}</div>
                {newReferral.notes && (
                    <div><strong>Notas do Médico:</strong> {newReferral.notes}</div>
                )}
              </div>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={handleCloseReferralAlert}>Entendi</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}

'use client';

import { useState, useEffect } from 'react';
import useLocalStorage from '@/hooks/use-local-storage';
import { useAuth } from '@/hooks/use-auth';
import type { Appointment, Doctor, Patient } from '@/lib/types';
import { APPOINTMENTS_KEY, DOCTORS_KEY, PATIENTS_KEY, initialDoctors } from '@/lib/data';
import UpcomingAppointments from '@/components/dashboard/UpcomingAppointments';
import AppointmentScheduler from '@/components/dashboard/AppointmentScheduler';
import PatientSchedule from '@/components/dashboard/PatientSchedule';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function DashboardPage() {
  const { user } = useAuth();
  
  const [appointments, setAppointments] = useLocalStorage<Appointment[]>(APPOINTMENTS_KEY, []);
  const [doctors] = useLocalStorage<Doctor[]>(DOCTORS_KEY, initialDoctors);
  const [patients, setPatients] = useLocalStorage<Patient[]>(PATIENTS_KEY, []);

  const [refreshKey, setRefreshKey] = useState(0);
  const [newReferral, setNewReferral] = useState<Appointment | null>(null);

  useEffect(() => {
    if (user) {
      const newAppointment = appointments.find(
        (app) => app.patientId === user.id && app.isNew
      );
      if (newAppointment) {
        setNewReferral(newAppointment);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, appointments, refreshKey]);
  
  useEffect(() => {
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

  const generalPractitioner = doctors.find(doc => doc.specialty === 'Clínico Geral');

  return (
    <>
      <div className="container mx-auto p-4 sm:p-6 md:p-8">
        <h1 className="text-3xl font-bold mb-6 font-headline">Bem-vindo(a), {user?.name}!</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
             {generalPractitioner ? (
              <AppointmentScheduler
                doctor={generalPractitioner}
                appointments={appointments}
                setAppointments={setAppointments}
                onAppointmentBooked={handleAppointmentBooked}
                patientSchedule={patients.find(p => p.id === user?.id)?.schedule ?? ""}
              />
            ) : (
               <p className="text-center text-muted-foreground">Nenhum clínico geral disponível para agendamento no momento.</p>
            )}
          </div>
          <div className="space-y-8">
            <UpcomingAppointments appointments={patientAppointments} doctors={doctors} key={refreshKey} />
            <PatientSchedule
              initialSchedule={patients.find(p => p.id === user?.id)?.schedule ?? ""}
              onUpdate={handleScheduleUpdate}
            />
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
                <div className="mt-4 text-left p-3 bg-secondary rounded-md">
                  <p><strong>Médico:</strong> {newReferral.doctorName}</p>
                  <p><strong>Especialidade:</strong> {doctors.find(d => d.id === newReferral.doctorId)?.specialty}</p>
                  <p><strong>Data:</strong> {format(new Date(newReferral.dateTime), 'PPP', { locale: ptBR })}</p>
                  <p><strong>Hora:</strong> {format(new Date(newReferral.dateTime), 'p', { locale: ptBR })}</p>
                </div>
              </AlertDialogDescription>
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

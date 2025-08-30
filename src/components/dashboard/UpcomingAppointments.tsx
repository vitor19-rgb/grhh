'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Appointment, Doctor } from '@/lib/types';
import { Calendar, Clock, Stethoscope, Send } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface UpcomingAppointmentsProps {
  appointments: Appointment[];
  doctors: Doctor[];
}

export default function UpcomingAppointments({ appointments, doctors }: UpcomingAppointmentsProps) {
  const upcoming = appointments
    .filter(a => new Date(a.dateTime) > new Date() && a.status === 'upcoming')
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

  const getDoctorSpecialty = (doctorId: string) => {
    return doctors.find(d => d.id === doctorId)?.specialty || 'Especialista';
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Próximas Consultas</CardTitle>
        <CardDescription>Aqui estão suas consultas agendadas.</CardDescription>
      </CardHeader>
      <CardContent>
        {upcoming.length > 0 ? (
          <ul className="space-y-4">
            {upcoming.map(app => (
              <li key={app.id} className="p-4 rounded-lg border bg-secondary/50">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-primary">{app.doctorName}</p>
                   <p className="text-sm text-muted-foreground capitalize">{format(new Date(app.dateTime), 'E, d MMM', { locale: ptBR })}</p>
                </div>
                 <p className="text-sm text-muted-foreground flex items-center mt-1">
                    <Stethoscope className="mr-1.5 h-4 w-4" />
                    {getDoctorSpecialty(app.doctorId)}
                </p>
                <div className="flex items-center text-sm text-muted-foreground mt-2 space-x-4">
                   <div className="flex items-center">
                     <Clock className="mr-1.5 h-4 w-4" />
                     <span>{format(new Date(app.dateTime), 'p', { locale: ptBR })}</span>
                   </div>
                </div>
                {app.notes && app.notes.startsWith('Encaminhado por') && (
                  <div className="mt-3 pt-2 border-t border-secondary">
                    <p className="text-xs text-accent-foreground flex items-center bg-accent/20 p-2 rounded-md">
                      <Send className="mr-2 h-3 w-3 text-accent" />
                      {app.notes}
                    </p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2">Nenhuma consulta agendada.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

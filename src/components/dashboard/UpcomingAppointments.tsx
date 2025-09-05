'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Appointment, Doctor } from '@/lib/types';
import { Clock, Stethoscope, Send } from 'lucide-react';
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
              <li key={app.id} className="p-4 rounded-lg border bg-card">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-primary">{app.doctorName}</p>
                     <p className="text-sm text-muted-foreground flex items-center mt-1">
                        <Stethoscope className="mr-1.5 h-4 w-4" />
                        {getDoctorSpecialty(app.doctorId)}
                    </p>
                  </div>
                   <p className="text-xs text-muted-foreground capitalize text-right whitespace-nowrap">
                    {format(new Date(app.dateTime), 'E, d MMM', { locale: ptBR })}
                    <br/>
                    às {format(new Date(app.dateTime), 'p', { locale: ptBR })}
                   </p>
                </div>
                {app.notes?.includes('Encaminhado por') && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-accent-foreground flex items-start bg-accent/20 p-2 rounded-md">
                      <Send className="mr-2 h-3 w-3 mt-0.5 shrink-0 text-accent" />
                      <span>{app.notes}</span>
                    </p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <div className="mx-auto h-12 w-12 text-gray-400 border-2 border-dashed rounded-full flex items-center justify-center">
              <Stethoscope className="h-6 w-6" />
            </div>
            <p className="mt-4">Nenhuma consulta agendada.</p>
            <p className="text-sm text-gray-500">Agende sua primeira consulta com nosso clínico geral.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Appointment } from '@/lib/types';
import { Calendar, Clock, Stethoscope } from 'lucide-react';
import { format } from 'date-fns';

interface UpcomingAppointmentsProps {
  appointments: Appointment[];
}

export default function UpcomingAppointments({ appointments }: UpcomingAppointmentsProps) {
  const upcoming = appointments
    .filter(a => new Date(a.dateTime) > new Date() && a.status === 'upcoming')
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Appointments</CardTitle>
        <CardDescription>Here are your scheduled consultations.</CardDescription>
      </CardHeader>
      <CardContent>
        {upcoming.length > 0 ? (
          <ul className="space-y-4">
            {upcoming.map(app => (
              <li key={app.id} className="p-4 rounded-lg border bg-secondary/50">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-primary">{app.doctorName}</p>
                   <p className="text-sm text-muted-foreground">{format(new Date(app.dateTime), 'E, MMM d')}</p>
                </div>
                <div className="flex items-center text-sm text-muted-foreground mt-2 space-x-4">
                   <div className="flex items-center">
                     <Clock className="mr-1.5 h-4 w-4" />
                     <span>{format(new Date(app.dateTime), 'p')}</span>
                   </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2">No upcoming appointments.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Appointment, Doctor } from '@/lib/types';
import { Stethoscope, FileText, Download } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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

  const downloadPdf = (appointmentId: string) => {
    const input = document.getElementById(`appointment-${appointmentId}`);
    if (input) {
      html2canvas(input, { scale: 2 }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / canvasHeight;
        const width = pdfWidth - 20;
        const height = width / ratio;

        let position = 10;
        if (height > pdfHeight - 20) {
            position = 10; 
        }

        pdf.addImage(imgData, 'PNG', 10, position, width, height);
        pdf.save(`consulta-${appointmentId}.pdf`);
      });
    }
  };

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
                 <div id={`appointment-${app.id}`} className="p-4 bg-card">
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
                    {app.notes && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs text-accent-foreground flex items-start bg-accent/20 p-2 rounded-md">
                          <FileText className="mr-2 h-3 w-3 mt-0.5 shrink-0 text-accent" />
                          <span>{app.notes}</span>
                        </p>
                      </div>
                    )}
                 </div>
                 <div className="mt-2 flex justify-end">
                    <Button variant="outline" size="sm" onClick={() => downloadPdf(app.id)}>
                        <Download className="mr-2 h-4 w-4" />
                        Baixar PDF
                    </Button>
                 </div>
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

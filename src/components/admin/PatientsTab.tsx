'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Patient, Appointment } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

interface PatientsTabProps {
  patients: Patient[];
  appointments: Appointment[];
}

export default function PatientsTab({ patients, appointments }: PatientsTabProps) {
  const getAppointmentCount = (patientId: string) => {
    return appointments.filter(app => app.patientId === patientId).length;
  };
  
  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead className="hidden sm:table-cell">Email</TableHead>
            <TableHead className="text-center">Consultas</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map(patient => (
            <TableRow key={patient.id}>
              <TableCell className="font-medium">{patient.name}</TableCell>
              <TableCell className="hidden sm:table-cell">{patient.email}</TableCell>
              <TableCell className="text-center">
                 <Badge variant="secondary">{getAppointmentCount(patient.id)}</Badge>
              </TableCell>
            </TableRow>
          ))}
           {patients.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-muted-foreground h-24">
                Nenhum paciente se registrou ainda.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

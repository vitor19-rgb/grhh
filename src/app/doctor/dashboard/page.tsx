'use client';

import { useAuth } from '@/hooks/use-auth';
import useLocalStorage from '@/hooks/use-local-storage';
import type { Appointment } from '@/lib/types';
import { APPOINTMENTS_KEY } from '@/lib/data';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

export default function DoctorDashboardPage() {
    const { user } = useAuth();
    const [appointments] = useLocalStorage<Appointment[]>(APPOINTMENTS_KEY, []);

    const doctorAppointments = appointments
        .filter(app => app.doctorId === user?.id)
        .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());

    return (
        <div className="container mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold mb-6 font-headline">Painel do Médico</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Bem-vindo(a), {user?.name}!</CardTitle>
                    <CardDescription>Visualize e gerencie suas consultas agendadas.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Paciente</TableHead>
                                <TableHead>Data</TableHead>
                                <TableHead>Hora</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {doctorAppointments.length > 0 ? (
                                doctorAppointments.map(app => (
                                    <TableRow key={app.id}>
                                        <TableCell className="font-medium">{app.patientName}</TableCell>
                                        <TableCell>{format(new Date(app.dateTime), 'PPP', { locale: ptBR })}</TableCell>
                                        <TableCell>{format(new Date(app.dateTime), 'p', { locale: ptBR })}</TableCell>
                                        <TableCell>
                                            <Badge variant={app.status === 'upcoming' ? 'default' : 'secondary'}>
                                                {app.status === 'upcoming' ? 'Próxima' : app.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        Nenhuma consulta encontrada.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
    
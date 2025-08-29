'use client';

import { useAuth } from '@/hooks/use-auth';
import useLocalStorage from '@/hooks/use-local-storage';
import type { Appointment } from '@/lib/types';
import { APPOINTMENTS_KEY } from '@/lib/data';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';

export default function DoctorDashboardPage() {
    const { user } = useAuth();
    const [appointments, setAppointments] = useLocalStorage<Appointment[]>(APPOINTMENTS_KEY, []);
    const { toast } = useToast();

    const handleCompleteAppointment = (appointmentId: string) => {
        setAppointments(prev =>
            prev.map(app =>
                app.id === appointmentId ? { ...app, status: 'completed' } : app
            )
        );
        toast({
            title: 'Consulta Concluída!',
            description: 'A consulta foi marcada como concluída.',
        });
    };

    const upcomingAppointments = appointments
        .filter(app => app.doctorId === user?.id && app.status === 'upcoming' && new Date(app.dateTime) >= new Date())
        .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
    
    const pastAppointments = appointments
        .filter(app => app.doctorId === user?.id && (app.status === 'completed' || new Date(app.dateTime) < new Date()))
        .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());


    const getStatusBadge = (status: Appointment['status'], dateTime: string) => {
        if (status === 'completed') {
            return <Badge variant="secondary">Concluída</Badge>;
        }
        if (new Date(dateTime) < new Date() && status !== 'completed') {
            return <Badge variant="outline">Expirada</Badge>;
        }
        return <Badge>Próxima</Badge>;
    }

    return (
        <div className="container mx-auto p-4 md:p-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold font-headline">Painel do Médico</h1>
                <p className="text-muted-foreground">Bem-vindo(a), {user?.name}! Gerencie suas consultas aqui.</p>
            </header>

            <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Próximas Consultas</CardTitle>
                        <CardDescription>Estas são as suas consultas agendadas que ainda não ocorreram.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Paciente</TableHead>
                                    <TableHead>Data</TableHead>
                                    <TableHead>Hora</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {upcomingAppointments.length > 0 ? (
                                    upcomingAppointments.map(app => (
                                        <TableRow key={app.id}>
                                            <TableCell className="font-medium">{app.patientName}</TableCell>
                                            <TableCell>{format(new Date(app.dateTime), 'PPP', { locale: ptBR })}</TableCell>
                                            <TableCell>{format(new Date(app.dateTime), 'p', { locale: ptBR })}</TableCell>
                                            <TableCell className="text-right">
                                                <Button size="sm" onClick={() => handleCompleteAppointment(app.id)}>
                                                    <CheckCircle className="mr-2 h-4 w-4" />
                                                    Concluir
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            Nenhuma próxima consulta encontrada.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Histórico de Consultas</CardTitle>
                        <CardDescription>Estas são as suas consultas passadas e concluídas.</CardDescription>
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
                                {pastAppointments.length > 0 ? (
                                    pastAppointments.map(app => (
                                        <TableRow key={app.id} className="text-muted-foreground">
                                            <TableCell className="font-medium">{app.patientName}</TableCell>
                                            <TableCell>{format(new Date(app.dateTime), 'PPP', { locale: ptBR })}</TableCell>
                                            <TableCell>{format(new Date(app.dateTime), 'p', { locale: ptBR })}</TableCell>
                                            <TableCell>{getStatusBadge(app.status, app.dateTime)}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            Nenhum histórico de consulta encontrado.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
    
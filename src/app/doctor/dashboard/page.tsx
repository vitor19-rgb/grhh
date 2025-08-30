'use client';

import { useAuth } from '@/hooks/use-auth';
import useLocalStorage from '@/hooks/use-local-storage';
import type { Appointment, Doctor, Patient } from '@/lib/types';
import { APPOINTMENTS_KEY, DOCTORS_KEY, PATIENTS_KEY, initialDoctors } from '@/lib/data';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Send } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';


export default function DoctorDashboardPage() {
    const { user } = useAuth();
    const [appointments, setAppointments] = useLocalStorage<Appointment[]>(APPOINTMENTS_KEY, []);
    const [doctors] = useLocalStorage<Doctor[]>(DOCTORS_KEY, initialDoctors);
    const [patients] = useLocalStorage<Patient[]>(PATIENTS_KEY, []);

    const { toast } = useToast();
    const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [selectedSpecialistId, setSelectedSpecialistId] = useState<string>('');

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
    
    const openReferralModal = (appointment: Appointment) => {
        setSelectedAppointment(appointment);
        setIsReferralModalOpen(true);
    };

    const handleReferral = () => {
        if (!selectedAppointment || !selectedSpecialistId) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Por favor, selecione um especialista.' });
            return;
        }

        const specialist = doctors.find(doc => doc.id === selectedSpecialistId);
        const patient = patients.find(p => p.id === selectedAppointment.patientId);

        if (!specialist || !patient) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Médico especialista ou paciente não encontrado.' });
            return;
        }
        
        // Find next available slot for the specialist (simplified logic)
        // This is a placeholder. A real implementation would need a more robust slot finding logic.
        const nextAvailableDate = new Date();
        nextAvailableDate.setDate(nextAvailableDate.getDate() + 2); // 2 days from now
        nextAvailableDate.setHours(10, 0, 0, 0);

        const newAppointment: Appointment = {
            id: `app_${new Date().getTime()}`,
            patientId: patient.id,
            patientName: patient.name,
            doctorId: specialist.id,
            doctorName: specialist.name,
            dateTime: nextAvailableDate.toISOString(),
            status: 'upcoming',
            notes: `Encaminhado por ${user?.name} (${user?.specialty}).`,
        };

        setAppointments(prev => [...prev, newAppointment]);
        
        setAppointments(prev =>
            prev.map(app =>
                app.id === selectedAppointment.id ? { ...app, status: 'completed', notes: `Paciente encaminhado para ${specialist.name} (${specialist.specialty}).` } : app
            )
        );

        toast({
            title: 'Paciente Encaminhado!',
            description: `${patient.name} foi encaminhado para ${specialist.name}. Uma nova consulta foi criada.`,
        });

        setIsReferralModalOpen(false);
        setSelectedAppointment(null);
        setSelectedSpecialistId('');
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
    
    const specialists = doctors.filter(d => d.specialty !== 'Clínico Geral' && d.id !== user?.id);

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
                                            <TableCell className="text-right space-x-2">
                                                 <Button size="sm" variant="outline" onClick={() => handleCompleteAppointment(app.id)}>
                                                    <CheckCircle className="mr-2 h-4 w-4" />
                                                    Concluir
                                                </Button>
                                                {user?.specialty === 'Clínico Geral' && (
                                                    <Button size="sm" onClick={() => openReferralModal(app)}>
                                                        <Send className="mr-2 h-4 w-4" />
                                                        Encaminhar
                                                    </Button>
                                                )}
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
                                    <TableHead>Notas</TableHead>
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
                                            <TableCell>{app.notes ?? 'N/A'}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            Nenhum histórico de consulta encontrado.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
            
            <Dialog open={isReferralModalOpen} onOpenChange={setIsReferralModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Encaminhar Paciente</DialogTitle>
                        <DialogDescription>
                            Selecione um especialista para encaminhar {selectedAppointment?.patientName}. A consulta atual será marcada como concluída com uma nota de encaminhamento.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                             <Label htmlFor="specialist">Especialista</Label>
                             <Select onValueChange={setSelectedSpecialistId}>
                                 <SelectTrigger id="specialist">
                                     <SelectValue placeholder="Selecione a especialidade" />
                                 </SelectTrigger>
                                 <SelectContent>
                                     {specialists.map(doc => (
                                         <SelectItem key={doc.id} value={doc.id}>
                                             {doc.name} ({doc.specialty})
                                         </SelectItem>
                                     ))}
                                 </SelectContent>
                             </Select>
                        </div>
                    </div>
                    <DialogFooter>
                         <Button variant="outline" onClick={() => setIsReferralModalOpen(false)}>Cancelar</Button>
                         <Button onClick={handleReferral} disabled={!selectedSpecialistId}>Confirmar Encaminhamento</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
    

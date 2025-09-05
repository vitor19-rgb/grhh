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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
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
        
        // Simple logic to find the next available slot (e.g., 2 days from now at 10 AM)
        const nextAvailableDate = new Date();
        nextAvailableDate.setDate(nextAvailableDate.getDate() + 2);
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
            isNew: true, // Mark this as a new referral for the patient
        };

        // Add the new appointment and mark the old one as completed with a referral note
        setAppointments(prev => {
            const updatedAppointments = prev.map(app =>
                app.id === selectedAppointment.id 
                    ? { ...app, status: 'completed', notes: `Paciente encaminhado para ${specialist.name} (${specialist.specialty}).` } 
                    : app
            );
            return [...updatedAppointments, newAppointment];
        });
        
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
        <div className="container mx-auto p-4 sm:p-6 md:p-8">
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
                        <div className="border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Paciente</TableHead>
                                        <TableHead className="hidden sm:table-cell">Data</TableHead>
                                        <TableHead className="hidden md:table-cell">Hora</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {upcomingAppointments.length > 0 ? (
                                        upcomingAppointments.map(app => (
                                            <TableRow key={app.id}>
                                                <TableCell className="font-medium">
                                                  <div>{app.patientName}</div>
                                                  <div className="text-muted-foreground text-sm sm:hidden">
                                                    {format(new Date(app.dateTime), 'PPP p', { locale: ptBR })}
                                                  </div>
                                                </TableCell>
                                                <TableCell className="hidden sm:table-cell">{format(new Date(app.dateTime), 'PPP', { locale: ptBR })}</TableCell>
                                                <TableCell className="hidden md:table-cell">{format(new Date(app.dateTime), 'p', { locale: ptBR })}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex flex-col sm:flex-row gap-2 justify-end">
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
                                                    </div>
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
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Histórico de Consultas</CardTitle>
                        <CardDescription>Estas são as suas consultas passadas e concluídas.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <div className="border rounded-md">
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Paciente</TableHead>
                                        <TableHead className="hidden sm:table-cell">Data</TableHead>
                                        <TableHead className="hidden md:table-cell">Status</TableHead>
                                        <TableHead>Notas</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pastAppointments.length > 0 ? (
                                        pastAppointments.map(app => (
                                            <TableRow key={app.id} className="text-muted-foreground">
                                                <TableCell className="font-medium">
                                                  <div>{app.patientName}</div>
                                                   <div className="text-muted-foreground text-sm sm:hidden">
                                                    {format(new Date(app.dateTime), 'PPP', { locale: ptBR })}
                                                  </div>
                                                </TableCell>
                                                <TableCell className="hidden sm:table-cell">{format(new Date(app.dateTime), 'PPP', { locale: ptBR })}</TableCell>
                                                <TableCell className="hidden md:table-cell">{getStatusBadge(app.status, app.dateTime)}</TableCell>
                                                <TableCell>{app.notes ?? 'N/A'}</TableCell>
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
                         </div>
                    </CardContent>
                </Card>
            </div>
            
            <Dialog open={isReferralModalOpen} onOpenChange={setIsReferralModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Encaminhar Paciente</DialogTitle>
                        <DialogDescription>
                            Selecione um especialista para encaminhar {selectedAppointment?.patientName}. A consulta atual será marcada como concluída com uma nota de encaminhamento.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                             <Label htmlFor="specialist">Especialista</Label>
                             <Select onValueChange={setSelectedSpecialistId} value={selectedSpecialistId}>
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
                    <DialogFooter className="sm:justify-start">
                         <Button type="button" variant="outline" onClick={() => setIsReferralModalOpen(false)}>Cancelar</Button>
                         <Button type="button" onClick={handleReferral} disabled={!selectedSpecialistId}>Confirmar Encaminhamento</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

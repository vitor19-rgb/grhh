'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Appointment, Doctor, DayOfWeek } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { add, format, getDay, isBefore, parse } from 'date-fns';
import { detectConflicts, DetectConflictsInput } from '@/ai/flows/detect-conflicts';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle, Sparkles } from 'lucide-react';

interface AppointmentSchedulerProps {
  doctor?: Doctor;
  appointments: Appointment[];
  setAppointments: (value: Appointment[] | ((val: Appointment[]) => Appointment[])) => void;
  onAppointmentBooked: () => void;
  patientSchedule: string;
}

export default function AppointmentScheduler({
  doctor,
  appointments,
  setAppointments,
  onAppointmentBooked,
  patientSchedule,
}: AppointmentSchedulerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [conflict, setConflict] = useState<{ hasConflicts: boolean; details: string } | null>(null);
  const [isCheckingConflict, setIsCheckingConflict] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();

  const timeSlots = useMemo(() => {
    if (!selectedDate || !doctor) return [];
    
    const dayOfWeek = format(selectedDate, 'EEEE') as DayOfWeek;
    const availability = doctor.availability[dayOfWeek];
    if (!availability) return [];

    const slots: string[] = [];
    let currentTime = parse(availability.start, 'HH:mm', selectedDate);
    const endTime = parse(availability.end, 'HH:mm', selectedDate);

    while (isBefore(currentTime, endTime)) {
      slots.push(format(currentTime, 'HH:mm'));
      currentTime = add(currentTime, { minutes: doctor.appointmentDuration });
    }
    return slots;
  }, [doctor, selectedDate]);

  const availableTimeSlots = useMemo(() => {
    if (!selectedDate || !doctor) return [];

    const bookedTimes = appointments
      .filter(app => app.doctorId === doctor.id && format(new Date(app.dateTime), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd'))
      .map(app => format(new Date(app.dateTime), 'HH:mm'));

    return timeSlots.filter(slot => !bookedTimes.includes(slot));
  }, [timeSlots, appointments, doctor, selectedDate]);

  const handleTimeSelect = async (time: string) => {
    setSelectedTime(time);
    if (!selectedDate || !user) return;

    setIsCheckingConflict(true);
    setConflict(null);
    
    const appointmentDateTime = new Date(selectedDate);
    const [hours, minutes] = time.split(':').map(Number);
    appointmentDateTime.setHours(hours, minutes);

    const patientAppointments = appointments.filter(a => a.patientId === user.id)
      .map(a => `${a.doctorName} em ${format(new Date(a.dateTime), 'PPP p')}`).join(', ');

    const input: DetectConflictsInput = {
      appointmentDateTime: appointmentDateTime.toISOString(),
      existingAppointments: patientAppointments || 'Nenhuma consulta existente',
      patientSchedule: patientSchedule || 'Nenhuma agenda pessoal fornecida',
    };
    
    try {
      const result = await detectConflicts(input);
      if (result.hasConflicts) {
        setConflict({ hasConflicts: true, details: result.conflictDetails });
      } else {
        setConflict({ hasConflicts: false, details: 'Nenhum conflito detectado. Este horário parece bom!' });
      }
    } catch (error) {
      console.error('Erro ao verificar conflitos:', error);
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível verificar conflitos de agendamento.' });
    } finally {
      setIsCheckingConflict(false);
    }
  };

  const handleBookAppointment = () => {
    if (!selectedDate || !selectedTime || !user || !doctor) {
      toast({ variant: 'destructive', title: 'Erro no Agendamento', description: 'Por favor, selecione uma data e hora.' });
      return;
    }
    
    setIsBooking(true);
    const appointmentDateTime = new Date(selectedDate);
    const [hours, minutes] = selectedTime.split(':').map(Number);
    appointmentDateTime.setHours(hours, minutes);

    const newAppointment: Appointment = {
      id: new Date().toISOString(),
      patientId: user.id,
      patientName: user.name,
      doctorId: doctor.id,
      doctorName: doctor.name,
      dateTime: appointmentDateTime.toISOString(),
      status: 'upcoming',
    };
    
    setTimeout(() => {
      setAppointments(prev => [...prev, newAppointment]);
      toast({ title: 'Consulta Agendada!', description: `Sua consulta com ${newAppointment.doctorName} está confirmada.` });
      
      setSelectedDate(undefined);
      setSelectedTime(null);
      setConflict(null);
      setIsBooking(false);
      onAppointmentBooked();
    }, 500);
  };
  
  if (!doctor) {
    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Agendar Consulta Inicial</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-center text-muted-foreground p-4">
                  Nenhum clínico geral foi configurado no sistema. Entre em contato com um administrador.
                </p>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Agendar Consulta Inicial</CardTitle>
        <CardDescription>Toda primeira consulta é com nosso Clínico Geral, {doctor.name}.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="text-sm font-medium mb-2 block">1. Escolha uma Data</label>
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={date => { setSelectedDate(date); setSelectedTime(null); setConflict(null); }}
              disabled={(date) => {
                const dayOfWeek = format(date, 'EEEE') as DayOfWeek;
                return isBefore(date, new Date()) || !doctor.availability[dayOfWeek];
              }}
              initialFocus
            />
          </div>
        </div>

        {selectedDate && (
          <div>
            <label className="text-sm font-medium mb-2 block">2. Escolha um Horário</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {availableTimeSlots.map(time => (
                <Button 
                  key={time} 
                  variant={selectedTime === time ? 'default' : 'outline'}
                  onClick={() => handleTimeSelect(time)}
                >
                  {time}
                </Button>
              ))}
              {availableTimeSlots.length === 0 && <p className="text-muted-foreground col-span-full text-center">Nenhum horário disponível para este dia.</p>}
            </div>
          </div>
        )}
        
        {isCheckingConflict && (
          <div className="flex items-center justify-center p-4 rounded-md bg-secondary">
             <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
             <span className="text-muted-foreground">Nossa IA está verificando conflitos...</span>
          </div>
        )}

        {conflict && (
          <Alert variant={conflict.hasConflicts ? 'destructive' : 'default'} className={!conflict.hasConflicts ? 'bg-green-100 border-green-200' : ''}>
            {conflict.hasConflicts ? <AlertCircle className="h-4 w-4" /> : <Sparkles className="h-4 w-4 text-green-700" />}
            <AlertTitle>{conflict.hasConflicts ? 'Possível Conflito Detectado' : 'Parece Bom!'}</AlertTitle>
            <AlertDescription className={!conflict.hasConflicts ? 'text-green-800' : ''}>
              {conflict.details}
            </AlertDescription>
          </Alert>
        )}

        {selectedTime && !isCheckingConflict && (
          <Button onClick={handleBookAppointment} className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isBooking || conflict?.hasConflicts}>
            {isBooking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {conflict?.hasConflicts ? 'Escolha outro horário' : 'Confirmar Agendamento'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

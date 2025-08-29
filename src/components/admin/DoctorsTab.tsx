'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { PlusCircle, MoreVertical } from 'lucide-react';
import { Doctor, DayOfWeek } from '@/lib/types';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const weekDays: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const weekDaysPT: { [key in DayOfWeek]: string } = {
  Sunday: 'Domingo',
  Monday: 'Segunda-feira',
  Tuesday: 'Terça-feira',
  Wednesday: 'Quarta-feira',
  Thursday: 'Quinta-feira',
  Friday: 'Sexta-feira',
  Saturday: 'Sábado',
};

const formSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório'),
  email: z.string().email('O email é inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  specialty: z.string().min(1, 'A especialidade é obrigatória'),
  appointmentDuration: z.coerce.number().min(5, 'A duração deve ser de no mínimo 5 minutos'),
  availability: z.array(z.object({
    day: z.string(),
    enabled: z.boolean(),
    start: z.string(),
    end: z.string(),
  })).refine(val => val.some(day => day.enabled), {
    message: 'Pelo menos um dia deve ser selecionado para disponibilidade.'
  })
});

type DoctorFormValues = z.infer<typeof formSchema>;

interface DoctorsTabProps {
  doctors: Doctor[];
  setDoctors: (value: Doctor[] | ((val: Doctor[]) => Doctor[])) => void;
}

export default function DoctorsTab({ doctors, setDoctors }: DoctorsTabProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<DoctorFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      specialty: '',
      appointmentDuration: 30,
      availability: weekDays.map(day => ({ day, enabled: false, start: '09:00', end: '17:00' }))
    }
  });

  const { fields } = useFieldArray({ control: form.control, name: 'availability' });

  const onSubmit = (data: DoctorFormValues) => {
    const newDoctor: Doctor = {
      id: `doc_${new Date().getTime()}`,
      name: data.name,
      email: data.email,
      password: data.password,
      specialty: data.specialty,
      appointmentDuration: data.appointmentDuration,
      availability: data.availability.reduce((acc, curr) => {
        if (curr.enabled) {
          acc[curr.day as DayOfWeek] = { start: curr.start, end: curr.end };
        }
        return acc;
      }, {} as Doctor['availability'])
    };
    setDoctors(prev => [...prev, newDoctor]);
    toast({ title: 'Médico Adicionado', description: `${data.name} foi adicionado à lista.` });
    form.reset();
    setOpen(false);
  };
  
  const handleDelete = (doctorId: string) => {
    setDoctors(prev => prev.filter(doc => doc.id !== doctorId));
    toast({ variant: 'destructive', title: 'Médico Removido' });
  };
  
  const getDayNameInPortuguese = (day: string) => {
    return weekDaysPT[day as DayOfWeek] || day;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Médico
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Médico</DialogTitle>
              <DialogDescription>Preencha os detalhes para adicionar um novo médico ao sistema.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Nome Completo</FormLabel><FormControl><Input placeholder="Dr. João da Silva" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="specialty" render={({ field }) => (
                    <FormItem><FormLabel>Especialidade</FormLabel><FormControl><Input placeholder="Cardiologia" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                 <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="medico@email.com" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem><FormLabel>Senha</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                 <FormField control={form.control} name="appointmentDuration" render={({ field }) => (
                    <FormItem><FormLabel>Duração da Consulta (minutos)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                
                <FormItem>
                  <FormLabel>Disponibilidade</FormLabel>
                   <div className="space-y-2">
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex items-center gap-4 p-2 border rounded-md">
                        <FormField control={form.control} name={`availability.${index}.enabled`} render={({ field }) => (
                          <FormItem className="flex items-center gap-2 space-y-0">
                            <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                            <FormLabel className="w-24">{weekDaysPT[weekDays[index]]}</FormLabel>
                          </FormItem>
                         )} />
                         {form.watch(`availability.${index}.enabled`) && (
                            <>
                              <FormField control={form.control} name={`availability.${index}.start`} render={({ field }) => (
                                <FormItem><FormLabel className="text-xs">Início</FormLabel><FormControl><Input type="time" {...field} /></FormControl></FormItem>
                              )} />
                              <FormField control={form.control} name={`availability.${index}.end`} render={({ field }) => (
                                <FormItem><FormLabel className="text-xs">Fim</FormLabel><FormControl><Input type="time" {...field} /></FormControl></FormItem>
                              )} />
                            </>
                          )}
                      </div>
                    ))}
                    <FormMessage>{form.formState.errors.availability?.root?.message}</FormMessage>
                  </div>
                </FormItem>
                <DialogFooter>
                  <Button type="submit">Salvar Médico</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Especialidade</TableHead>
              <TableHead>Dias Disponíveis</TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {doctors.map(doctor => (
              <TableRow key={doctor.id}>
                <TableCell className="font-medium">{doctor.name}</TableCell>
                <TableCell>{doctor.specialty}</TableCell>
                <TableCell>{Object.keys(doctor.availability).map(getDayNameInPortuguese).join(', ')}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleDelete(doctor.id)} className="text-red-600">Excluir</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

    
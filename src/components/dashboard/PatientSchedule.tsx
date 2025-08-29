'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Check } from 'lucide-react';

interface PatientScheduleProps {
  initialSchedule: string;
  onUpdate: (newSchedule: string) => void;
}

export default function PatientSchedule({ initialSchedule, onUpdate }: PatientScheduleProps) {
  const [schedule, setSchedule] = useState(initialSchedule);
  const { toast } = useToast();

  const handleSave = () => {
    onUpdate(schedule);
    toast({
      title: 'Agenda Atualizada',
      description: 'Sua agenda pessoal foi salva.',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sua Agenda Pessoal</CardTitle>
        <CardDescription>
          Para uma melhor detecção de conflitos, informe-nos sobre seus compromissos regulares (ex: "Trabalho das 9h às 17h de seg-sex", "Aula de ioga às terças-feiras às 19h").
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Descreva sua agenda semanal..."
          value={schedule}
          onChange={(e) => setSchedule(e.target.value)}
          rows={5}
        />
        <Button onClick={handleSave} className="w-full">
          <Check className="mr-2 h-4 w-4" />
          Salvar Agenda
        </Button>
      </CardContent>
    </Card>
  );
}

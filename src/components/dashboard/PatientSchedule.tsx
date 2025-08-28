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
      title: 'Schedule Updated',
      description: 'Your personal schedule has been saved.',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Personal Schedule</CardTitle>
        <CardDescription>
          For better conflict detection, tell us about your regular commitments (e.g., "Work 9am-5pm Mon-Fri", "Yoga class Tuesdays at 7pm").
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Describe your weekly schedule..."
          value={schedule}
          onChange={(e) => setSchedule(e.target.value)}
          rows={5}
        />
        <Button onClick={handleSave} className="w-full">
          <Check className="mr-2 h-4 w-4" />
          Save Schedule
        </Button>
      </CardContent>
    </Card>
  );
}

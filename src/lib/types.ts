export interface Patient {
  id: string;
  name: string;
  email: string;
  password: string; // NOTE: In a real app, never store plain text passwords.
  schedule?: string;
  avatarUrl?: string;
}

export interface Doctor {
  id: string;
  name: string;
  email: string;
  password: string; // NOTE: In a real app, never store plain text passwords.
  specialty: string;
  availability: {
    [day: string]: { start: string; end:string } | undefined;
  };
  appointmentDuration: number; // in minutes
  avatarUrl?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  dateTime: string; // ISO string
  status: 'upcoming' | 'completed' | 'cancelled';
  notes?: string;
  isNew?: boolean;
}

export type DayOfWeek = 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
import type { Doctor } from './types';

export const PATIENTS_KEY = 'consu_patients';
export const DOCTORS_KEY = 'consu_doctors';
export const APPOINTMENTS_KEY = 'consu_appointments';
export const AUTH_KEY = 'consu_auth';

export const initialDoctors: Doctor[] = [
  {
    id: 'doc1',
    name: 'Dr. Evelyn Reed',
    specialty: 'Cardiology',
    availability: {
      Monday: { start: '09:00', end: '17:00' },
      Wednesday: { start: '09:00', end: '17:00' },
      Friday: { start: '10:00', end: '15:00' },
    },
    appointmentDuration: 30,
  },
  {
    id: 'doc2',
    name: 'Dr. Samuel Green',
    specialty: 'Dermatology',
    availability: {
      Tuesday: { start: '10:00', end: '18:00' },
      Thursday: { start: '10:00', end: '18:00' },
    },
    appointmentDuration: 20,
  },
   {
    id: 'doc3',
    name: 'Dr. Olivia Chen',
    specialty: 'Pediatrics',
    availability: {
      Monday: { start: '08:00', end: '12:00' },
      Tuesday: { start: '08:00', end: '12:00' },
      Wednesday: { start: '08:00', end: '12:00' },
      Thursday: { start: '08:00', end: '12:00' },
      Friday: { start: '08:00', end: '12:00' },
    },
    appointmentDuration: 15,
  },
];

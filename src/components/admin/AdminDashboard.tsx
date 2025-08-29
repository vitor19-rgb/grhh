'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import DoctorsTab from "./DoctorsTab";
import PatientsTab from "./PatientsTab";
import useLocalStorage from "@/hooks/use-local-storage";
import type { Appointment, Doctor, Patient } from "@/lib/types";
import { APPOINTMENTS_KEY, DOCTORS_KEY, PATIENTS_KEY, initialDoctors } from "@/lib/data";

export default function AdminDashboard() {
  const [doctors, setDoctors] = useLocalStorage<Doctor[]>(DOCTORS_KEY, initialDoctors);
  const [patients] = useLocalStorage<Patient[]>(PATIENTS_KEY, []);
  const [appointments] = useLocalStorage<Appointment[]>(APPOINTMENTS_KEY, []);

  return (
    <Tabs defaultValue="doctors" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="doctors">Gerenciar Médicos</TabsTrigger>
        <TabsTrigger value="patients">Gerenciar Pacientes</TabsTrigger>
      </TabsList>
      <TabsContent value="doctors">
        <Card>
          <CardHeader>
            <CardTitle>Médicos</CardTitle>
            <CardDescription>Visualize e gerencie perfis e horários dos médicos.</CardDescription>
          </CardHeader>
          <CardContent>
            <DoctorsTab doctors={doctors} setDoctors={setDoctors} />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="patients">
        <Card>
          <CardHeader>
            <CardTitle>Pacientes</CardTitle>
            <CardDescription>Visualize as informações dos pacientes registrados.</CardDescription>
          </CardHeader>
          <CardContent>
            <PatientsTab patients={patients} appointments={appointments} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

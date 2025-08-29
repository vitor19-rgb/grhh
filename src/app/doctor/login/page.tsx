import { DoctorLoginForm } from '@/components/auth/DoctorLoginForm';
import { Logo } from '@/components/Logo';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AuthProvider } from '@/hooks/use-auth';
import Link from 'next/link';

export default function DoctorLoginPage() {
  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
        <div className="mx-auto w-full max-w-sm">
          <Card>
            <CardHeader className="text-center">
              <div className="mb-4 flex justify-center">
                 <Logo />
              </div>
              <CardTitle className="text-2xl font-bold font-headline">Login do Médico</CardTitle>
              <CardDescription>Insira suas credenciais para acessar seu painel</CardDescription>
            </CardHeader>
            <CardContent>
              <DoctorLoginForm />
              <div className="mt-4 text-center text-sm">
                Não é um médico?{' '}
                <Link href="/login" className="underline text-primary">
                  Login do Paciente
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthProvider>
  );
}

    
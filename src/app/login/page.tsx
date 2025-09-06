import { PatientLoginForm } from '@/components/auth/PatientLoginForm';
import { Logo } from '@/components/Logo';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { AuthProvider } from '@/hooks/use-auth';

export default function PatientLoginPage() {
  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
        <div className="mx-auto w-full max-w-sm">
          <Card>
            <CardHeader className="text-center">
              <div className="mb-4 flex justify-center">
                 <Logo />
              </div>
              <CardTitle className="text-2xl font-bold font-headline">Login do Paciente</CardTitle>
              <CardDescription>Insira seu e-mail abaixo para fazer login em sua conta</CardDescription>
            </CardHeader>
            <CardContent>
              <PatientLoginForm />
              <div className="mt-4 text-center text-sm">
                Não tem uma conta?{' '}
                <Link href="/register" className="underline text-primary">
                  Crie uma conta
                </Link>
              </div>
              <div className="mt-2 text-center text-sm">
                Você é um médico?{' '}
                <Link href="/doctor/login" className="underline text-primary">
                  Faça login aqui
                </Link>
              </div>
              <div className="mt-2 text-center text-sm">
                É um administrador?{' '}
                <Link href="/admin/login" className="underline text-primary">
                  Acesse aqui
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthProvider>
  );
}

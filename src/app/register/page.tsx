import { PatientRegisterForm } from '@/components/auth/PatientRegisterForm';
import { Logo } from '@/components/Logo';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AuthProvider } from '@/hooks/use-auth';
import Link from 'next/link';

export default function PatientRegisterPage() {
  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
        <div className="mx-auto w-full max-w-sm">
          <Card>
            <CardHeader className="text-center">
              <div className="mb-4 flex justify-center">
                 <Logo />
              </div>
              <CardTitle className="text-2xl font-bold font-headline">Create an Account</CardTitle>
              <CardDescription>Enter your details below to register</CardDescription>
            </CardHeader>
            <CardContent>
              <PatientRegisterForm />
              <div className="mt-4 text-center text-sm">
                Already have an account?{' '}
                <Link href="/login" className="underline text-primary">
                  Login
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthProvider>
  );
}

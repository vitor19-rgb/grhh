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
              <CardTitle className="text-2xl font-bold font-headline">Patient Login</CardTitle>
              <CardDescription>Enter your email below to login to your account</CardDescription>
            </CardHeader>
            <CardContent>
              <PatientLoginForm />
              <div className="mt-4 text-center text-sm">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="underline text-primary">
                  Sign up
                </Link>
              </div>
              <div className="mt-2 text-center text-sm">
                Are you an admin?{' '}
                <Link href="/admin/login" className="underline text-primary">
                  Login here
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthProvider>
  );
}

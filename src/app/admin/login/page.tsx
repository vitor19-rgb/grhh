import { AdminLoginForm } from '@/components/auth/AdminLoginForm';
import { Logo } from '@/components/Logo';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AuthProvider } from '@/hooks/use-auth';
import Link from 'next/link';

export default function AdminLoginPage() {
  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
        <div className="mx-auto w-full max-w-sm">
          <Card>
            <CardHeader className="text-center">
              <div className="mb-4 flex justify-center">
                 <Logo />
              </div>
              <CardTitle className="text-2xl font-bold font-headline">Admin Login</CardTitle>
              <CardDescription>Enter admin credentials to access the dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminLoginForm />
              <div className="mt-4 text-center text-sm">
                Not an admin?{' '}
                <Link href="/login" className="underline text-primary">
                  Patient Login
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthProvider>
  );
}

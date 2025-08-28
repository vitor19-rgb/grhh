'use client';

import { AuthProvider, ProtectRoute } from '@/hooks/use-auth';
import { Header } from '@/components/Header';

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ProtectRoute adminOnly={true}>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1">{children}</main>
        </div>
      </ProtectRoute>
    </AuthProvider>
  );
}

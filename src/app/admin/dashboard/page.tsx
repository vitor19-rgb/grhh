'use client';

import AdminDashboard from "@/components/admin/AdminDashboard";

export default function AdminDashboardPage() {
    return (
        <div className="container mx-auto p-4 sm:p-6 md:p-8">
            <h1 className="text-3xl font-bold mb-6 font-headline">Painel do Administrador</h1>
            <AdminDashboard />
        </div>
    );
}

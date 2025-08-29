import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Shield, BrainCircuit } from 'lucide-react';
import { Logo } from '@/components/Logo';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="px-4 lg:px-6 h-16 flex items-center bg-card/80 backdrop-blur-sm sticky top-0 z-50 border-b">
        <Logo />
        <nav className="ml-auto flex items-center gap-4 sm:gap-6">
          <Button asChild variant="ghost">
            <Link href="/login">Login do Paciente</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/doctor/login">Login do Médico</Link>
          </Button>
          <Button asChild variant="outline" className="hidden sm:flex">
            <Link href="/admin/login">Login de Admin</Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                    Agendamento de Consultas Médicas Sem Esforço, na Ponta dos Seus Dedos
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    ConsuOnline ajuda você a agendar suas consultas de saúde com facilidade. Diga adeus à espera ao telefone.
                  </p>
                </div>
              </div>
              <Image
                src="https://picsum.photos/600/400"
                width="600"
                height="400"
                alt="Médico consultando um paciente"
                data-ai-hint="doctor patient consultation"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
              />
            </div>
          </div>
        </section>
        
        <section className="w-full py-12 md:py-24 lg:py-32 bg-card">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">
                  Principais Recursos
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Por que Escolher a ConsuOnline?</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Oferecemos uma plataforma integrada e inteligente para gerenciar seus agendamentos de saúde.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:max-w-none mt-12">
              <div className="grid gap-1 text-center">
                 <div className="mx-auto bg-primary/10 p-4 rounded-full mb-4">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                <h3 className="text-lg font-bold font-headline">Painel Centrado no Paciente</h3>
                <p className="text-sm text-muted-foreground">Veja os próximos agendamentos e agende novos em seu painel pessoal.</p>
              </div>
              <div className="grid gap-1 text-center">
                <div className="mx-auto bg-primary/10 p-4 rounded-full mb-4">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-bold font-headline">Gerenciamento Administrativo</h3>
                <p className="text-sm text-muted-foreground">Administradores podem gerenciar facilmente os horários dos médicos e os registros dos pacientes através de um painel seguro.</p>
              </div>
              <div className="grid gap-1 text-center">
                <div className="mx-auto bg-primary/10 p-4 rounded-full mb-4">
                  <BrainCircuit className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-bold font-headline">Detecção Inteligente de Conflitos</h3>
                <p className="text-sm text-muted-foreground">Nosso assistente com IA ajuda a evitar conflitos de agendamento com seus compromissos existentes e agenda pessoal.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-card">
        <p className="text-xs text-muted-foreground">&copy; 2024 ConsuOnline. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}

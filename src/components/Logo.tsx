import { Stethoscope } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center justify-center", className)}>
      <Stethoscope className="h-7 w-7 text-primary" />
      <span className="ml-2 text-2xl font-bold text-primary font-headline">ConsuOnline</span>
    </Link>
  );
}

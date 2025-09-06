'use client';

import { useState } from 'react';
import { LogOut, User, LayoutDashboard, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/use-auth';
import { Logo } from './Logo';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from '@/hooks/use-toast';

export function Header() {
  const { user, isAdmin, isDoctor, logout, updateUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? '');
  const [isSaving, setIsSaving] = useState(false);
  
  const getInitials = (name: string | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getDashboardPath = () => {
    if (isAdmin) return '/admin/dashboard';
    if (isDoctor) return '/doctor/dashboard';
    return '/dashboard';
  };
  
  const handleSaveProfile = () => {
    if (!user) return;
    setIsSaving(true);
    
    // Simple URL validation
    try {
      if (avatarUrl) {
         new URL(avatarUrl);
      }
    } catch (_) {
       toast({
          variant: 'destructive',
          title: 'URL Inválida',
          description: 'Por favor, insira uma URL de imagem válida.',
        });
        setIsSaving(false);
        return;
    }
    
    setTimeout(() => {
      if (user) {
        updateUser({ ...user, avatarUrl });
      }
      setIsSaving(false);
      setIsProfileModalOpen(false);
      toast({
        title: 'Perfil Atualizado',
        description: 'Sua foto de perfil foi alterada com sucesso.',
      });
    }, 500);
  };
  
  const openProfileModal = () => {
    setAvatarUrl(user?.avatarUrl ?? '');
    setIsProfileModalOpen(true);
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center px-4 sm:px-6">
          <Logo />
          <div className="ml-auto flex items-center space-x-2 sm:space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user?.avatarUrl ?? `https://avatar.vercel.sh/${user?.email}.png`} alt={user?.name} />
                    <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push(getDashboardPath())}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>Painel</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={openProfileModal}>
                  <ImageIcon className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Profile Edit Modal */}
       <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
          <DialogContent className="sm:max-w-md">
              <DialogHeader>
                  <DialogTitle>Editar Perfil</DialogTitle>
                  <DialogDescription>
                      Atualize sua foto de perfil. Cole a URL de uma imagem abaixo.
                  </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                  <div className="space-y-2">
                      <Label htmlFor="avatar-url">URL da Imagem de Perfil</Label>
                      <Input 
                        id="avatar-url"
                        placeholder="https://exemplo.com/sua-imagem.png"
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                      />
                  </div>
              </div>
              <DialogFooter className="sm:justify-start">
                   <Button type="button" variant="outline" onClick={() => setIsProfileModalOpen(false)}>Cancelar</Button>
                   <Button type="button" onClick={handleSaveProfile} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Salvar
                  </Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </>
  );
}


import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export function MainLayout() {
  const { signOut } = useAuth();
  
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto relative">
        <div className="container py-6 h-full">
          <Outlet />
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-4 right-4"
          onClick={signOut}
          title="Log out"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </main>
    </div>
  );
}


import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * MainLayout component - Provides the main application layout with sidebar
 * and content area
 */
export function MainLayout() {
  const { signOut } = useAuth();
  const location = useLocation();
  const [pageKey, setPageKey] = useState(location.pathname);
  
  // Update the key when route changes to trigger animations
  useEffect(() => {
    setPageKey(location.pathname);
  }, [location.pathname]);
  
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={pageKey}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="container py-6 h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
        
        {/* Logout button with hover animation */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-4 right-4 hover:bg-destructive/10 transition-all duration-300 hover:rotate-12"
          onClick={signOut}
          title="Log out"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </main>
    </div>
  );
}

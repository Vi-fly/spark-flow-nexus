
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { LogOut, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * MainLayout component - Provides the main application layout with sidebar
 * and content area
 */
export function MainLayout() {
  const { signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const [pageKey, setPageKey] = useState(location.pathname);
  
  // Update the key when route changes to trigger animations
  useEffect(() => {
    setPageKey(location.pathname);
  }, [location.pathname]);
  
  /**
   * Toggle between light and dark theme
   */
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };
  
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
        
        {/* Theme toggler */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-4 right-14 hover:bg-primary/10 transition-all duration-300"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>
        
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


import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { LogOut, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * MainLayout component - Provides the main application layout
 * 
 * This component:
 * - Renders the sidebar navigation
 * - Displays the main content area with page animations
 * - Provides theme toggle and logout buttons
 * - Applies global theme settings from ThemeContext
 */
export function MainLayout() {
  // Get authentication context for user-related functions
  const { signOut } = useAuth();
  
  // Get theme context for appearance and layout settings
  const { 
    theme, 
    toggleTheme,
    reduceMotion,
    highContrast,
    glassEffects,
    compactMode,
    accentColor,
    fontScale
  } = useTheme();
  
  // Get current location for page transition animations
  const location = useLocation();
  const [pageKey, setPageKey] = useState(location.pathname);
  
  // Update the key when route changes to trigger animations
  useEffect(() => {
    setPageKey(location.pathname);
  }, [location.pathname]);

  /**
   * Get animation properties based on user's reduced motion preference
   * This makes the app more accessible for users who prefer reduced motion
   */
  const getAnimationProps = () => {
    if (reduceMotion) {
      // Subtle fade animation when reduced motion is preferred
      return {
        initial: { opacity: 0.8 },
        animate: { opacity: 1 },
        exit: { opacity: 0.8 },
        transition: { duration: 0.1 }
      };
    }
    
    // Standard animation with both opacity and movement
    return {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -10 },
      transition: { duration: 0.3 }
    };
  };
  
  // Compose class names based on active theme settings
  const containerClasses = [
    'flex h-screen w-full overflow-hidden bg-background',
    compactMode ? 'compact-mode' : '',
    highContrast ? 'high-contrast-mode' : '',
    glassEffects ? 'glass-effects-enabled' : '',
    `accent-${accentColor}`,
    `font-scale-${fontScale.replace('.', '_')}`
  ].filter(Boolean).join(' ');
  
  return (
    <div className={containerClasses}>
      {/* Sidebar navigation component */}
      <Sidebar />
      
      {/* Main content area */}
      <main className="flex-1 overflow-auto relative">
        {/* Page transition animations */}
        <AnimatePresence mode="wait">
          <motion.div
            key={pageKey}
            {...getAnimationProps()}
            className="container py-6 h-full"
          >
            {/* Route content rendered here */}
            <Outlet />
          </motion.div>
        </AnimatePresence>
        
        {/* Theme toggle button */}
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

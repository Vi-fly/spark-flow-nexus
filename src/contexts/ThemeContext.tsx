
import React, { createContext, useContext, useEffect, useState } from 'react';

// Define the ThemeContext type with all the needed settings
type ThemeContextType = {
  theme: string;
  setTheme: (theme: string) => void;
  toggleTheme: () => void;
  reduceMotion: boolean;
  setReduceMotion: (value: boolean) => void;
  highContrast: boolean;
  setHighContrast: (value: boolean) => void;
  glassEffects: boolean;
  setGlassEffects: (value: boolean) => void;
  compactMode: boolean;
  setCompactMode: (value: boolean) => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
  fontScale: string;
  setFontScale: (scale: string) => void;
  colorScheme: string;
  setColorScheme: (scheme: string) => void;
  compactSidebar: boolean;
  setCompactSidebar: (value: boolean) => void;
  fixedHeader: boolean;
  setFixedHeader: (value: boolean) => void;
  showQuickActions: boolean;
  setShowQuickActions: (value: boolean) => void;
  tabbedInterface: boolean;
  setTabbedInterface: (value: boolean) => void;
  dashboardLayout: string;
  setDashboardLayout: (layout: string) => void;
};

// Create the context with default values
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// ThemeProvider component to manage theme state and provide it to all children
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Initialize theme state from localStorage or system preference
  const [theme, setTheme] = useState(() => {
    // Check if theme is stored in localStorage
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      return storedTheme;
    }
    
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  });

  // Initialize additional settings
  const [reduceMotion, setReduceMotion] = useState(localStorage.getItem('reduceMotion') === 'true');
  const [highContrast, setHighContrast] = useState(localStorage.getItem('highContrast') === 'true');
  const [glassEffects, setGlassEffects] = useState(localStorage.getItem('glassEffects') !== 'false');
  const [compactMode, setCompactMode] = useState(localStorage.getItem('compactMode') === 'true');
  const [accentColor, setAccentColor] = useState(localStorage.getItem('accentColor') || 'indigo');
  const [fontScale, setFontScale] = useState(localStorage.getItem('fontScale') || '1');
  const [colorScheme, setColorScheme] = useState(localStorage.getItem('colorScheme') || 'default');
  
  // Layout settings
  const [compactSidebar, setCompactSidebar] = useState(localStorage.getItem('compactSidebar') === 'true');
  const [fixedHeader, setFixedHeader] = useState(localStorage.getItem('fixedHeader') !== 'false');
  const [showQuickActions, setShowQuickActions] = useState(localStorage.getItem('showQuickActions') !== 'false');
  const [tabbedInterface, setTabbedInterface] = useState(localStorage.getItem('tabbedInterface') === 'true');
  const [dashboardLayout, setDashboardLayout] = useState(localStorage.getItem('dashboardLayout') || 'grid');

  // Function to toggle between light and dark themes
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  // Update localStorage and apply theme when it changes
  useEffect(() => {
    // Store theme preference in localStorage
    localStorage.setItem('theme', theme);
    
    // Apply theme to document
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Apply all appearance settings when they change
  useEffect(() => {
    // Store settings in localStorage
    localStorage.setItem('reduceMotion', reduceMotion.toString());
    localStorage.setItem('highContrast', highContrast.toString());
    localStorage.setItem('glassEffects', glassEffects.toString());
    localStorage.setItem('compactMode', compactMode.toString());
    localStorage.setItem('accentColor', accentColor);
    localStorage.setItem('fontScale', fontScale);
    localStorage.setItem('colorScheme', colorScheme);
    
    // Apply settings to document
    const root = document.documentElement;
    
    // Apply font scaling
    root.style.fontSize = `${parseFloat(fontScale) * 100}%`;
    
    // Apply reduce motion
    if (reduceMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
    
    // Apply high contrast
    if (highContrast) {
      root.classList.add('high-contrast-mode');
    } else {
      root.classList.remove('high-contrast-mode');
    }
    
    // Apply compact mode
    if (compactMode) {
      root.classList.add('compact-mode');
    } else {
      root.classList.remove('compact-mode');
    }
    
    // Apply accent color and color scheme
    root.setAttribute('data-accent', accentColor);
    root.setAttribute('data-color-scheme', colorScheme);
    
  }, [reduceMotion, highContrast, glassEffects, compactMode, accentColor, fontScale, colorScheme]);

  // Apply layout settings when they change
  useEffect(() => {
    // Store layout settings in localStorage
    localStorage.setItem('compactSidebar', compactSidebar.toString());
    localStorage.setItem('fixedHeader', fixedHeader.toString());
    localStorage.setItem('showQuickActions', showQuickActions.toString());
    localStorage.setItem('tabbedInterface', tabbedInterface.toString());
    localStorage.setItem('dashboardLayout', dashboardLayout);
    
    // Apply layout settings to document
    const root = document.documentElement;
    
    // Apply compact sidebar
    if (compactSidebar) {
      root.classList.add('compact-sidebar');
    } else {
      root.classList.remove('compact-sidebar');
    }
    
    // Apply fixed header
    if (fixedHeader) {
      root.classList.add('fixed-header');
    } else {
      root.classList.remove('fixed-header');
    }
    
    // Apply tabbed interface
    if (tabbedInterface) {
      root.classList.add('tabbed-interface');
    } else {
      root.classList.remove('tabbed-interface');
    }
    
    // Apply dashboard layout
    root.setAttribute('data-dashboard-layout', dashboardLayout);
    
  }, [compactSidebar, fixedHeader, showQuickActions, tabbedInterface, dashboardLayout]);

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't manually set a preference
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    // Add event listener
    mediaQuery.addEventListener('change', handleChange);
    
    // Clean up
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Listen for reduced motion preference
  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleMotionChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't manually set a preference
      if (!localStorage.getItem('reduceMotion')) {
        setReduceMotion(e.matches);
      }
    };
    
    // Add event listener
    motionQuery.addEventListener('change', handleMotionChange);
    
    // Clean up
    return () => motionQuery.removeEventListener('change', handleMotionChange);
  }, []);

  // Provide all settings to children
  return (
    <ThemeContext.Provider value={{ 
      theme, 
      setTheme, 
      toggleTheme,
      reduceMotion,
      setReduceMotion,
      highContrast,
      setHighContrast,
      glassEffects,
      setGlassEffects,
      compactMode,
      setCompactMode,
      accentColor,
      setAccentColor,
      fontScale,
      setFontScale,
      colorScheme,
      setColorScheme,
      compactSidebar,
      setCompactSidebar,
      fixedHeader,
      setFixedHeader,
      showQuickActions,
      setShowQuickActions,
      tabbedInterface, 
      setTabbedInterface,
      dashboardLayout,
      setDashboardLayout
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use the theme context
export function useTheme() {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}

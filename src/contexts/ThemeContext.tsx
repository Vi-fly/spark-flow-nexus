
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

/**
 * ThemeProvider component to manage theme state and provide it to all children
 * This component handles:
 * - Theme (light/dark) preference
 * - Accessibility options (reduce motion, high contrast)
 * - UI preferences (glass effects, compact mode)
 * - Color and font customization
 * - Layout configuration
 */
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

  // Initialize additional settings from localStorage or with defaults
  const [reduceMotion, setReduceMotion] = useState(localStorage.getItem('reduceMotion') === 'true');
  const [highContrast, setHighContrast] = useState(localStorage.getItem('highContrast') === 'true');
  const [glassEffects, setGlassEffects] = useState(localStorage.getItem('glassEffects') !== 'false');
  const [compactMode, setCompactMode] = useState(localStorage.getItem('compactMode') === 'true');
  const [accentColor, setAccentColor] = useState(localStorage.getItem('accentColor') || 'indigo');
  const [fontScale, setFontScale] = useState(localStorage.getItem('fontScale') || '1');
  const [colorScheme, setColorScheme] = useState(localStorage.getItem('colorScheme') || 'default');
  
  // Layout settings with default values
  const [compactSidebar, setCompactSidebar] = useState(localStorage.getItem('compactSidebar') === 'true');
  const [fixedHeader, setFixedHeader] = useState(localStorage.getItem('fixedHeader') !== 'false');
  const [showQuickActions, setShowQuickActions] = useState(localStorage.getItem('showQuickActions') !== 'false');
  const [tabbedInterface, setTabbedInterface] = useState(localStorage.getItem('tabbedInterface') === 'true');
  const [dashboardLayout, setDashboardLayout] = useState(localStorage.getItem('dashboardLayout') || 'grid');

  /**
   * Toggle between light and dark themes
   * This is a convenience function for UI components
   */
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  // Effect: Update localStorage and apply theme when it changes
  useEffect(() => {
    // Store theme preference in localStorage
    localStorage.setItem('theme', theme);
    
    // Apply theme to document root element
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Effect: Apply all appearance settings when they change
  useEffect(() => {
    // Store settings in localStorage for persistence across sessions
    localStorage.setItem('reduceMotion', reduceMotion.toString());
    localStorage.setItem('highContrast', highContrast.toString());
    localStorage.setItem('glassEffects', glassEffects.toString());
    localStorage.setItem('compactMode', compactMode.toString());
    localStorage.setItem('accentColor', accentColor);
    localStorage.setItem('fontScale', fontScale);
    localStorage.setItem('colorScheme', colorScheme);
    
    // Apply settings to document root element
    const root = document.documentElement;
    
    // Apply font scaling for better readability
    root.style.fontSize = `${parseFloat(fontScale) * 100}%`;
    
    // Apply accessibility settings via CSS classes
    if (reduceMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
    
    if (highContrast) {
      root.classList.add('high-contrast-mode');
    } else {
      root.classList.remove('high-contrast-mode');
    }
    
    if (compactMode) {
      root.classList.add('compact-mode');
    } else {
      root.classList.remove('compact-mode');
    }
    
    // Apply accent color and color scheme as data attributes
    // These can be used in CSS for theming
    root.setAttribute('data-accent', accentColor);
    root.setAttribute('data-color-scheme', colorScheme);
    
  }, [reduceMotion, highContrast, glassEffects, compactMode, accentColor, fontScale, colorScheme]);

  // Effect: Apply layout settings when they change
  useEffect(() => {
    // Store layout settings in localStorage
    localStorage.setItem('compactSidebar', compactSidebar.toString());
    localStorage.setItem('fixedHeader', fixedHeader.toString());
    localStorage.setItem('showQuickActions', showQuickActions.toString());
    localStorage.setItem('tabbedInterface', tabbedInterface.toString());
    localStorage.setItem('dashboardLayout', dashboardLayout);
    
    // Apply layout settings to document root element
    const root = document.documentElement;
    
    // Apply CSS classes for various layout options
    if (compactSidebar) {
      root.classList.add('compact-sidebar');
    } else {
      root.classList.remove('compact-sidebar');
    }
    
    if (fixedHeader) {
      root.classList.add('fixed-header');
    } else {
      root.classList.remove('fixed-header');
    }
    
    if (tabbedInterface) {
      root.classList.add('tabbed-interface');
    } else {
      root.classList.remove('tabbed-interface');
    }
    
    // Apply dashboard layout as a data attribute
    root.setAttribute('data-dashboard-layout', dashboardLayout);
    
  }, [compactSidebar, fixedHeader, showQuickActions, tabbedInterface, dashboardLayout]);

  // Effect: Listen for system preference changes (dark mode)
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't manually set a preference
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    // Add event listener to detect system preference changes
    mediaQuery.addEventListener('change', handleChange);
    
    // Clean up event listener on component unmount
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Effect: Listen for reduced motion preference from system
  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleMotionChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't manually set a preference
      if (!localStorage.getItem('reduceMotion')) {
        setReduceMotion(e.matches);
      }
    };
    
    // Add event listener to detect system preference changes
    motionQuery.addEventListener('change', handleMotionChange);
    
    // Clean up event listener on component unmount
    return () => motionQuery.removeEventListener('change', handleMotionChange);
  }, []);

  // Provide all settings to children components via context
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

/**
 * Custom hook to use the theme context
 * This simplifies access to theme settings in components
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}


import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Session, User, Provider } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Define the shape of the authentication context
interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithProvider: (provider: Provider) => Promise<void>;
  signOut: () => Promise<void>;
}

// Create the context with undefined as default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider component - Manages authentication state and provides auth methods
 * to the entire application
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // State to track authentication status
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Set up auth state listener and check for existing session on mount
  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
    });

    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Sign up a new user with email and password
   * @param email User's email address
   * @param password User's password
   */
  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast.success("Signup successful! Please check your email to verify your account.");
    } catch (error: any) {
      toast.error(error.message || "An error occurred during signup");
      throw error;
    }
  };

  /**
   * Sign in an existing user with email and password
   * @param email User's email address
   * @param password User's password
   */
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast.success("Successfully logged in!");
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || "Invalid login credentials");
      throw error;
    }
  };

  /**
   * Sign in with a third-party provider (Google, GitHub, etc.)
   * @param provider The authentication provider to use
   */
  const signInWithProvider = async (provider: Provider) => {
    try {
      // Check if we're in development mode and give helpful error message
      if (window.location.hostname === 'localhost' || window.location.hostname.includes('lovable')) {
        toast.info(
          `To use ${provider} authentication, you need to configure it in your Supabase project.`,
          { duration: 6000 }
        );
      }
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin,
        },
      });
      
      if (error) {
        // Custom user-friendly error messages
        if (error.message.includes('provider is not enabled')) {
          throw new Error(`${provider} login is not configured. Please enable it in Supabase Authentication settings.`);
        }
        throw error;
      }
    } catch (error: any) {
      toast.error(error.message || `Error signing in with ${provider}`);
      console.error(`${provider} login error:`, error);
      throw error;
    }
  };

  /**
   * Sign out the current user
   */
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Successfully logged out");
      navigate('/auth');
    } catch (error: any) {
      toast.error(error.message || "Error signing out");
    }
  };

  // Provide authentication context to children
  const value = {
    session,
    user,
    loading,
    signUp,
    signIn,
    signInWithProvider,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook to use the auth context
 * @returns Authentication context with user data and auth methods
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

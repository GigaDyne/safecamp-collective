
import { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { signInWithEmail, signUpWithEmail, signInAnonymously, signOut } from "@/lib/supabase";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isEmailVerified: boolean; 
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null, needsEmailVerification?: boolean }>;
  signOut: () => Promise<void>;
  continueAsGuest: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Set up authentication listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        
        if (session) {
          setSession(session);
          setUser(session.user);
          setIsAuthenticated(true);
          
          // Check email verification if applicable
          setIsEmailVerified(
            session.user.email_confirmed_at !== null ||
            session.user.email?.includes("anonymous") ||
            session.user.email?.includes("guest") ||
            false
          );
          
          // Handle sign in and sign up events
          if (event === 'SIGNED_IN') {
            if (location.pathname === '/login' || location.pathname === '/signup') {
              navigate('/');
            }
          } 
        } else {
          setSession(null);
          setUser(null);
          setIsAuthenticated(false);
          setIsEmailVerified(false);
          
          // Don't redirect to login if on signup or login pages
          if (
            event === 'SIGNED_OUT' && 
            location.pathname !== '/login' && 
            location.pathname !== '/signup' &&
            location.pathname !== '/verify-email'
          ) {
            navigate('/login');
          }
        }
        
        setIsLoading(false);
      }
    );

    // Check initial session
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error checking session:", error);
          throw error;
        }
        
        if (data && data.session) {
          setSession(data.session);
          setUser(data.session.user);
          setIsAuthenticated(true);
          
          // Check email verification if applicable
          setIsEmailVerified(
            data.session.user.email_confirmed_at !== null ||
            data.session.user.email?.includes("anonymous") ||
            data.session.user.email?.includes("guest") ||
            false
          );
        }
      } catch (error) {
        console.error("Session check failed:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  // Sign in handler
  const handleSignIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await signInWithEmail(email, password);
      
      if (error) {
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }
      
      toast({
        title: "Signed in successfully",
        description: "Welcome back!",
      });
      
      return { error: null };
    } catch (error) {
      console.error("Error in handleSignIn:", error);
      toast({
        title: "Sign in failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      return { error: error as Error };
    } finally {
      setIsLoading(false);
    }
  };

  // Sign up handler
  const handleSignUp = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await signUpWithEmail(email, password);
      
      if (error) {
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }
      
      if (data?.user?.identities?.length === 0) {
        toast({
          title: "Account already exists",
          description: "Please sign in instead",
          variant: "destructive",
        });
        return { error: new Error("Account already exists") };
      }
      
      // Check if email confirmation is required
      if (!data?.user?.email_confirmed_at) {
        toast({
          title: "Verification email sent",
          description: "Please check your email to verify your account",
        });
        
        // Navigate to verification page
        navigate('/verify-email', { state: { email } });
        return { error: null, needsEmailVerification: true };
      }
      
      toast({
        title: "Account created successfully",
        description: "Welcome to SafeCamp!",
      });
      
      return { error: null };
    } catch (error) {
      console.error("Error in handleSignUp:", error);
      toast({
        title: "Sign up failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      return { error: error as Error };
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out handler
  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      
      const { error } = await signOut();
      
      if (error) {
        toast({
          title: "Sign out failed",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      toast({
        title: "Signed out successfully",
        description: "Come back soon!",
      });
      
      navigate('/login');
    } catch (error) {
      console.error("Error in handleSignOut:", error);
      toast({
        title: "Sign out failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Continue as guest handler
  const handleContinueAsGuest = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await signInAnonymously();
      
      if (error) {
        toast({
          title: "Guest sign in failed",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      toast({
        title: "Continuing as guest",
        description: "You can create an account later to save your data",
      });
      
      navigate('/');
    } catch (error) {
      console.error("Error in handleContinueAsGuest:", error);
      toast({
        title: "Guest sign in failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const contextValue: AuthContextType = {
    session,
    user,
    isLoading,
    isAuthenticated,
    isEmailVerified,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    continueAsGuest: handleContinueAsGuest,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

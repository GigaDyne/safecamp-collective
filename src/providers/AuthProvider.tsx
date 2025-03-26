
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { User } from "@/lib/supabase";
import { signInAnonymously } from "@/lib/auth";
import { associateGuestTripsWithUser } from "@/lib/trip-planner/trip-storage";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  isOfflineMode: boolean;
  signUp: (email: string, password: string) => Promise<{error?: any}>;
  signIn: (email: string, password: string) => Promise<{error?: any}>;
  signOut: () => Promise<void>;
  continueAsGuest: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;
    const checkSession = async () => {
      if (!isMounted) return;
      setIsLoading(true);
      
      try {
        // Check for offline user first
        const offlineUser = localStorage.getItem('offline_user');
        if (offlineUser) {
          const parsedUser = JSON.parse(offlineUser) as User;
          if (isMounted) {
            setUser(parsedUser);
            setIsAuthenticated(true);
            setIsEmailVerified(true);
            setIsOfflineMode(true);
            setIsLoading(false);
          }
          return;
        }

        // Add a timeout for Supabase auth check
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Auth check timeout")), 5000);
        });
        
        // Try to get session with timeout
        const sessionResult = await Promise.race([
          supabase.auth.getSession(),
          timeoutPromise
        ]).catch(error => {
          console.warn("Session check timed out:", error);
          return { data: { session: null }, error };
        });
        
        if (!isMounted) return;
        
        if (sessionResult && 'data' in sessionResult && sessionResult.data?.session) {
          const { data: userData } = await supabase.auth.getUser();
          
          if (userData?.user && isMounted) {
            const isVerified = userData.user.email_confirmed_at !== null;
            setIsEmailVerified(isVerified);
            
            setUser({
              id: userData.user.id,
              email: userData.user.email || '',
              createdAt: new Date(userData.user.created_at || Date.now()).toLocaleDateString()
            });
            
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error("Session check error:", error);
        if (isMounted) {
          setIsOfflineMode(true);
          toast({
            title: "Offline Mode",
            description: "You are in offline mode. Some features may be limited.",
            variant: "default"
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    checkSession();

    // Set up the auth state change listener AFTER the initial session check
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        
        if (!isMounted) return;
        
        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          if (session) {
            try {
              const { data } = await supabase.auth.getUser();
              if (data?.user && isMounted) {
                const isVerified = data.user.email_confirmed_at !== null;
                setIsEmailVerified(isVerified);
                
                setUser({
                  id: data.user.id,
                  email: data.user.email || '',
                  createdAt: new Date(data.user.created_at || Date.now()).toLocaleDateString()
                });
                
                setIsAuthenticated(true);
                setIsOfflineMode(false);
              }
            } catch (error) {
              console.error("Error getting user after auth state change:", error);
            }
          }
        } else if (event === "SIGNED_OUT") {
          if (isMounted) {
            setUser(null);
            setIsAuthenticated(false);
            setIsEmailVerified(false);
            setIsOfflineMode(false);
            navigate("/login");
          }
        } else if (event === "USER_UPDATED") {
          try {
            const { data } = await supabase.auth.getUser();
            if (data?.user && isMounted) {
              const isVerified = data.user.email_confirmed_at !== null;
              setIsEmailVerified(isVerified);
              
              if (isVerified && !isEmailVerified && isMounted) {
                toast({
                  title: "Email Verified",
                  description: "Your email has been successfully verified."
                });
              }
              
              setUser({
                id: data.user.id,
                email: data.user.email || '',
                createdAt: new Date(data.user.created_at || Date.now()).toLocaleDateString()
              });
            }
          } catch (error) {
            console.error("Error getting user data after USER_UPDATED event:", error);
          }
        }
      }
    );

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [navigate, toast, isEmailVerified]);

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login?verified=true`
        }
      });
      
      if (error) {
        console.error("Sign up error:", error);
        
        if (error.message === "Failed to fetch") {
          toast({
            title: "Connection Error",
            description: "Unable to connect to the authentication service. Would you like to continue as a guest?",
            variant: "destructive",
            action: (
              <button 
                onClick={() => continueAsGuest()}
                className="bg-white text-destructive px-3 py-1 rounded-md text-xs font-medium"
              >
                Continue as Guest
              </button>
            )
          });
        } else {
          toast({
            title: "Sign Up Failed",
            description: error.message || "There was a problem signing up. Please try again.",
            variant: "destructive"
          });
        }
        
        return { error };
      }
      
      toast({
        title: "Sign Up Successful",
        description: "Please check your email for a confirmation link."
      });
      
      navigate("/verify-email", { state: { email } });
      return {};
    } catch (error: any) {
      console.error("Sign up error:", error);
      
      if (error.message === "Failed to fetch") {
        toast({
          title: "Connection Error",
          description: "Unable to connect to the authentication service. Would you like to continue as a guest?",
          variant: "destructive",
          action: (
            <button 
              onClick={() => continueAsGuest()}
              className="bg-white text-destructive px-3 py-1 rounded-md text-xs font-medium"
            >
              Continue as Guest
            </button>
          )
        });
      } else {
        toast({
          title: "Sign Up Failed",
          description: error.message || "There was a problem signing up. Please try again.",
          variant: "destructive"
        });
      }
      
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error("Sign in error:", error);
        
        if (error.message === "Failed to fetch") {
          toast({
            title: "Connection Error",
            description: "Unable to connect to the authentication service. Would you like to continue as a guest?",
            variant: "destructive",
            action: (
              <button 
                onClick={() => continueAsGuest()}
                className="bg-white text-destructive px-3 py-1 rounded-md text-xs font-medium"
              >
                Continue as Guest
              </button>
            )
          });
        } else {
          toast({
            title: "Sign In Failed",
            description: error.message || "Invalid email or password. Please try again.",
            variant: "destructive"
          });
        }
        
        return { error };
      }
      
      const isVerified = data.user.email_confirmed_at !== null;
      setIsEmailVerified(isVerified);
      
      if (!isVerified) {
        toast({
          title: "Email Not Verified",
          description: "Please check your email and verify your account before logging in.",
          variant: "destructive"
        });
        
        await supabase.auth.resend({
          type: 'signup',
          email
        });
        
        navigate("/verify-email", { state: { email } });
        return {};
      }
      
      setUser({
        id: data.user.id,
        email: data.user.email || '',
        createdAt: new Date(data.user.created_at || Date.now()).toLocaleDateString()
      });
      
      setIsAuthenticated(true);
      setIsOfflineMode(false);
      
      try {
        await associateGuestTripsWithUser(data.user.id);
      } catch (error) {
        console.error("Error associating guest trips:", error);
      }
      
      toast({
        title: "Sign In Successful",
        description: "Welcome back!"
      });
      
      navigate("/");
      return {};
    } catch (error: any) {
      console.error("Sign in error:", error);
      
      if (error.message === "Failed to fetch") {
        toast({
          title: "Connection Error",
          description: "Unable to connect to the authentication service. Would you like to continue as a guest?",
          variant: "destructive",
          action: (
            <button 
              onClick={() => continueAsGuest()}
              className="bg-white text-destructive px-3 py-1 rounded-md text-xs font-medium"
            >
              Continue as Guest
            </button>
          )
        });
      } else {
        toast({
          title: "Sign In Failed",
          description: error.message || "Invalid email or password. Please try again.",
          variant: "destructive"
        });
      }
      
      return { error };
    }
  };

  const continueAsGuest = async () => {
    try {
      setIsLoading(true);
      
      const mockUser: User = {
        id: `offline-${Math.random().toString(36).substring(2)}`,
        email: 'guest@nomad.camp',
        createdAt: new Date().toLocaleDateString()
      };
      
      localStorage.setItem('offline_user', JSON.stringify(mockUser));
      
      setUser(mockUser);
      setIsAuthenticated(true);
      setIsEmailVerified(true);
      setIsOfflineMode(true);
      
      toast({
        title: "Guest Mode Activated",
        description: "You're now browsing as a guest. Some features may be limited."
      });
      
      navigate("/");
    } catch (error) {
      console.error("Error in guest mode:", error);
      toast({
        title: "Error",
        description: "There was a problem activating guest mode.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      if (isOfflineMode) {
        localStorage.removeItem('offline_user');
        
        setUser(null);
        setIsAuthenticated(false);
        setIsEmailVerified(false);
        setIsOfflineMode(false);
        
        toast({
          title: "Signed Out",
          description: "You have been successfully signed out from guest mode."
        });
        
        navigate("/login");
        return;
      }
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setIsAuthenticated(false);
      setIsEmailVerified(false);
      
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out."
      });
      
      navigate("/login");
    } catch (error: any) {
      console.error("Sign out error:", error);
      toast({
        title: "Sign Out Failed",
        description: error.message || "There was a problem signing out. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        isEmailVerified,
        isOfflineMode,
        signUp,
        signIn,
        signOut,
        continueAsGuest
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};


import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

// Check if a user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session !== null;
  } catch (error) {
    console.error('Error checking authentication status:', error);
    return false;
  }
};

// Get the current user ID
export const getCurrentUserId = async (): Promise<string | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id || null;
  } catch (error) {
    console.error('Error getting current user ID:', error);
    return null;
  }
};

// Get the current user object
export const getCurrentUser = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Function to ensure a user is authenticated before performing an action
export const ensureAuthenticated = async (): Promise<string> => {
  const isAuth = await isAuthenticated();
  if (!isAuth) {
    throw new Error('Authentication required');
  }
  
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error('User ID not available');
  }
  
  return userId;
};

// Sign up with email and password
export const signUp = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error during sign up:', error);
    throw error;
  }
};

// Sign in with email and password
export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error during sign in:', error);
    throw error;
  }
};

// Sign out
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error('Error during sign out:', error);
    throw error;
  }
};

// Reset password
export const resetPassword = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) throw error;
  } catch (error) {
    console.error('Error sending reset password email:', error);
    throw error;
  }
};

// Update password
export const updatePassword = async (newPassword: string) => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    
    if (error) throw error;
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  }
};

// Hook for handling auth operations with toast notifications
export const useAuth = () => {
  const { toast } = useToast();
  
  const handleSignIn = async (email: string, password: string) => {
    try {
      const data = await signIn(email, password);
      toast({
        title: "Signed in successfully",
        description: "Welcome back!",
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  const handleSignUp = async (email: string, password: string) => {
    try {
      const data = await signUp(email, password);
      toast({
        title: "Signed up successfully",
        description: "Please check your email for verification.",
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message || "Please try again with a different email.",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been logged out.",
      });
    } catch (error: any) {
      toast({
        title: "Sign out failed",
        description: error.message || "An error occurred while signing out.",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  const handleResetPassword = async (email: string) => {
    try {
      await resetPassword(email);
      toast({
        title: "Reset email sent",
        description: "Please check your email for password reset instructions.",
      });
    } catch (error: any) {
      toast({
        title: "Reset failed",
        description: error.message || "An error occurred while sending reset email.",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  const handleUpdatePassword = async (newPassword: string) => {
    try {
      await updatePassword(newPassword);
      toast({
        title: "Password updated",
        description: "Your password has been successfully updated.",
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "An error occurred while updating your password.",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  return {
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    resetPassword: handleResetPassword,
    updatePassword: handleUpdatePassword,
  };
};

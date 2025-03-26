
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/providers/AuthProvider";
import { LogIn, Lock, Mail, Shield, UserX, Wifi, WifiOff } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { checkSupabaseConnectivity } from "@/lib/auth";

const signUpSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

const SignUpPage = () => {
  const { signUp, continueAsGuest } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGuestLoading, setIsGuestLoading] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  
  // Check Supabase connectivity on component mount and when network status changes
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const isConnected = await checkSupabaseConnectivity();
        setIsOnline(isConnected);
        
        if (!isConnected) {
          setConnectionError(
            "We're having trouble connecting to our servers. You can continue as a guest or try again later."
          );
        } else {
          setConnectionError(null);
        }
      } catch (error) {
        console.error("Connection check error:", error);
        setIsOnline(false);
        setConnectionError(
          "We're having trouble connecting to our servers. You can continue as a guest or try again later."
        );
      }
    };
    
    // Check connection initially
    checkConnection();
    
    // Also set up listeners for online/offline status
    const handleOnline = () => {
      console.log("Browser reports online status");
      checkConnection();
    };
    
    const handleOffline = () => {
      console.log("Browser reports offline status");
      setIsOnline(false);
      setConnectionError(
        "Your device appears to be offline. You can continue as a guest or try again when you're back online."
      );
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: SignUpFormValues) => {
    setIsSubmitting(true);
    try {
      if (!isOnline) {
        setConnectionError("You appear to be offline. Please continue as a guest or try again when you're back online.");
        return;
      }
      
      const result = await signUp(data.email, data.password);
      if (result?.error) {
        if (result.error.message === "Failed to fetch" || 
            result.error.message?.includes("network") ||
            result.error.message?.includes("abort") ||
            result.error.code === "NETWORK_ERROR" ||
            result.error.status === 0) {
          setConnectionError("Unable to connect to the authentication service. You can continue as a guest or try again later.");
          setIsOnline(false);
        } else {
          setConnectionError(result.error.message || "An error occurred during sign up.");
        }
      }
    } catch (error: any) {
      console.error("Sign up error:", error);
      if (error.message === "Failed to fetch" || 
          error.message?.includes("network") ||
          error.message?.includes("abort") ||
          error.code === "NETWORK_ERROR" ||
          error.status === 0) {
        setConnectionError("Unable to connect to the authentication service. You can continue as a guest or try again later.");
        setIsOnline(false);
      } else {
        setConnectionError(error.message || "An unexpected error occurred.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuestAccess = async () => {
    setIsGuestLoading(true);
    try {
      await continueAsGuest();
    } catch (error) {
      console.error("Error continuing as guest:", error);
      setConnectionError("Failed to set up guest access. Please try again.");
    } finally {
      setIsGuestLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create an Account</CardTitle>
          <CardDescription className="text-center">
            Enter your details to create a new account
            {isOnline !== null && (
              <div className="flex justify-center mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {isOnline ? (
                    <>
                      <Wifi className="w-3 h-3 mr-1" />
                      Connected
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3 h-3 mr-1" />
                      Offline Mode
                    </>
                  )}
                </span>
              </div>
            )}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {connectionError && (
            <Alert className="mb-6 bg-red-50 border-red-200">
              <AlertDescription className="text-red-700 flex flex-col space-y-2">
                <p>{connectionError}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="self-start border-red-300 text-red-700 hover:bg-red-50"
                  onClick={handleGuestAccess}
                >
                  Continue as Guest
                </Button>
              </AlertDescription>
            </Alert>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <Input 
                          placeholder="email@example.com" 
                          className="pl-10" 
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <Input 
                          type="password" 
                          placeholder="••••••••" 
                          className="pl-10" 
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Shield className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <Input 
                          type="password" 
                          placeholder="••••••••" 
                          className="pl-10" 
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting || isOnline === false}
              >
                {isSubmitting ? "Creating account..." : "Sign Up"}
                {!isSubmitting && <LogIn className="ml-2 h-4 w-4" />}
              </Button>
            </form>
          </Form>

          <div className="mt-6">
            <Separator className="my-4">
              <span className="px-2 text-xs text-muted-foreground">OR</span>
            </Separator>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleGuestAccess}
              disabled={isGuestLoading}
            >
              {isGuestLoading ? "Setting up guest access..." : "Continue as Guest"}
              {!isGuestLoading && <UserX className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-center text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary underline hover:text-primary/80">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SignUpPage;

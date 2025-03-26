
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/providers/AuthProvider";
import { LogOut, Mail, Shield, AlertTriangle } from "lucide-react";

const ProfilePage = () => {
  const { user, isEmailVerified, signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="container max-w-xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your account details and status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <span>{user?.email}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Shield className={`h-5 w-5 ${isEmailVerified ? "text-green-500" : "text-amber-500"}`} />
            <span>
              {isEmailVerified 
                ? "Email verified" 
                : "Email not verified"}
            </span>
          </div>
          
          {!isEmailVerified && (
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Your email is not verified. Some features will be limited until you verify your email.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="text-sm text-muted-foreground">
            Account created: {user?.createdAt}
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            variant="outline" 
            onClick={handleSignOut}
            disabled={isLoggingOut}
            className="w-full"
          >
            {isLoggingOut ? "Signing out..." : "Sign Out"}
            {!isLoggingOut && <LogOut className="ml-2 h-4 w-4" />}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ProfilePage;

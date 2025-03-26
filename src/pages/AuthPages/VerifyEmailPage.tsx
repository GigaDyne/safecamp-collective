
import { useLocation, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useState } from "react";

const VerifyEmailPage = () => {
  const location = useLocation();
  const email = location.state?.email || "your email";
  const [resendingEmail, setResendingEmail] = useState(false);
  const [emailResent, setEmailResent] = useState(false);

  const handleResendEmail = async () => {
    setResendingEmail(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      
      if (error) throw error;
      
      setEmailResent(true);
    } catch (error) {
      console.error("Error resending verification email:", error);
    } finally {
      setResendingEmail(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <Mail className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Verify Your Email</CardTitle>
          <CardDescription className="text-center">
            We've sent a verification link to<br />
            <span className="font-medium text-primary">{email}</span>
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-center text-muted-foreground">
            <p>Check your email inbox and click the verification link to complete your registration.</p>
          </div>
          
          {emailResent && (
            <Alert className="bg-green-50 border-green-200">
              <AlertDescription className="text-green-700">
                A new verification email has been sent to {email}.
              </AlertDescription>
            </Alert>
          )}
          
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleResendEmail}
            disabled={resendingEmail || emailResent}
          >
            {resendingEmail ? "Sending..." : emailResent ? "Email Sent" : "Resend Verification Email"}
            {!resendingEmail && !emailResent && <RefreshCw className="ml-2 h-4 w-4" />}
          </Button>
        </CardContent>
        
        <CardFooter className="flex justify-center">
          <div className="text-sm text-center text-muted-foreground">
            <Link to="/login" className="text-primary underline hover:text-primary/80">
              Return to login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default VerifyEmailPage;

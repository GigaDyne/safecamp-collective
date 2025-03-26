
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { verifyPaymentSuccess } from "@/lib/community/payment";
import { useToast } from "@/hooks/use-toast";

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const sessionId = searchParams.get("session_id");
  const [loading, setLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<{
    type: string;
    amount: string;
  } | null>(null);

  // Verify the payment session with Stripe through our edge function
  useEffect(() => {
    const verifyPayment = async () => {
      try {
        if (!sessionId) {
          setLoading(false);
          return;
        }
        
        const result = await verifyPaymentSuccess(sessionId);
        
        if (result.success) {
          setPaymentDetails({
            type: result.type || "payment",
            amount: result.amount || "$0.00"
          });
          
          toast({
            title: "Payment successful!",
            description: `Your ${result.type || "payment"} has been processed.`,
          });
        } else {
          toast({
            title: "Payment verification failed",
            description: "We couldn't verify your payment. Please contact support.",
            variant: "destructive",
          });
        }
        setLoading(false);
      } catch (error) {
        console.error("Error verifying payment:", error);
        toast({
          title: "Error",
          description: "There was a problem verifying your payment. Please contact support.",
          variant: "destructive",
        });
        setLoading(false);
      }
    };

    if (sessionId) {
      verifyPayment();
    } else {
      navigate("/");
    }
  }, [sessionId, navigate, toast]);

  const handleContinue = () => {
    navigate("/profile");
  };

  const handleViewHelpRequests = () => {
    navigate("/community-help");
  };

  if (loading) {
    return (
      <div className="container max-w-md mx-auto py-16 px-4 text-center">
        <Card>
          <CardHeader>
            <CardTitle>Processing Payment</CardTitle>
            <CardDescription>
              Please wait while we verify your payment...
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto py-16 px-4">
      <Card>
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-center">Payment Successful!</CardTitle>
          <CardDescription className="text-center">
            Thank you for your {paymentDetails?.type || "payment"}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-6">
          <p className="text-2xl font-bold mb-2">{paymentDetails?.amount}</p>
          <p className="text-muted-foreground">
            {paymentDetails?.type === "subscription" 
              ? "Your subscription has been activated." 
              : paymentDetails?.type === "donation"
                ? "Your donation has been processed. Thank you for your generosity!" 
                : "Your purchase has been completed."}
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button className="w-full" onClick={handleContinue}>
            Continue to Profile
          </Button>
          {paymentDetails?.type === "donation" && (
            <Button variant="outline" className="w-full" onClick={handleViewHelpRequests}>
              View Help Requests
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

export default PaymentSuccessPage;

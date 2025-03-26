
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [loading, setLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<{
    type: string;
    amount: string;
  } | null>(null);

  // In a real app, we would verify the session with Stripe
  useEffect(() => {
    // Simulate payment verification
    const verifyPayment = async () => {
      try {
        // Placeholder for actual Stripe session verification
        setLoading(false);
        setPaymentDetails({
          type: "subscription", // or "donation" or "premium_campsite"
          amount: "$5.99"
        });
      } catch (error) {
        console.error("Error verifying payment:", error);
        setLoading(false);
      }
    };

    if (sessionId) {
      verifyPayment();
    } else {
      navigate("/");
    }
  }, [sessionId, navigate]);

  const handleContinue = () => {
    navigate("/profile");
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
                ? "Your donation has been processed." 
                : "Your purchase has been completed."}
          </p>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleContinue}>
            Continue to Profile
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PaymentSuccessPage;

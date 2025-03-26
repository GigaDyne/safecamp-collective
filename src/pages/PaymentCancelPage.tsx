
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

const PaymentCancelPage = () => {
  const navigate = useNavigate();

  const handleTryAgain = () => {
    navigate(-1); // Go back to previous page
  };

  const handleReturnToProfile = () => {
    navigate("/profile");
  };

  return (
    <div className="container max-w-md mx-auto py-16 px-4">
      <Card>
        <CardHeader>
          <div className="flex justify-center mb-4">
            <XCircle className="h-16 w-16 text-destructive" />
          </div>
          <CardTitle className="text-center">Payment Cancelled</CardTitle>
          <CardDescription className="text-center">
            Your payment was not processed.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-6">
          <p className="text-muted-foreground">
            You have cancelled the payment process. If you encountered any issues, please try again or contact support.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button className="w-full" onClick={handleTryAgain}>
            Try Again
          </Button>
          <Button variant="outline" className="w-full" onClick={handleReturnToProfile}>
            Return to Profile
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PaymentCancelPage;

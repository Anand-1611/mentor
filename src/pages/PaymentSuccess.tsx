import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    // Optional: Verify payment status with backend
    if (sessionId) {
      console.log("Payment successful for session:", sessionId);
    }
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-8 px-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">
            Your payment has been processed successfully. Your purchased note is being prepared for download.
          </p>
          <p className="text-sm text-muted-foreground">
            The watermarked PDF will be available in your purchases within a few moments.
          </p>
          <div className="flex flex-col gap-3 pt-4">
            <Button
              onClick={() => navigate("/my-purchases")}
              className="bg-accent hover:bg-accent/90"
            >
              View My Purchases
            </Button>
            <Button
              onClick={() => navigate("/notes")}
              variant="outline"
            >
              Browse More Notes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;

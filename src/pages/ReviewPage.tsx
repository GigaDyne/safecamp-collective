
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReviewForm from "@/components/reviews/ReviewForm";
import { useCampSites } from "@/hooks/useCampSites";
import { useToast } from "@/hooks/use-toast";

const ReviewPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { campSites } = useCampSites();
  const { toast } = useToast();
  
  // Find the campsite
  const site = campSites?.find(site => site.id === id);
  
  // Handle navigation back to site details
  const handleBackClick = () => {
    navigate(`/site/${id}`);
  };
  
  // Handle successful review submission
  const handleReviewSuccess = () => {
    toast({
      title: "Review Submitted",
      description: "Thank you for your feedback! It will help other campers.",
    });
    navigate(`/site/${id}`);
  };
  
  if (!site) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <p>Campsite not found</p>
        <Button onClick={handleBackClick} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Top navigation */}
      <div className="sticky top-0 z-10 flex items-center h-16 px-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBackClick}
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-medium">Add Review</h1>
      </div>
      
      {/* Form */}
      <div className="flex-1 overflow-hidden">
        <ReviewForm 
          siteId={site.id} 
          siteName={site.name} 
          onSuccess={handleReviewSuccess}
        />
      </div>
    </div>
  );
};

export default ReviewPage;

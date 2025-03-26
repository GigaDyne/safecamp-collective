
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const AddSiteButton = () => {
  const navigate = useNavigate();
  
  return (
    <div className="absolute bottom-24 right-4 z-10">
      <Button 
        variant="default"
        size="icon"
        className="h-14 w-14 rounded-full shadow-lg animate-fade-in"
        onClick={() => navigate('/add-site')}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default AddSiteButton;


import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Camera, 
  MapPin, 
  Wifi, 
  Volume2, 
  Shield,
  Upload,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const MAX_IMAGES = 3;

const AddSitePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [siteName, setSiteName] = useState("");
  const [description, setDescription] = useState("");
  const [landType, setLandType] = useState("");
  const [safetyRating, setSafetyRating] = useState([3]);
  const [cellSignal, setCellSignal] = useState([3]);
  const [accessibility, setAccessibility] = useState([3]);
  const [quietness, setQuietness] = useState([3]);
  
  const handleAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    
    if (images.length >= MAX_IMAGES) {
      toast({
        title: "Maximum images reached",
        description: `You can upload a maximum of ${MAX_IMAGES} images per site.`,
        variant: "destructive",
      });
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target && typeof event.target.result === "string") {
        setImages([...images, event.target.result]);
      }
    };
    reader.readAsDataURL(file);
  };
  
  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!siteName) {
      toast({
        title: "Missing information",
        description: "Please provide a site name.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API request
    setTimeout(() => {
      toast({
        title: "Campsite added!",
        description: "Your campsite has been added successfully.",
      });
      navigate("/");
    }, 1500);
  };
  
  return (
    <div className="flex flex-col h-full bg-background animate-fade-in">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md">
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 mr-2"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-medium">Add New Campsite</h1>
          </div>
          
          <Button 
            variant="default"
            disabled={isSubmitting || !siteName}
            onClick={handleSubmit}
          >
            {isSubmitting ? "Submitting..." : "Save"}
          </Button>
        </div>
      </div>
      
      {/* Form */}
      <div className="flex-1 overflow-auto p-4 pb-20 no-scrollbar">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Image Upload */}
          <div className="space-y-2">
            <Label className="text-base">Photos ({images.length}/{MAX_IMAGES})</Label>
            
            <div className="flex gap-3">
              {/* Image previews */}
              {images.map((image, index) => (
                <div key={index} className="relative w-20 h-20 rounded-md overflow-hidden">
                  <img src={image} alt={`Upload ${index}`} className="w-full h-full object-cover" />
                  <button
                    className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white"
                    onClick={() => removeImage(index)}
                    type="button"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              
              {/* Add image button */}
              {images.length < MAX_IMAGES && (
                <div className="w-20 h-20 relative">
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleAddImage}
                  />
                  <div className="w-full h-full border-2 border-dashed border-border rounded-md flex flex-col items-center justify-center p-2">
                    <Camera className="h-6 w-6 text-muted-foreground mb-1" />
                    <span className="text-xs text-muted-foreground text-center">Add Photo</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Site Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="site-name" className="text-base">Site Name*</Label>
              <Input
                id="site-name"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                placeholder="Give this camp spot a name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description" className="text-base">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe this camp spot (terrain, views, tips, etc.)"
                className="min-h-[100px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="land-type" className="text-base">Land Type</Label>
              <Select value={landType} onValueChange={setLandType}>
                <SelectTrigger id="land-type">
                  <SelectValue placeholder="Select land ownership" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blm">BLM Land</SelectItem>
                  <SelectItem value="usfs">National Forest (USFS)</SelectItem>
                  <SelectItem value="state">State Land</SelectItem>
                  <SelectItem value="county">County Land</SelectItem>
                  <SelectItem value="other">Other Public Land</SelectItem>
                  <SelectItem value="private">Private (with permission)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Ratings */}
          <div className="space-y-4">
            <h2 className="text-base font-medium">Site Ratings</h2>
            
            {/* Safety Rating */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-safe" />
                  Safety Rating
                </Label>
                <span className="text-sm text-muted-foreground">{safetyRating[0]}/5</span>
              </div>
              <Slider
                defaultValue={[3]}
                max={5}
                step={1}
                value={safetyRating}
                onValueChange={setSafetyRating}
              />
            </div>
            
            {/* Cell Signal */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="flex items-center">
                  <Wifi className="h-4 w-4 mr-2 text-primary" />
                  Cell Signal
                </Label>
                <span className="text-sm text-muted-foreground">{cellSignal[0]}/5</span>
              </div>
              <Slider
                defaultValue={[3]}
                max={5}
                step={1}
                value={cellSignal}
                onValueChange={setCellSignal}
              />
            </div>
            
            {/* Accessibility */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-primary" />
                  Accessibility
                </Label>
                <span className="text-sm text-muted-foreground">{accessibility[0]}/5</span>
              </div>
              <Slider
                defaultValue={[3]}
                max={5}
                step={1}
                value={accessibility}
                onValueChange={setAccessibility}
              />
            </div>
            
            {/* Quietness */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="flex items-center">
                  <Volume2 className="h-4 w-4 mr-2 text-primary" />
                  Quietness
                </Label>
                <span className="text-sm text-muted-foreground">{quietness[0]}/5</span>
              </div>
              <Slider
                defaultValue={[3]}
                max={5}
                step={1}
                value={quietness}
                onValueChange={setQuietness}
              />
            </div>
          </div>
          
          {/* Current Location */}
          <div className="bg-secondary/50 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-primary" />
              <div>
                <p className="text-sm font-medium">Current Location</p>
                <p className="text-xs text-muted-foreground">Using GPS coordinates</p>
              </div>
            </div>
            
            <Button variant="outline" size="sm" className="h-8">
              Adjust
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AddSitePage;

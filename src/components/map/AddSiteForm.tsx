
import { useState, useEffect } from "react";
import { useLocation } from "@/hooks/useLocation";
import { useForm } from "react-hook-form";
import { 
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Camera, MapPin, Wifi, Volume2, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { v4 as uuidv4 } from 'uuid';

// Define form schema using Zod
const formSchema = z.object({
  name: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
  description: z.string().optional(),
  safetyRating: z.number().min(1).max(5),
  cellSignal: z.number().min(1).max(5),
  noiseLevel: z.number().min(1).max(5),
  isRemote: z.boolean().default(false),
  hasWater: z.boolean().default(false),
  hasRestrooms: z.boolean().default(false),
  isFreeToStay: z.boolean().default(true),
  comments: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddSiteFormProps {
  onSubmit: (data: FormValues & { id: string, images: string[] }) => void;
  onCancel: () => void;
  initialLocation?: {
    latitude: number;
    longitude: number;
  };
}

const MAX_IMAGES = 3;

const AddSiteForm = ({ onSubmit, onCancel, initialLocation }: AddSiteFormProps) => {
  const { location: userLocation, error, isLoading } = useLocation();
  const [images, setImages] = useState<string[]>([]);
  const { toast } = useToast();
  
  // Use provided location or fall back to user's current location
  const location = initialLocation || userLocation;
  
  const form = useForm<FormValues>({
    defaultValues: {
      name: "",
      latitude: location?.latitude || 0,
      longitude: location?.longitude || 0,
      description: "",
      safetyRating: 3,
      cellSignal: 3,
      noiseLevel: 3,
      isRemote: false,
      hasWater: false,
      hasRestrooms: false,
      isFreeToStay: true,
      comments: "",
    },
  });
  
  // Update coordinates when location changes
  useEffect(() => {
    if (location) {
      form.setValue("latitude", location.latitude);
      form.setValue("longitude", location.longitude);
    }
  }, [location, form]);
  
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
  
  const handleFormSubmit = (values: FormValues) => {
    if (isLoading) {
      toast({
        title: "Still getting your location",
        description: "Please wait until we get your location.",
        variant: "destructive",
      });
      return;
    }
    
    if (error) {
      toast({
        title: "Location error",
        description: error,
        variant: "destructive",
      });
      return;
    }
    
    // Generate a unique ID for the campsite
    const campsiteData = {
      ...values,
      id: uuidv4(),
      images,
    };
    
    onSubmit(campsiteData);
  };
  
  return (
    <div className="p-4 max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Add New Campsite</h2>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Image Upload */}
          <div className="space-y-2">
            <FormLabel>Photos ({images.length}/{MAX_IMAGES})</FormLabel>
            
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
          
          {/* Basic Info */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Campsite Name (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Give this spot a name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Brief Description (Optional)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="What's special about this spot?" 
                    className="max-h-32"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Location Display */}
          <div className="bg-secondary/50 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-primary" />
              <div>
                <p className="text-sm font-medium">Current Location</p>
                {location ? (
                  <p className="text-xs text-muted-foreground">
                    {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">{isLoading ? "Getting location..." : "Location unavailable"}</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Ratings */}
          <div className="space-y-4 pt-2">
            <h3 className="text-base font-medium">Site Ratings</h3>
            
            {/* Safety Rating */}
            <FormField
              control={form.control}
              name="safetyRating"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <div className="flex justify-between">
                    <FormLabel className="flex items-center">
                      <Shield className="h-4 w-4 mr-2 text-safe" />
                      Safety Rating
                    </FormLabel>
                    <span className="text-sm text-muted-foreground">{field.value}/5</span>
                  </div>
                  <FormControl>
                    <Slider
                      min={1}
                      max={5}
                      step={1}
                      onValueChange={(vals) => field.onChange(vals[0])}
                      value={[field.value]}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            {/* Cell Signal */}
            <FormField
              control={form.control}
              name="cellSignal"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <div className="flex justify-between">
                    <FormLabel className="flex items-center">
                      <Wifi className="h-4 w-4 mr-2 text-primary" />
                      Cell Signal
                    </FormLabel>
                    <span className="text-sm text-muted-foreground">{field.value}/5</span>
                  </div>
                  <FormControl>
                    <Slider
                      min={1}
                      max={5}
                      step={1}
                      onValueChange={(vals) => field.onChange(vals[0])}
                      value={[field.value]}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            {/* Noise Level */}
            <FormField
              control={form.control}
              name="noiseLevel"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <div className="flex justify-between">
                    <FormLabel className="flex items-center">
                      <Volume2 className="h-4 w-4 mr-2 text-primary" />
                      Quietness
                    </FormLabel>
                    <span className="text-sm text-muted-foreground">{field.value}/5</span>
                  </div>
                  <FormControl>
                    <Slider
                      min={1}
                      max={5}
                      step={1}
                      onValueChange={(vals) => field.onChange(vals[0])}
                      value={[field.value]}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          
          {/* Feature Tags */}
          <div className="space-y-3 pt-2">
            <h3 className="text-base font-medium">Features</h3>
            
            <div className="grid grid-cols-2 gap-2">
              <FormField
                control={form.control}
                name="isRemote"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox 
                        checked={field.value} 
                        onCheckedChange={field.onChange} 
                      />
                    </FormControl>
                    <FormLabel className="text-sm">Remote</FormLabel>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="hasWater"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox 
                        checked={field.value} 
                        onCheckedChange={field.onChange} 
                      />
                    </FormControl>
                    <FormLabel className="text-sm">Water Source</FormLabel>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="hasRestrooms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox 
                        checked={field.value} 
                        onCheckedChange={field.onChange} 
                      />
                    </FormControl>
                    <FormLabel className="text-sm">Restrooms</FormLabel>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="isFreeToStay"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox 
                        checked={field.value} 
                        onCheckedChange={field.onChange} 
                      />
                    </FormControl>
                    <FormLabel className="text-sm">Free to Stay</FormLabel>
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          {/* Comments */}
          <FormField
            control={form.control}
            name="comments"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Comments (Optional)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Any other details about this campsite?" 
                    className="max-h-32"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Submit Button */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              Submit
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AddSiteForm;

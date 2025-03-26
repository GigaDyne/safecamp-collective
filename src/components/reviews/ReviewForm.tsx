
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import { Star, Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useCampSiteReviews } from "@/hooks/useCampSites";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/lib/supabase";

// Form schema
const reviewSchema = z.object({
  safetyRating: z.string().min(1, "Please rate your safety experience"),
  cellSignal: z.string().min(1, "Please rate the cell signal"),
  noiseLevel: z.string().min(1, "Please rate the noise level"),
  comment: z.string().min(10, "Please provide a comment of at least 10 characters"),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  siteId: string;
  siteName: string;
  onSuccess?: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ siteId, siteName, onSuccess }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const { addReview, isAddingReview } = useCampSiteReviews(siteId);
  
  // Initialize form
  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      safetyRating: "3",
      cellSignal: "3",
      noiseLevel: "3",
      comment: "",
    },
  });

  // Function to render stars for ratings
  const renderStarRating = (name: "safetyRating" | "cellSignal" | "noiseLevel", label: string) => {
    return (
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <FormItem className="space-y-1">
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex space-x-1"
              >
                {[1, 2, 3, 4, 5].map((rating) => (
                  <div 
                    key={rating} 
                    className="flex flex-col items-center"
                  >
                    <RadioGroupItem
                      value={rating.toString()}
                      id={`${name}-${rating}`}
                      className="sr-only"
                    />
                    <label
                      htmlFor={`${name}-${rating}`}
                      className={`cursor-pointer p-1 rounded-full transition-colors hover:text-primary ${
                        parseInt(field.value) >= rating ? "text-yellow-500" : "text-muted-foreground"
                      }`}
                    >
                      <Star 
                        className="h-6 w-6" 
                        fill={parseInt(field.value) >= rating ? "currentColor" : "none"}
                      />
                    </label>
                    <span className="text-xs mt-1">{rating}</span>
                  </div>
                ))}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  // Upload image to Supabase Storage
  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      // Validate file type
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      if (!fileExt || !['jpg', 'jpeg', 'png'].includes(fileExt)) {
        toast({
          title: "Invalid File Type",
          description: "Only JPEG and PNG images are allowed.",
          variant: "destructive",
        });
        return null;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Images must be less than 5MB.",
          variant: "destructive",
        });
        return null;
      }
      
      const fileId = uuidv4();
      const filePath = `${siteId}/${fileId}.${fileExt}`;
      
      // Upload with progress tracking
      const { data, error } = await supabase.storage
        .from('review-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          onUploadProgress: (progress) => {
            const percent = Math.round((progress.loaded / progress.total) * 100);
            setUploadProgress(prev => ({...prev, [fileId]: percent}));
          }
        });
      
      if (error) throw error;
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('review-images')
        .getPublicUrl(filePath);
      
      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Limit to 3 images total
    if (images.length + files.length > 3) {
      toast({
        title: "Too Many Images",
        description: "You can upload a maximum of 3 images per review.",
        variant: "destructive",
      });
      return;
    }
    
    setUploading(true);
    
    try {
      // Upload each file to Supabase
      const uploadPromises = Array.from(files).map(uploadImage);
      const uploadedUrls = await Promise.all(uploadPromises);
      
      // Filter out any failed uploads
      const validUrls = uploadedUrls.filter(url => url !== null) as string[];
      
      setImages(prev => [...prev, ...validUrls]);
    } catch (error) {
      console.error('Error uploading images:', error);
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  };

  // Remove an image
  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // Submit the form
  const onSubmit = (values: ReviewFormValues) => {
    // Create the review object
    const review = {
      siteId,
      userId: "user-" + Date.now(), // In a real app, this would be the actual user ID
      userName: "Anonymous User", // In a real app, this would be the actual username
      safetyRating: parseInt(values.safetyRating),
      cellSignal: parseInt(values.cellSignal),
      noiseLevel: parseInt(values.noiseLevel),
      comment: values.comment,
      images: images.length > 0 ? images : undefined,
    };

    // Save the review using our custom hook
    addReview(review, {
      onSuccess: () => {
        // Call the success callback or navigate back
        if (onSuccess) {
          onSuccess();
        } else {
          navigate(`/site/${siteId}`);
        }
      }
    });
  };

  return (
    <ScrollArea className="h-[80vh] px-4 pt-4">
      <div className="space-y-4 pb-20">
        <div>
          <h1 className="text-2xl font-bold">Review {siteName}</h1>
          <p className="text-muted-foreground">Share your experience to help others</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Safety Rating */}
            {renderStarRating("safetyRating", "How safe did you feel at this site?")}
            
            {/* Cell Signal */}
            {renderStarRating("cellSignal", "How was the cell signal?")}
            
            {/* Noise Level */}
            {renderStarRating("noiseLevel", "How quiet was this location?")}
            
            {/* Comments */}
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your review</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Share your experience at this campsite..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Image Upload */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium">Add photos (optional)</p>
                <p className="text-xs text-muted-foreground">Max 3 photos, JPEG/PNG (5MB max)</p>
              </div>
              
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, index) => (
                  <div 
                    key={index} 
                    className="relative rounded-md overflow-hidden aspect-square bg-muted"
                  >
                    <img src={img} alt="Upload preview" className="object-cover w-full h-full" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 rounded-full"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                
                {images.length < 3 && (
                  <label className={`flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/20 rounded-md aspect-square cursor-pointer hover:bg-muted/50 transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <input
                      type="file"
                      accept="image/jpeg,image/png"
                      multiple
                      className="sr-only"
                      onChange={handleImageUpload}
                      disabled={uploading || images.length >= 3}
                    />
                    {uploading ? (
                      <div className="animate-pulse text-center">
                        <span className="text-xs text-muted-foreground">Uploading...</span>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="h-6 w-6 mb-1 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Add Photos</span>
                      </>
                    )}
                  </label>
                )}
              </div>
            </div>
            
            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full"
              disabled={isAddingReview || uploading}
            >
              {isAddingReview ? "Submitting..." : "Submit Review"}
            </Button>
          </form>
        </Form>
      </div>
    </ScrollArea>
  );
};

export default ReviewForm;

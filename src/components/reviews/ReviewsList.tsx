
import React, { useState } from "react";
import { Calendar, Star, Image as ImageIcon } from "lucide-react";
import { Review } from "@/hooks/useCampSites";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ReviewsListProps {
  reviews: Review[];
  averageSafety: number;
  onAddReview: () => void;
}

const ReviewsList: React.FC<ReviewsListProps> = ({ 
  reviews, 
  averageSafety,
  onAddReview 
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Function to determine safety class based on rating
  const getSafetyClass = (rating: number) => {
    if (rating >= 4) return "bg-green-500 text-white";
    if (rating >= 2.5) return "bg-yellow-500 text-white";
    return "bg-red-500 text-white";
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };
  
  // Open image in full screen
  const openImageViewer = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* Image Viewer Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-[90vw] h-[80vh] p-0 bg-transparent border-none">
          <div className="relative h-full w-full flex items-center justify-center bg-black/90 rounded-lg overflow-hidden">
            {selectedImage && (
              <img 
                src={selectedImage} 
                alt="Review" 
                className="max-h-full max-w-full object-contain"
              />
            )}
            <DialogClose className="absolute top-2 right-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-black/50 text-white">
                <span className="sr-only">Close</span>
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Reviews Summary */}
      <motion.div variants={itemVariants} className="bg-secondary/50 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xl font-bold">{averageSafety.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">
              Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
            </p>
          </div>
          
          <button 
            className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium"
            onClick={onAddReview}
          >
            Add Review
          </button>
        </div>
      </motion.div>
      
      {/* Empty state */}
      {reviews.length === 0 && (
        <motion.div 
          variants={itemVariants}
          className="text-center py-8"
        >
          <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
        </motion.div>
      )}
      
      {/* Review List */}
      <div className="space-y-5">
        {reviews.map((review) => (
          <motion.div
            key={review.id}
            variants={itemVariants}
            className="bg-card/50 border border-border/50 rounded-lg p-4"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                  {review.userAvatar ? (
                    <img 
                      src={review.userAvatar} 
                      alt={review.userName} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-medium">
                      {review.userName.charAt(0)}
                    </span>
                  )}
                </div>
                
                <div>
                  <p className="font-medium leading-none mb-1">{review.userName}</p>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>{review.date}</span>
                  </div>
                </div>
              </div>
              
              <div className={`flex items-center safety-tag px-2.5 py-0.5 text-xs font-semibold rounded-full ${getSafetyClass(review.safetyRating)}`}>
                <span>{review.safetyRating.toFixed(1)}</span>
                <Star className="h-3 w-3 ml-0.5" fill="currentColor" />
              </div>
            </div>
            
            <p className="text-sm mt-3">{review.comment}</p>
            
            {/* Rating details */}
            <div className="flex gap-4 mt-2">
              <div className="text-xs flex items-center">
                <Star className="h-3 w-3 mr-1 text-yellow-500" fill="currentColor" />
                <span>Signal: {review.cellSignal}/5</span>
              </div>
              <div className="text-xs flex items-center">
                <Star className="h-3 w-3 mr-1 text-yellow-500" fill="currentColor" />
                <span>Quietness: {review.noiseLevel}/5</span>
              </div>
            </div>
            
            {/* Review images */}
            {review.images && review.images.length > 0 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                {review.images.map((image, idx) => (
                  <button 
                    key={idx} 
                    className="w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0 cursor-pointer transform hover:scale-105 transition-transform"
                    onClick={() => openImageViewer(image)}
                  >
                    <img 
                      src={image} 
                      alt={`Review photo ${idx+1}`} 
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default ReviewsList;

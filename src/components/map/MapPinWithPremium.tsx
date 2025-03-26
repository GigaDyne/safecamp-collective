
import { CampSite } from "@/lib/supabase";
import { Sparkles } from "lucide-react";

interface CreateMapPinWithPremiumProps {
  safetyRating: number;
  isPremium?: boolean;
  onClick: (e: MouseEvent) => void;
}

export const createMapPinWithPremium = ({ safetyRating, isPremium = false, onClick }: CreateMapPinWithPremiumProps) => {
  // Create the marker element
  const el = document.createElement("div");
  el.className = "marker-element relative";
  el.addEventListener("click", onClick);
  
  // Determine color based on safety rating
  let color = "bg-red-500";
  if (safetyRating >= 4) {
    color = "bg-green-500";
  } else if (safetyRating >= 3) {
    color = "bg-yellow-500";
  } else if (safetyRating >= 2) {
    color = "bg-orange-500";
  }
  
  // Create premium badge if applicable
  const premiumBadgeHtml = isPremium 
    ? `<div class="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center animate-pulse">
         <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="M12 3v5m0 12v-1M5.5 7.5l1 1M17.5 17.5l-1-1M7 16l-1.9 1.9M19 10h-5M3 10H2M17.5 7.5l1-1M10 3h4"/></svg>
       </div>` 
    : '';
  
  // Set inner HTML
  el.innerHTML = `
    <div class="relative">
      <div class="w-6 h-6 ${color} rounded-full flex items-center justify-center border-2 border-white shadow-md relative transform hover:scale-110 transition-transform duration-200">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-white">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </div>
      ${premiumBadgeHtml}
    </div>
  `;
  
  return el;
};

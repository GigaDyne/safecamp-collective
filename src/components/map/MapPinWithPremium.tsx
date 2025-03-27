import React from 'react';

export const createMapPinWithPremium = ({
  safetyRating = 3,
  isPremium = false,
  onClick,
}: {
  safetyRating?: number;
  isPremium?: boolean;
  onClick?: (e: MouseEvent) => void;
}) => {
  // Calculate color based on safety rating
  const getColor = () => {
    if (safetyRating <= 2) return "fill-red-500";
    if (safetyRating == 3) return "fill-yellow-500";
    return "fill-green-500";
  };

  // Create the pin element
  const el = document.createElement("div");
  el.className = "marker-element relative";
  
  // Create and set custom map pin HTML
  el.innerHTML = `
    <div class="cursor-pointer transition-all hover:scale-110 ${isPremium ? "scale-125" : ""} ${isPremium ? "drop-shadow-[0_0_8px_rgba(255,204,0,0.6)]" : ""}">
      <svg width="24" height="32" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0C5.383 0 0 5.109 0 11.6C0 18.4 12 32 12 32C12 32 24 18.4 24 11.6C24 5.109 18.617 0 12 0Z" class="${getColor()} stroke-white stroke-1"/>
        <circle cx="12" cy="11" r="4.5" class="fill-white"/>
      </svg>
      ${isPremium ? `<div class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 border border-white shadow"></div>` : ''}
    </div>
  `;

  // Add click handler
  if (onClick) {
    el.addEventListener("click", onClick);
  }

  return el;
};

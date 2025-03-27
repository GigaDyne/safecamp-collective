
import React from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface TripDistanceSliderProps {
  bufferDistance: number;
  setBufferDistance: (distance: number) => void;
}

const TripDistanceSlider: React.FC<TripDistanceSliderProps> = ({
  bufferDistance,
  setBufferDistance
}) => {
  return (
    <div className="space-y-2 mb-4">
      <div className="flex justify-between items-center">
        <Label>Search Distance: {bufferDistance} miles</Label>
      </div>
      <Slider
        value={[bufferDistance]}
        min={10}
        max={100}
        step={5}
        onValueChange={(values) => setBufferDistance(values[0])}
        className="w-full"
      />
    </div>
  );
};

export default TripDistanceSlider;

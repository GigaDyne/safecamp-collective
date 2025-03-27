
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface TripDistanceSliderProps {
  bufferDistance: number;
  setBufferDistance: (distance: number) => void;
}

const TripDistanceSlider = ({ 
  bufferDistance, 
  setBufferDistance 
}: TripDistanceSliderProps) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label htmlFor="buffer-distance">Search Distance: {bufferDistance} miles</Label>
      </div>
      <Slider 
        id="buffer-distance"
        min={5} 
        max={50} 
        step={5}
        value={[bufferDistance]}
        onValueChange={(value) => setBufferDistance(value[0])}
      />
    </div>
  );
};

export default TripDistanceSlider;

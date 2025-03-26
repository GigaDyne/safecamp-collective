
import React from "react";
import { CountyCrimeData } from "@/lib/trip-planner/crime-data-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface CrimeDataTooltipProps {
  data: CountyCrimeData;
}

const CrimeDataTooltip = ({ data }: CrimeDataTooltipProps) => {
  // Use the first year of crime stats
  const stats = data.crime_stats[0];
  
  const crimeCategories = [
    { name: "Violent Crime", value: stats.violent_crime, color: "bg-red-500" },
    { name: "Property Crime", value: stats.property_crime, color: "bg-orange-500" },
    { name: "Homicide", value: stats.homicide, color: "bg-red-700" },
    { name: "Robbery", value: stats.robbery, color: "bg-red-400" },
    { name: "Assault", value: stats.aggravated_assault, color: "bg-yellow-500" },
    { name: "Vehicle Theft", value: stats.motor_vehicle_theft, color: "bg-blue-500" },
  ];
  
  // Find the max value for scaling
  const maxValue = Math.max(...crimeCategories.map(c => c.value));
  
  return (
    <Card className="w-72 shadow-lg border-muted">
      <CardHeader className="py-3">
        <CardTitle className="text-base font-medium">
          {data.county_name}, {data.state_abbr}
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-3 pt-0">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-medium">Safety Score</span>
          <span 
            className={`text-sm font-bold px-2 py-0.5 rounded ${
              data.safety_score >= 80 ? "bg-green-100 text-green-800" :
              data.safety_score >= 60 ? "bg-yellow-100 text-yellow-800" :
              data.safety_score >= 40 ? "bg-orange-100 text-orange-800" :
              "bg-red-100 text-red-800"
            }`}
          >
            {data.safety_score}/100
          </span>
        </div>
        
        <div className="space-y-2">
          {crimeCategories.map((category, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-center">
              <span className="text-xs col-span-4">{category.name}</span>
              <Progress 
                value={(category.value / maxValue) * 100} 
                className={`h-2 col-span-6 ${category.color}`}
              />
              <span className="text-xs text-right col-span-2">{category.value}</span>
            </div>
          ))}
        </div>
        
        <div className="mt-3 text-xs text-muted-foreground">
          Data for {stats.year} • Click for details
        </div>
      </CardContent>
    </Card>
  );
};

export default CrimeDataTooltip;

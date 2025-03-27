
# Trip Planner Module

## Purpose
- Interactive route planning system for campers/travelers to plan safe and efficient trips between destinations
- Enables discovery of campsites and essential amenities along routes
- Provides crime data overlay for informed decision-making about stops

## Key Functionality
- Route planning between start and end points
- Discovery of campsites and amenities along routes
- Display of crime data overlay on map
- Trip saving and loading
- Itinerary management with stop sequencing
- Navigation assistance for active trips

## Components
- `TripPlannerPage`: Main page component orchestrating the trip planning experience
- `TripPlannerForm`: Form for inputting start/end locations and filter preferences
- `TripPlannerMap`: Interactive map display showing route, stops, and data overlays
- `TripItinerary`: UI for managing selected stops in a sequence
- `AvailableStop`: Component for displaying and selecting potential stops
- `TripNavigationMap`: Navigation-focused map view for active trips
- `SaveTripDialog`: Interface for saving planned trips
- `CrimeDataToggle`: Control for showing/hiding crime data overlay

## Related Supabase Tables
- `trips`: Stores saved trip plans including route data, stops, and metadata
  - Fields: id, owner_id, name, start_location, end_location, stops (jsonb), route_data (jsonb), created_at, updated_at, is_guest

## API Services
- `route-service.ts`: Core service for route planning and stop discovery
- `trip-storage.ts`: Handles saving/loading trips to/from Supabase and local storage

## Types
- `TripStop`: Represents a potential stop along a route
- `RouteData`: Contains route geometry, distance, and duration
- `SavedTrip`: Full trip object for storage
- `TripPlanRequest`: Parameters for planning a trip

## Known Issues & TODOs
- Refactor `route-service.ts` (539 lines) into smaller modules
- Refactor `trip-storage.ts` (232 lines) into smaller, focused files
- Improve error handling for offline/spotty connectivity
- Add support for multi-day trip planning with overnight stays
- Implement trip sharing functionality between users
- Optimize crime data loading for better performance

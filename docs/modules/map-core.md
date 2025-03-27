
# Map Core Module

## Purpose
- Provides the foundational map visualization layer for the entire application
- Manages map rendering, interaction, and integration with map providers (Google Maps, MapBox)
- Handles viewport-based data loading and visualization

## Key Functionality
- Base map display and rendering
- Map controls (zoom, pan, search)
- Dynamic loading of map data based on viewport
- Marker and popup management
- Context menu interactions
- Location search capabilities

## Components
- `MapView`: Root component that initializes map providers and context
- `GoogleMapComponent`: Implementation using Google Maps API
- `MapViewContainer`: Container that manages map state and data loading
- `MapControls`: UI controls for map interaction
- `MapActionButtons`: Floating action buttons for map-related actions
- `MapFilterDrawer`: Filtering interface for map data
- `AddSiteForm`: Form for adding new campsites to the map
- `MissingSitesDialog`: Interface for reporting missing sites

## Hooks
- `useGoogleMapInitializer`: Sets up Google Maps instance
- `useMapInitializer`: Generic map initialization
- `useMapMarkers`: Manages markers on the map
- `useMapPopup`: Handles popup display and content
- `useViewportCampsites`: Loads campsite data based on current map viewport

## Contexts
- `MapContext`: Provides map instance and related state
- `GoogleMapsContext`: Manages Google Maps API loading and instance
- `SearchContext`: Handles search functionality and state

## Related Supabase Tables
- `campsites`: Stores campsite data visualized on the map
  - Fields: id, name, description, latitude, longitude, location, safety_rating, etc.

## Known Issues & TODOs
- Standardize map provider interfaces for better interoperability
- Implement clustering for markers at lower zoom levels
- Add offline map caching for areas of interest
- Improve search performance for large datasets
- Enhance context menu with more interaction options
- Implement map style customization options

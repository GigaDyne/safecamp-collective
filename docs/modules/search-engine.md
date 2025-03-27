
# Search Engine Module

## Purpose
- Provides comprehensive search capabilities across the platform
- Enables discovery of campsites, users, and content
- Facilitates location-based searches and filtering

## Key Functionality
- Global search across multiple content types
- Location-based "search near here" functionality
- Autocomplete suggestions
- Filter-based refinement of results
- Context-aware search results
- Search history tracking

## Components
- `SearchBar`: Primary search input interface
- `SearchNearHere`: Location-based search tool
- `LocationAutocomplete`: Address/location autocomplete input
- `AddressAutocompleteInput`: Enhanced location input with suggestions

## Hooks
- Custom hooks for different search contexts
- Hooks for managing search state and history
- Geolocation hooks for location-based search

## Services
- Mapbox geocoding integration
- Full-text search implementation
- Location proximity calculation

## Related Supabase Tables
- Uses data from multiple tables:
  - `campsites`
  - `featured_campsites`
  - `premium_campsites`
  - `user_profiles`
  - `social_posts`

## Known Issues & TODOs
- Implement more advanced filtering options
- Add search result ranking and relevance scoring
- Improve search performance for large datasets
- Add search analytics to track popular queries
- Implement saved searches functionality
- Enhance location-based search with more context
- Add natural language processing for query understanding

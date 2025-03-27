

# Campsite Directory Module

## Purpose
- Central repository and browser for all campsites in the system
- Provides detailed information about each campsite
- Enables search, filtering, and discovery of campsites

## Key Functionality
- Browsing and searching campsites
- Detailed campsite information display
- Filtering campsites by various criteria
- Adding reviews and ratings
- Flagging inappropriate or incorrect listings
- Displaying premium campsite offerings

## Components
- `CampCard`: Card component displaying campsite summary information
- `CampSiteCard`: Detailed card with additional campsite information
- `CampSiteCardWithPremium`: Enhanced card showing premium features
- `PopularCampsites`: Showcase of popular or featured campsites
- `RecentCampsites`: Display of recently added or visited campsites
- `SelectedSiteInfo`: Detailed information panel for a selected campsite
- `SiteDetailPage`: Full page view of a single campsite

## Related Supabase Tables
- `campsites`: Primary table storing all campsite data
  - Fields: id, name, description, location, latitude, longitude, land_type, safety_rating, cell_signal, accessibility, quietness, features, images, etc.
- `featured_campsites`: Curated list of highlighted campsites
  - Fields: id, name, description, location, latitude, longitude, image_url, created_at
- `reviews`: User reviews for campsites
  - Fields: id, site_id, user_id, user_name, safety_rating, cell_signal, noise_level, comment, images, etc.
- `flags`: Reports of issues with campsite listings
  - Fields: id, site_id, user_id, reason, details, created_at

## Hooks
- `useCampSites`: Fetches and manages campsite data
- `useFeaturedCampsites`: Handles featured campsite data

## Known Issues & TODOs
- Implement more advanced filtering options (by amenities, land type)
- Add pagination for large result sets
- Implement sorting options (by rating, distance, etc.)
- Add map view integration within the directory
- Enhance review system with more detailed criteria
- Improve image gallery for campsite photos


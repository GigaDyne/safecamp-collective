
# Admin Utilities Module

## Purpose
- Provides tools and interfaces for platform administration
- Enables content moderation and curation
- Facilitates management of user-generated content

## Key Functionality
- Campsite curation and verification
- Flag and report management
- Content moderation tools
- Premium listing approval
- User management capabilities
- Platform statistics and metrics

## Components
- `FlagSiteDialog`: Interface for reporting problematic sites
- Admin-only components (not yet implemented):
  - Admin dashboard
  - Flag review interface
  - Content moderation tools
  - User management panel
  - Premium listing approval workflow

## Related Supabase Tables
- `flags`: Reports of problematic content
  - Fields: id, site_id, user_id, reason, details, created_at
- Access to all other tables for administrative purposes

## RLS Policies
- Special policies for admin users (to be implemented)
- Graduated access levels based on user roles

## Known Issues & TODOs
- Implement admin dashboard
- Create moderation queue for flagged content
- Add user role management
- Implement content approval workflows
- Add analytics and reporting tools
- Create audit logging for admin actions
- Implement bulk actions for efficient moderation


# Authentication & Profile Module

## Purpose
- Manages user authentication and account management
- Handles user profile data and preferences
- Controls privacy settings and user visibility

## Key Functionality
- User registration and login
- Profile creation and management
- Avatar and personal information management
- User privacy settings
- Account preferences
- Authentication state management

## Components
- `LoginPage`: User login interface
- `SignUpPage`: New user registration
- `VerifyEmailPage`: Email verification process
- `ProfilePage`: User profile management
- `ProfileTab`: Tab for displaying profile information
- `ProfileComments`: Display and management of profile comments
- `ProfileSummary`: Condensed view of user profile
- `ProtectedRoute`: Route protection for authenticated content

## Related Supabase Tables
- `user_profiles`: Stores extended user information
  - Fields: id, display_name, bio, avatar_url, created_at, updated_at, is_creator, stripe_customer_id, stripe_account_id
- `user_privacy_settings`: Stores user privacy preferences
  - Fields: id, profile_visibility, post_visibility, checkin_visibility, allow_messages, show_profile_comments, created_at, updated_at
- `profile_comments`: Comments left on user profiles
  - Fields: id, profile_id, commenter_id, content, created_at, updated_at

## Providers
- `AuthProvider`: Context provider for authentication state

## Hooks
- Custom authentication hooks for managing auth state
- Profile data fetching and management hooks

## Database Functions & Triggers
- `handle_new_user()`: Creates profile record on user creation
- `create_default_privacy_settings()`: Creates default privacy settings for new users

## Known Issues & TODOs
- Add social login options (Google, Facebook, etc.)
- Implement password reset functionality
- Add two-factor authentication option
- Improve profile customization options
- Enhance privacy controls with more granular settings
- Add account deletion functionality


# Social Module

## Purpose
- Enables social interaction between users
- Provides a platform for sharing experiences and content
- Facilitates community building around camping activities

## Key Functionality
- Social feed with various post types
- Friend connections and requests
- Check-ins at campsites
- Content creation and sharing
- Comments and reactions
- Post privacy settings

## Components
- `SocialFeedPage`: Main social feed interface
- `SocialPostCard`: Card displaying a social post
- `CreatePostForm`: Interface for creating new posts
- `PostCommentsList`: Display of comments on posts
- `PostDetailsDialog`: Detailed view of a post
- `CheckinButton`: Button for checking in at locations
- `FriendsPage`: Friend management interface
- `FriendRequestButton`: Button for sending friend requests
- `FriendRequestsButton`: Button showing pending requests

## Related Supabase Tables
- `social_posts`: Stores all social content
  - Fields: id, user_id, content, type, created_at, visibility, latitude, longitude, location_name, linked_campsite_id
- `post_comments`: Comments on social posts
  - Fields: id, post_id, user_id, content, created_at
- `post_likes`: Likes on social posts
  - Fields: id, post_id, user_id, created_at
- `user_friends`: Friend relationships between users
  - Fields: id, user_id, friend_id, status, created_at, updated_at

## Hooks
- `useSocialFeed`: Fetches and manages social feed data
- `usePostComments`: Handles post comment data
- `useFriends`: Manages friend relationships

## Database Functions
- `check_post_visibility()`: Controls access to posts based on privacy settings

## Known Issues & TODOs
- Implement rich media embedding in posts
- Add post categorization/tagging
- Enhance privacy controls for shared content
- Implement activity notifications
- Add content moderation features
- Create group/community functionality
- Optimize feed loading for performance

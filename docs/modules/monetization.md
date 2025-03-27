
# Monetization Module

## Purpose
- Facilitates various revenue streams within the platform
- Enables creators to monetize content and knowledge
- Provides community support mechanisms through donations

## Key Functionality
- Premium campsite listings
- Creator subscription plans
- Donation system for community support
- Payment processing integration
- Subscription management
- Revenue tracking and payouts

## Components
- `MonetizationSection`: Overview of monetization options
- `MonetizationCard`: Card displaying monetization methods
- `MonetizationTab`: Tab for managing monetization settings
- `PremiumCampsiteSection`: Display of premium campsites
- `PremiumCampsiteCard`: Card for premium campsite offerings
- `PremiumCampsiteForm`: Form for creating premium listings
- `AddPremiumCampsiteDialog`: Dialog for adding premium sites
- `CreatorProfilePage`: Profile page for creators
- `CreatorSubscriptions`: Management of subscription offerings
- `SubscriptionPlanForm`: Form for creating subscription plans
- `SubscriptionPlanCard`: Card displaying subscription plans
- `SubscriptionsTab`: Tab for managing subscriptions
- `DonationButton`: Button for making donations
- `CommunityHelpPage`: Page for community support requests

## Related Supabase Tables
- `premium_campsites`: Paid campsite listings
  - Fields: id, user_id, campsite_id, title, description, price, created_at, updated_at
- `subscription_plans`: Creator subscription offerings
  - Fields: id, creator_id, name, description, price, stripe_price_id, created_at, updated_at
- `user_subscriptions`: User subscription relationships
  - Fields: id, subscriber_id, creator_id, plan_id, stripe_subscription_id, status, current_period_start, current_period_end, created_at, updated_at
- `help_requests`: Community assistance requests
  - Fields: id, user_id, title, description, amount_requested, amount_received, location, is_active, created_at, updated_at
- `donations`: Record of donations made
  - Fields: id, donor_id, recipient_id, help_request_id, amount, message, stripe_payment_id, created_at

## Edge Functions
- `create-checkout-session`: Creates Stripe checkout sessions
- `check-subscription`: Verifies subscription status
- `cancel-subscription`: Handles subscription cancellations
- `reactivate-subscription`: Reactivates canceled subscriptions
- `stripe-webhook`: Processes Stripe webhook events
- `verify-payment-session`: Confirms payment completion

## Known Issues & TODOs
- Implement detailed analytics for creators
- Add tiered subscription options
- Create promotional tools for premium content
- Enhance payment method options
- Implement recurring donations
- Add tax handling for international creators
- Improve subscription management interface


# SafeCamp Module Documentation

This folder contains documentation for the main modules of the SafeCamp application. Each markdown file describes a specific module's purpose, functionality, components, and related database tables.

## Module Overview

- **[Trip Planner](trip-planner.md)**: Route planning and itinerary management for trips
- **[Map Core](map-core.md)**: Foundational map visualization and interaction
- **[Campsite Directory](campsite-directory.md)**: Browse, search, and view campsites
- **[Auth & Profile](auth-profile.md)**: User authentication and profile management
- **[Social](social.md)**: Social interactions, posts, and friend connections
- **[Monetization](monetization.md)**: Premium features, subscriptions, and donations
- **[Search Engine](search-engine.md)**: Search functionality across the platform
- **[Admin Utils](admin-utils.md)**: Administrative tools and moderation features

## Using This Documentation

These documents serve as both a reference for understanding the current architecture and a guide for future development. When adding features or refactoring code, consult the relevant module documentation to understand how your changes fit into the broader system.

Each module document includes:
- **Purpose**: The high-level goal of the module
- **Key Functionality**: Core features provided by the module
- **Components**: React components that make up the module
- **Related Supabase Tables**: Database tables associated with the module
- **Known Issues & TODOs**: Areas for improvement and planned enhancements

## Contribution Guidelines

When updating these documents:
1. Keep the scope focused on a single module per file
2. Update the relevant document when adding new components or features
3. Add new TODOs as they are identified
4. Cross-reference between modules when adding integrations

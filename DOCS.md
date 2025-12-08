# Nestly v2 – App Guide

## Overview
Nestly saves links from social platforms (TikTok, Instagram, YouTube) and lets you revisit them in a clean, cinematic feed. Links are unfurled server-side (Supabase Edge) and auto-tagged via rules or OpenAI when available.

## Core Concepts
- Items: a saved URL with metadata (title, caption, author, thumbnail), and per-user state (is_done, note).
- Tags: topical labels (Food, Travel, Tech, etc.). An item can have multiple tags. We do not use separate categories; tags are the single organizing dimension.
- Inbox: items not marked Done. “Done” means you’re finished with it; it still exists but can be filtered out.

## UI Model
- Bottom bar: three icons — Home (Feed), Add, Profile. The bar is a floating, blurred pill.
- Feed: one post per screen; full-bleed player for the active card; clean glass overlay for meta/actions.
- Item screen: inline player + readable details and notes.

## How it works
1. Add Link: paste a URL → Edge function `unfurl` fetches OG/oEmbed → creates `items` row → calls `classify` to produce `item_tags`.
2. Feeds: the app queries `items` and filters by tag (including Inbox/All). Thumbnails and metadata render instantly; players mount only for the active item for performance.
3. Open: tries native deep link where appropriate; falls back to web.
4. Notes and re-tagging: edits persist immediately to Supabase.

## Environment
- App: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
- Functions: `OPENAI_API_KEY` optional for multi-label zero-shot.

## Development Workflow

### 1. Run Locally
This starts the Metro bundler and allows you to run the app in Expo Go (on your phone) or a simulator.
```bash
# Install dependencies
npm install

# Start the development server
npx expo start
# OR for a tunnel connection (better for testing on physical device over different networks)
npx expo start --tunnel
```
*Scan the QR code with your phone (Camera app on iOS, Expo app on Android) to run.*

### 2. Build for App Store (EAS)
We use EAS Build to create the production binaries.

**Prerequisites:**
- You need an Expo account.
- You need a paid Apple Developer account.

```bash
# 1. Login to EAS
npx eas login

# 2. Configure the build (if not already done)
npx eas build:configure

# 3. Run the build for iOS (Production)
# This will handle certificates, provisioning profiles, and upload to TestFlight/App Store Connect.
npx eas build --platform ios --profile production --auto-submit
```

### 3. Push to GitHub
Standard git workflow.

```bash
# Check what files have changed
git status

# Add all changes
git add .

# Commit changes with a message
git commit -m "Describe your changes here"

# Push to the remote repository
git push origin main
```

### 4. Supabase Functions
If you edit code in `supabase/functions/`:
```bash
# Deploy functions to production
npx supabase functions deploy unfurl
npx supabase functions deploy classify
```

## Tagging
- Fallback rules in `rules/tags.ts` map keywords/hashtags to tags.
- With OpenAI: `classify` returns multi-label tags with confidences and upserts `item_tags`.

## Natural-language search roadmap
- Current: client parses relative dates (“2 weeks ago”, yesterday/today), platform keywords (instagram/tiktok/youtube/web), and tag keywords; feeds filters into `usePosts` (after/before/platform) plus text ILIKE on title/short_title.
- Near-term: add synonym map (e.g., “F1” -> treat as keyword/tag), surface parsed chips, and add sort UI (recent/oldest).
- Future: add pgvector + hybrid FTS for semantic search on title/caption, and suggestion prompts.

## Collections
- Tables: `collections`, `collection_items` with RLS by user.
- Screens: `/collections` (list/create/delete) and `/collections/[id]` (view posts). Item detail supports “Add to collection”.
- Profile links to collections screen; counts shown per collection.

## Manage tags
- Screen `/tags` shows tags with counts for the current user; supports removing a tag from all items (rename not yet supported due to enum).

## Appearance / Notifications
- Stored locally via `usePreferences` (AsyncStorage). Appearance supports `system`/`dark` preference; light theme pending. Notifications toggle is placeholder until push is wired.

## UX Notes
- The feed uses paging and ensures only the visible item mounts a WebView to keep 60fps.
- The blurred TabBar avoids visual noise and keeps content immersive.
- Chips provide small, tactile controls with haptics.

## Docs housekeeping
- Keep: `README.md`, `STATUS.md`, `QUICK_TEST_GUIDE.md`, this `DOCS.md`.
- Review/retire after migration: `XCODE_SETUP.md`, `SHARE_FIX*.md`, `SIMPLE_FIX.md`, `SHARE_IMPLEMENTATION.md`, `IMPLEMENTATION_SUMMARY.md`, legacy `docs/` HTML.
- Archive or delete once superseded to avoid drift.

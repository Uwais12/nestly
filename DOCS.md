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

## Development
- Start: `nvm use 20 && npm i && npx expo start --tunnel`
- Functions: see `supabase/functions/*`. Schema in `supabase/schema.sql`.

## Tagging
- Fallback rules in `rules/tags.ts` map keywords/hashtags to tags.
- With OpenAI: `classify` returns multi-label tags with confidences and upserts `item_tags`.

## UX Notes
- The feed uses paging and ensures only the visible item mounts a WebView to keep 60fps.
- The blurred TabBar avoids visual noise and keeps content immersive.
- Chips provide small, tactile controls with haptics.

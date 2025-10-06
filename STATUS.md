# Project Status

## Completed
- Auth provider and route guard for `(tabs)` and `item/*`
- Email magic link + OTP sign-in screen (modern UI)
- Supabase schema & Edge Functions (`unfurl`, `classify`)
- ENV wiring and README
- Design system tokens and UI atoms (Button, Input, Card, TagPill, IconButton, Empty)
- Minimal nav: custom TabBar, tabs: Home, Add, Profile
- Feed list (basic) with open/done actions, empty state
- Add Link modal with close button, validation, inline error, success navigation
- Clipboard import prompt
- Canonicalizer, tags rules, and tests

## In Progress / Next
- Feed redesign: gradient overlay, caption/hashtags, skeletons
- Tag Picker bottom sheet (multi-select) + segmented quick tags in header
- Search modal and query integration
- Profile polish (avatar, email display)
- Toast wrapper and global usage for success/error
- README update for new nav and Tag Picker

## Notes
- Deep linking best-effort via `lib/deeplinks.ts`; falls back to web.
- If you set `OPENAI_API_KEY` in Supabase functions, classifier uses LLM; else rules.

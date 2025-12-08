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
- Natural-language search roadmap: today we parse time/platform/tag keywords client-side; next add vector/FTS hybrid (pgvector), synonym map (e.g., “F1” -> tag/keyword), and semantic suggestions. Keep plan documented.
- Sorting controls: add sort button on Home/Search (recent, oldest); hook into `usePosts`.
- Collections: new `collections` + `collection_items` tables and screens; extend to inline add from item detail (shipped).
- Manage tags: screen to view/remove tags (shipped). Future: rename via migration or tag alias table.
- Notifications: preference stored locally; push to be wired later.
- Appearance: preference (system/dark) stored; light theme coming later.
- Export: deferred.
- Tab bar polish: spacing, safe-area padding, and ensure footer text not covered.

## Notes
- Deep linking best-effort via `lib/deeplinks.ts`; falls back to web.
- If you set `OPENAI_API_KEY` in Supabase functions, classifier uses LLM; else rules.



## TODO:
- Do not require login every launch (persist session)
- Implement sorting controls on Home/Search
- Broaden natural-language search (synonyms, vector/FTS hybrid, suggestions)
- Tag rename/alias support (enum migration or alias table)
- Export data action (JSON/CSV + share)
- Light mode (derivative) toggle under Appearance
- Clean up legacy docs after migration
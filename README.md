## MVP: Save-to-App Feeds

Paste or share TikTok/IG/YT links → unfurl metadata → auto-tag → browse vertical feeds. Backend: Supabase (Auth + Postgres + Edge Functions).

### Quickstart

1) Install deps (Node 20):

```bash
nvm use 20
npm install
```

2) Env:

```
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

3) Run:

```bash
npx expo start
```

### Supabase

- Apply `supabase/schema.sql` in your project.
- Deploy functions: `supabase functions deploy classify` and `unfurl` from `supabase/functions/*`.
- Optional: set `OPENAI_API_KEY` for multi-label LLM. Otherwise rules are used.

### Auth

Email magic link screen at first launch.

### Tests

```bash
node --loader ts-node/esm tests/rules.test.ts
node --loader ts-node/esm tests/canonicalize.test.ts
```

### Notes

- `FlatList` with `pagingEnabled` for vertical swipe.
- Add Link modal calls `unfurl`, which invokes `classify`.
- Deep link attempts native apps; falls back to web.

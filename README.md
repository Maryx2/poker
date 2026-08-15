# First Dice

A multiplayer, one-roll dice poker game built with React + Vite, designed to deploy on Netlify and use Supabase for multiplayer state.

## Game

Dealer and Player 2 each roll five dice once.

Highest poker-style dice hand wins:

1. Five of a Kind
2. Four of a Kind
3. Full House
4. Royal Run — 2, 3, 4, 5, 6
5. Low Run — 1, 2, 3, 4, 5
6. Three of a Kind
7. Two Pair
8. Pair
9. High Dice

## Stack

- React
- Vite
- Netlify
- Supabase
- Supabase Realtime
- Supabase Anonymous Auth

## Local development

```bash
npm install
npm run dev
```

## Environment variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Then add:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_OR_PUBLISHABLE_KEY
```

Never place a Supabase service-role key in a `VITE_` variable.

## Set up Supabase

1. Create a Supabase project.
2. Enable Anonymous Sign-Ins under Authentication.
3. Open SQL Editor.
4. Run:

`supabase/setup.sql`

That creates the First Dice room, member, game-state, and match-history database structure.

## Deploy to Netlify from GitHub

1. Push this repository to GitHub.
2. In Netlify, choose **Add new project**.
3. Choose **Import an existing project**.
4. Connect GitHub.
5. Select this repository.
6. Netlify will use the included `netlify.toml`.

Build settings:

```text
Build command: npm run build
Publish directory: dist
```

7. Add these Netlify environment variables:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

8. Deploy.

## Important files

```text
src/                  React app
supabase/setup.sql    Supabase database setup
public/_redirects     Netlify SPA fallback
netlify.toml          Netlify build config
.env.example          Required environment variables
```

## Production note

For competitive or prize-based play, keep dice generation and result calculation server-authoritative. The included Supabase SQL is designed to move those responsibilities into the database.

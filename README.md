# First Dice — Full Multiplayer Platform

React + Vite + Supabase + Netlify.

## Included

- Email/password login and signup
- Persistent public player profiles
- Public wins leaderboard
- Career wins, losses, win rate, streaks, round stats and best hand
- Room codes and shareable Player / Audience links
- Dealer/host, Player 2 and spectator roles
- Ready system
- Match formats: first to 2, 3, 5, 7 or 10
- Server-authoritative dice rolls and scoring in Postgres
- Match winner career-stat updates
- Match / round history
- Realtime game-state updates
- Spectator reactions
- Spectator count
- Host lock and remove controls
- Rematches
- Reconnect heartbeat
- Shared 3-2-1 roll countdown
- Optional browser-generated game sounds
- Rare-hand glow treatment
- Responsive mobile UI
- Netlify SPA configuration

## Supabase setup

1. Create a Supabase project.
2. Open SQL Editor.
3. Run `supabase/setup.sql`.
4. In Authentication settings, configure Email authentication as desired.

## Local environment

Copy `.env.example` to `.env` and add:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_KEY
```

Never put a service-role/secret key in a `VITE_` variable.

## Run

```bash
npm install
npm run dev
```

## Netlify

Connect this GitHub repository to Netlify.

The included `netlify.toml` uses:

```text
Build command: npm run build
Publish directory: dist
```

Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in Netlify environment variables.

## Architecture

The browser does not generate official dice rolls. `roll_round()` in Supabase Postgres generates both five-dice hands, evaluates them, determines the winner, updates the room, records history, and updates career statistics when a match ends.

The frontend subscribes to Supabase Realtime Postgres changes for the current room. This is a clean fit for a small-to-medium live game; if spectator concurrency becomes very large, migrate high-volume ephemeral events such as reactions to Supabase Broadcast.


## Security notes

- All official dice rolls and match results are generated inside the Supabase `roll_round()` RPC.
- Browser clients cannot directly insert/update game state, match history, or career stats.
- Room data is protected by RLS and a security-definer membership helper to avoid recursive policies.
- Profiles / leaderboard stats are intentionally public-readable; profile edits require the authenticated owner RPC.

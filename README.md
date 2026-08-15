# First Dice — Full Multiplayer Platform

React + Vite + Supabase + Netlify.

## Included

- First-visit name registration with persistent anonymous player identity
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


## Username/password authentication

The UI does not request an email address.

Supabase Auth still requires an email or phone identifier for password authentication, so the app internally maps usernames to a reserved address:

`username@users.firstdice.invalid`

Users never see or use that address.

In Supabase Dashboard, you MUST disable:

Authentication → Providers → Email → Confirm Email

Otherwise Supabase will block immediate username/password login.

Existing accounts that were created with real email addresses will not automatically map to the new username login scheme. Recreate those development accounts or migrate them separately.


## First-visit identity

Players no longer enter an email address or password.

On first visit:
1. The player chooses a display name.
2. The browser creates a Supabase anonymous user.
3. A permanent profile row is created for that user ID.
4. Supabase stores the anonymous session in browser storage.
5. Future visits on that browser restore the same profile and career stats automatically.

Required Supabase setting:

Authentication → Providers → Anonymous → Enable anonymous sign-ins

### Persistence limitation

The identity persists on the same browser/device as long as its site data remains intact.

If the player clears browser storage, uses another browser/device, or loses the anonymous session, there is no password/email credential available to recover that identity. Their old public leaderboard stats remain in the database, but the browser will create a new player identity.

For true cross-device account recovery later, add an optional account-upgrade flow.


## Local player-name storage

The player name no longer depends on Supabase.

It is stored in browser `localStorage` under:

`firstdice_player_name`

That means:

- The first-visit name screen works without Supabase.
- Returning visitors on the same browser keep the same name.
- Editing the profile name updates localStorage.
- Clearing site/browser data removes the saved local name.
- Switching browsers/devices does not automatically transfer the name.

Supabase is now only needed for online multiplayer, persistent public stats, match history, and leaderboard functionality.

The app can still create an anonymous Supabase session in the background when multiplayer is enabled, but that session is not used to remember the user's chosen display name.

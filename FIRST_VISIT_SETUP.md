# First Visit Player Setup

First Dice now uses no visible login form.

Players only enter a name the first time they visit.

## Supabase setting required

Supabase Dashboard:

Authentication
→ Providers
→ Anonymous
→ Enable Anonymous Sign-Ins

No email confirmation setting is needed for this flow.

## How persistence works

Supabase creates an anonymous authenticated user and stores the session in browser storage.

The profile and statistics are stored permanently in Postgres using that user's UUID.

The same browser will automatically restore the player on future visits.

## Important limitation

Because there is no email/password/phone identity:

- Clearing browser/site storage loses access to that identity.
- Moving to another device creates a different identity.
- Existing public stats remain in the database.
- There is no built-in account recovery.

A future optional "Secure my profile" feature can let established players attach an email, passkey, OAuth identity, or another recovery method without changing the first-visit experience.

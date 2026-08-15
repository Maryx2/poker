# Local Player Name Storage

First Dice now saves the player's chosen name in browser localStorage.

Key:

firstdice_player_name

Supabase is NOT required for:
- First visit name entry
- Remembering the player name
- Editing the local player name

Supabase is still optional/required for:
- Online multiplayer rooms
- Persistent global stats
- Public leaderboard
- Match history
- Server-authoritative rolls

Important:
localStorage is device/browser-specific. Clearing site data or using another device creates a fresh local identity name.

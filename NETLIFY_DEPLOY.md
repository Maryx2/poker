# Deploy First Dice to Netlify

## Recommended: Git-based deploy

1. Put this project in a GitHub/GitLab/Bitbucket repository.
2. In Netlify, choose **Add new project** and import the repository.
3. Netlify should detect the Vite project. This repository already defines:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: `22`
4. In Netlify **Project configuration → Environment variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy.

## Supabase requirement for internet multiplayer

Create a Supabase project and use its Project URL and public/anon key for the two variables above.

The app uses Supabase Realtime Broadcast + Presence. Without those variables, it falls back to BroadcastChannel and only synchronizes tabs/windows on the same browser/device.

## URLs

After deployment:

- Main game: `https://YOUR-SITE.netlify.app/`
- Room invite: `https://YOUR-SITE.netlify.app/?room=ABC123`

The invite page pre-fills the room code and lets the visitor choose Player 2 or Spectator.

## SPA support

Both `netlify.toml` and `public/_redirects` include the SPA rewrite to `index.html`, so direct links continue to load correctly.

## Production security note

The Supabase public/anon key is intended for browser use. Do not place Supabase service-role keys or other private secrets in `VITE_` variables, because Vite embeds those variables into client-side JavaScript.

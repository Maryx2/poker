# Fixing “Forbidden use of secret API key in browser”

In Netlify, completely remove any old frontend variable containing a secret/service-role key.

Use only:

VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...

Do NOT create frontend variables containing:
- sb_secret_...
- service_role

After changing variables:

1. Netlify → Project configuration → Environment variables.
2. Delete the old VITE_SUPABASE_ANON_KEY if it contains the wrong value.
3. Also search for SUPABASE_KEY, SUPABASE_SECRET_KEY, SUPABASE_SERVICE_ROLE_KEY, or any variable containing sb_secret_.
4. Add VITE_SUPABASE_PUBLISHABLE_KEY using the project's publishable key.
5. Save.
6. Trigger a new production deploy. If offered, use “Clear cache and deploy site”.
7. Open the site in a private/incognito window so an old JavaScript bundle is not reused.

Get the publishable key from Supabase Dashboard → Connect / API Keys. It should begin with:

sb_publishable_

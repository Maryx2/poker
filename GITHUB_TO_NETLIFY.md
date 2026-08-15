# GitHub → Netlify

1. Create a new GitHub repository.
2. Upload the contents of this folder to the repository root.
3. In Netlify choose **Add new project → Import an existing project → GitHub**.
4. Select the repository.
5. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
6. Deploy.

The repo already includes `netlify.toml` and `public/_redirects`.

Before deploying the app, run `supabase/setup.sql` in the SQL Editor of the Supabase project you plan to use.

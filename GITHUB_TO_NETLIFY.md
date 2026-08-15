# GitHub → Netlify

## 1. Upload to GitHub

Create a new empty GitHub repository.

Upload the entire contents of this project so `package.json`, `src/`, and `netlify.toml` are at the repository root.

If using Git locally:

```bash
git init
git add .
git commit -m "Initial First Dice multiplayer build"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

## 2. Connect GitHub to Netlify

In Netlify:

1. Add new project
2. Import an existing project
3. Choose GitHub
4. Select the First Dice repository
5. Deploy

The repository already includes:

```text
Build command: npm run build
Publish directory: dist
```

## 3. Add environment variables

In your Netlify project environment variables, add:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

Redeploy after adding them.

## 4. Future updates

After the GitHub repository is connected, every push to your production branch can trigger a new Netlify deployment automatically.

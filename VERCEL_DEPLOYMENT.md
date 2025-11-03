# Vercel Deployment Guide

## Required Environment Variable

You only need to add **ONE** environment variable to Vercel:

### VITE_CONVEX_URL

This is for the React app to connect to Convex.

**Value:** Copy from your `.env.local` file
```
VITE_CONVEX_URL=https://cautious-pigeon-57.convex.cloud
```

**Note:** We commit the `convex/_generated` files to git, so Vercel doesn't need to deploy Convex during build. This makes deployment much simpler!

## Setting Up Vercel

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Add multiplayer draft with Convex"
git push
```

### Step 2: Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. **Before deploying**, add environment variables:

### Step 3: Add Environment Variable

In Vercel project settings → Environment Variables:

- **Name:** `VITE_CONVEX_URL`
- **Value:** `https://cautious-pigeon-57.convex.cloud` (copy from your `.env.local`)
- **Environments:** ✅ Production ✅ Preview ✅ Development

Click **Save**.

### Step 4: Deploy

Click **Deploy** and wait for build to complete.

### Step 5: Configure Convex URL Allowlist

1. Go to https://dashboard.convex.dev/t/gabrielius-katkus/bb2draft-81f0b
2. **Settings** → **URL Configuration**
3. Add your Vercel URLs:
   - `https://your-app.vercel.app`
   - `https://your-app-*.vercel.app` (for preview deployments)
4. Save

## Testing

1. Visit your Vercel URL
2. Create a multiplayer room
3. Open incognito/another device
4. Join with the code
5. Verify real-time sync works!

## Troubleshooting

### Build fails

- Verify `convex/_generated` folder is committed to git
- Check that `npm run build` works locally
- Look at Vercel build logs for specific errors

### Frontend can't connect to Convex

- Check `VITE_CONVEX_URL` is set correctly in Vercel
- Verify your Vercel domain is in Convex URL allowlist
- Check browser console for CORS errors
- Make sure you added both production and preview URLs to Convex

### Room codes not working

- Verify `VITE_CONVEX_URL` environment variable is set
- Check that Convex backend is running (visit dashboard)
- Try creating a new room to test

## Redeploying

If you change Convex functions or schema:

```bash
git add .
git commit -m "Update Convex functions"
git push
```

Vercel will automatically rebuild and redeploy.

**Note:** If you update Convex schema or functions, make sure to run `npm run dev:convex` locally first to regenerate the `convex/_generated` files, then commit those changes too.

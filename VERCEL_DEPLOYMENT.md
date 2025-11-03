# Vercel Deployment Guide

## Required Environment Variables

You need to add **two** environment variables to Vercel:

### 1. VITE_CONVEX_URL (Frontend)

This is for the React app to connect to Convex.

**Value:** Copy from your `.env.local` file
```
VITE_CONVEX_URL=https://cautious-pigeon-57.convex.cloud
```

### 2. CONVEX_DEPLOY_KEY (Build Process)

This allows Vercel to deploy your Convex functions during build.

**How to get it:**

1. Go to https://dashboard.convex.dev/t/gabrielius-katkus/bb2draft-81f0b
2. Click **Settings** → **Deploy Keys**
3. Click **Generate a deploy key**
4. Select **Production**
5. Copy the key (starts with `prod:...`)

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

### Step 3: Add Environment Variables

In Vercel project settings:

**Variable 1:**
- Name: `VITE_CONVEX_URL`
- Value: `https://cautious-pigeon-57.convex.cloud` (from your `.env.local`)
- Environments: ✅ Production ✅ Preview ✅ Development

**Variable 2:**
- Name: `CONVEX_DEPLOY_KEY`
- Value: `prod:...` (from Convex dashboard)
- Environments: ✅ Production ✅ Preview ✅ Development

### Step 4: Deploy

Click **Deploy**

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

### Build fails with "Cannot find module convex/_generated"

- Make sure `CONVEX_DEPLOY_KEY` is set
- Check that the deploy key is valid (not expired)
- Verify the key is for **Production** deployment

### Frontend can't connect to Convex

- Check `VITE_CONVEX_URL` is set correctly
- Verify your Vercel domain is in Convex URL allowlist
- Check browser console for CORS errors

### "Unauthorized" errors

- Regenerate your deploy key in Convex dashboard
- Update `CONVEX_DEPLOY_KEY` in Vercel
- Redeploy

## Deploy Key Security

⚠️ **Important:** Never commit your deploy key to Git!

- It's automatically ignored in `.env.local`
- Only add it to Vercel environment variables
- Rotate it if accidentally exposed

## Redeploying

If you change Convex functions or schema:

```bash
git add .
git commit -m "Update Convex functions"
git push
```

Vercel will automatically rebuild and redeploy.

## Manual Deploy (Alternative)

If you prefer to deploy Convex separately:

```bash
# Deploy Convex first
npx convex deploy --prod

# Then build for Vercel (without deploying Convex)
npm run build:app
```

Then in Vercel, change build command to just `npm run build:app`.

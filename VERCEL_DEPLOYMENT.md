# McLean Bible Church - Vercel Deployment Guide

This guide walks through deploying the Church Hub apps platform to Vercel for
McLean Bible Church.

## Prerequisites

- [x] GitHub repository: `https://github.com/mbcisadmin/Church-Hub`
- [x] Code committed and pushed to `main` branch
- [ ] Vercel account access (mbcisadmin or organization)
- [ ] Domain ready (optional, can use Vercel subdomain initially)

---

## Step 1: Create Vercel Project

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Sign in with the McLean Bible Church account

2. **Import Repository**
   - Click **"Add New"** → **"Project"**
   - Select **"Import Git Repository"**
   - Choose: `mbcisadmin/Church-Hub`
   - Click **"Import"**

3. **Configure Project Settings**

   **Framework Preset:** `Next.js`

   **Root Directory:** `apps/platform`

   **Build Settings:**
   - **Build Command:**
     `cd ../.. && npm run build --filter=@church/apps-platform`
   - **Output Directory:** `.next` (default)
   - **Install Command:** `npm install`

   **Node Version:** `20.x` (latest LTS)

---

## Step 2: Set Up Organization Environment Variables (Recommended)

These environment variables will be shared across **all** McLean Bible Church
Vercel projects.

1. **Go to Organization Settings**
   - Click your organization name in the top-left
   - Select **"Settings"**
   - Navigate to **"Environment Variables"**

2. **Add MinistryPlatform Variables** (shared across all projects)

   | Variable Name                            | Value                                                  | Environments                     |
   | ---------------------------------------- | ------------------------------------------------------ | -------------------------------- |
   | `MINISTRY_PLATFORM_BASE_URL`             | `https://my.mcleanbible.org`                           | Production, Preview, Development |
   | `MINISTRY_PLATFORM_CLIENT_ID`            | `TM.Widgets`                                           | Production, Preview, Development |
   | `MINISTRY_PLATFORM_CLIENT_SECRET`        | `177d55b5-e7ff-4659-ae21-1cdcfea34668`                 | Production, Preview, Development |
   | `NEXT_PUBLIC_MINISTRY_PLATFORM_FILE_URL` | `https://my.mcleanbible.org/ministryplatformapi/files` | Production, Preview, Development |

   Click **"Save"** after each variable.

---

## Step 3: Set Up Project-Specific Environment Variables

These are unique to the apps platform project.

1. **Go to Project Settings**
   - Select your newly created project
   - Click **"Settings"** → **"Environment Variables"**

2. **Add Project-Specific Variables**

   | Variable Name          | Value                                                      | Environments                     |
   | ---------------------- | ---------------------------------------------------------- | -------------------------------- |
   | `NEXTAUTH_SECRET`      | Generate new: `openssl rand -base64 32`                    | Production, Preview, Development |
   | `NEXTAUTH_URL`         | Production: `https://apps.mcleanbible.org` (or Vercel URL) | Production                       |
   | `NEXTAUTH_URL`         | Your preview URL (auto-set by Vercel)                      | Preview                          |
   | `NEXTAUTH_URL`         | `http://localhost:3000`                                    | Development                      |
   | `NEXT_PUBLIC_APP_NAME` | `McLean Bible Church Apps`                                 | All                              |
   | `NODE_ENV`             | `production`                                               | Production                       |

   **Generate NEXTAUTH_SECRET:**

   ```bash
   openssl rand -base64 32
   ```

   **Important:**
   - Use a **different** `NEXTAUTH_SECRET` for Production vs Preview/Development
   - For security, generate 3 separate secrets

---

## Step 4: Update MinistryPlatform OAuth Redirect URIs

1. **Log into MinistryPlatform Admin Console**
   - URL: `https://my.mcleanbible.org`
   - Navigate to: **Platform Settings** → **OAuth Clients**

2. **Edit the OAuth Client** (`TM.Widgets`)
   - Add these redirect URIs:
     ```
     http://localhost:3000/api/auth/callback/ministryplatform
     https://apps.mcleanbible.org/api/auth/callback/ministryplatform
     https://*.vercel.app/api/auth/callback/ministryplatform
     ```
   - The wildcard `*.vercel.app` allows all Vercel preview deployments
   - Click **"Save"**

---

## Step 5: Deploy

1. **Initial Deployment**
   - Click **"Deploy"** in the Vercel dashboard
   - Wait for build to complete (~2-3 minutes)
   - Vercel will auto-deploy on every push to `main`

2. **Check Deployment**
   - Visit the Vercel-provided URL (e.g., `church-hub-abc123.vercel.app`)
   - Verify the app loads
   - **Note:** Authentication won't work until stored procedures are installed

---

## Step 6: Configure Custom Domain (Optional)

1. **Add Domain in Vercel**
   - Go to Project → **"Settings"** → **"Domains"**
   - Click **"Add"**
   - Enter: `apps.mcleanbible.org`
   - Click **"Add"**

2. **Configure DNS**
   - Vercel will provide DNS instructions
   - Add the CNAME record to McLean's DNS provider
   - Wait for SSL certificate to provision (~10-15 minutes)

3. **Update NEXTAUTH_URL**
   - Go to **"Environment Variables"**
   - Update `NEXTAUTH_URL` for Production to: `https://apps.mcleanbible.org`
   - Redeploy (Vercel will auto-redeploy when env vars change)

---

## Step 7: Test Authentication (After Stored Procedures Installed)

Once McLean's DBA installs the stored procedures:

1. Visit your deployed app
2. Click **"Sign In"**
3. Log in with McLean Bible Church MinistryPlatform credentials
4. Verify:
   - [ ] User name appears in nav
   - [ ] No console errors
   - [ ] Counter app loads (if data exists)

---

## Deployment Status

### Environment Variables

- [ ] Organization variables set (MP credentials)
- [ ] Project variables set (NextAuth secrets)
- [ ] NEXTAUTH_SECRET generated for all environments

### MinistryPlatform

- [ ] OAuth redirect URIs updated
- [ ] Stored procedures installed:
  - [ ] `api_Custom_GetUserRolesAndGroups_JSON`
  - [ ] `api_Custom_GetCongregationsWithSVG`

### Vercel

- [ ] Project created and deployed
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active

---

## Troubleshooting

### Build Fails

**Error:** `Module not found` or `Cannot find package`

**Fix:**

- Verify Root Directory is set to `apps/platform`
- Verify Build Command includes `cd ../..` to run from monorepo root

### Authentication Errors

**Error:** `MissingSecret` or `401 Unauthorized`

**Fix:**

- Verify all environment variables are set
- Check `NEXTAUTH_SECRET` is different for each environment
- Verify `NEXTAUTH_URL` matches your actual domain
- Confirm OAuth redirect URIs include your domain

### Database Connection Fails

**Error:** MP API returns errors

**Fix:**

- Verify stored procedures are installed
- Check they're registered in MP Admin Console → API Procedures
- Test procedures directly in SSMS

---

## Next Steps

After successful deployment:

1. **Monitor Vercel Logs**
   - Go to Project → **"Deployments"** → Select deployment → **"Function Logs"**
   - Watch for any errors during sign-in attempts

2. **Test All Features**
   - Sign in with different user roles
   - Test Counter app
   - Verify PWA installation works

3. **Set Up Preview Deployments**
   - Create a `dev` branch for testing
   - Vercel auto-creates preview URLs for PRs

4. **Consider Additional Projects**
   - Microsites (landing pages, event pages)
   - Widgets (embeddable components)
   - Future micro-apps

---

## Support

- **Vercel Docs:** https://vercel.com/docs
- **Church Hub:** See SETUP.md and DEVELOPMENT.md
- **Issues:** Document in UPSTREAM_FIXES.md if template-related

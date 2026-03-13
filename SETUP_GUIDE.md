# Tribe App - Complete Setup Guide

This guide will walk you through setting up the Tribe app for your campus community.

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)
- A Cloudflare account (for R2 storage)
- A Resend account (for emails)
- Google OAuth credentials (for social login)

---

## Step 1: Supabase Project Setup

### 1.1 Create Supabase Project
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Name it "tribe-campus"
4. Choose your region (pick closest to your users)
5. Save your database password securely

### 1.2 Get Your API Keys
After project creation, go to Project Settings > API:
- Copy `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- Copy `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Copy `service_role secret` key → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

---

## Step 2: Database Setup

### 2.1 Run SQL Migrations

Go to Supabase Dashboard > SQL Editor, and run these in order:

**Migration 1: Initial Schema**
Run the contents of `supabase/migrations/001_initial_schema.sql`

**Migration 2: Indexes**
Run the contents of `supabase/migrations/002_indexes.sql`

**Migration 3: RLS Policies**
Run the contents of `supabase/migrations/003_rls_policies.sql`

**Migration 4: Functions & Triggers**
Run the contents of `supabase/migrations/004_functions.sql`

### 2.2 Enable Realtime
For each table that needs realtime updates, run:
```sql
alter publication supabase_realtime add table posts;
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table notifications;
alter publication supabase_realtime add table stories;
```

---

## Step 3: Storage Buckets Setup

### 3.1 Create Storage Buckets
Go to Supabase Dashboard > Storage:

1. Create bucket `avatars` (public)
2. Create bucket `posts` (public)
3. Create bucket `stories` (public)

### 3.2 Set Storage Policies
For each bucket, add these policies:

**avatars bucket:**
- SELECT: Authenticated users can view
- INSERT: Authenticated users can upload (folder path matches their user_id)
- DELETE: Users can only delete their own files

---

## Step 4: Authentication Setup

### 4.1 Configure Google OAuth
1. Go to https://console.cloud.google.com/apis/credentials
2. Create OAuth 2.0 credentials
3. Add authorized redirect URIs:
   - `https://your-project.supabase.co/auth/v1/callback`
   - `http://localhost:3000/auth/callback` (for dev)
4. Copy Client ID and Secret

### 4.2 Configure Supabase Auth
Go to Supabase Dashboard > Authentication > Providers:
- Enable Google provider
- Paste Client ID and Secret
- Save settings

### 4.3 Configure Email Templates
Go to Authentication > Email Templates:

**Confirm Signup Template:**
```html
<h2>Confirm your signup</h2>
<p>Follow this link to confirm your account:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm Email</a></p>
```

**Reset Password Template:**
```html
<h2>Reset Password</h2>
<p>Follow this link to reset your password:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
```

---

## Step 5: Edge Functions Deployment

### 5.1 Install Supabase CLI
```bash
npm install -g supabase
```

### 5.2 Login to Supabase
```bash
supabase login
```

### 5.3 Link Your Project
```bash
supabase link --project-ref your-project-ref
```

### 5.4 Deploy Functions
```bash
# Deploy welcome email function
supabase functions deploy send-welcome-email

# Deploy notification handler
supabase functions deploy handle-like-notification
```

### 5.5 Set Secrets
```bash
supabase secrets set RESEND_API_KEY=re_your_api_key
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

## Step 6: Cloudflare R2 Setup (Optional)

### 6.1 Create R2 Bucket
1. Go to Cloudflare Dashboard > R2
2. Create bucket named `tribe-uploads`
3. Note your Account ID

### 6.2 Create API Token
1. Go to My Profile > API Tokens
2. Create token with R2 read/write permissions
3. Copy Access Key ID and Secret Access Key

---

## Step 7: Environment Variables

Create `.env.local` file:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Google OAuth
GOOGLE_CLIENT_ID=123-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...

# Email (Resend)
RESEND_API_KEY=re_...

# Cloudflare R2 (optional, can use Supabase Storage instead)
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_R2_ACCESS_KEY=your_access_key
CLOUDFLARE_R2_SECRET_KEY=your_secret_key
```

---

## Step 8: Local Development

### 8.1 Install Dependencies
```bash
npm install
```

### 8.2 Run Development Server
```bash
npm run dev
```

### 8.3 Access App
Open http://localhost:3000

---

## Step 9: Database Webhooks (Optional)

Set up webhooks for automatic notifications:

### 9.1 Create Webhook for Likes
1. Go to Database > Webhooks
2. Create new hook:
   - Table: `likes`
   - Events: `INSERT`
   - URL: `https://your-project.functions.supabase.co/handle-like-notification`
   - Headers: `Authorization: Bearer your-service-role-key`

---

## Step 10: Production Deployment

### 10.1 Build for Production
```bash
npm run build
```

### 10.2 Deploy to Vercel (Recommended)
1. Push code to GitHub
2. Connect repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### 10.3 Update Site URL
In Supabase Dashboard > Authentication > URL Configuration:
- Set Site URL to your production URL
- Set Redirect URLs to include:
  - `https://your-domain.com/auth/callback`
  - `https://your-domain.com/auth/reset-password`

---

## Troubleshooting

### Common Issues

**1. "Invalid login credentials"**
- Check email confirmation was sent
- Verify user exists in auth.users table

**2. "RLS policy violation"**
- Check RLS policies are properly configured
- Verify user is authenticated

**3. Storage upload fails**
- Check storage bucket exists
- Verify storage policies allow upload
- Check file size limits

**4. Realtime not working**
- Enable realtime for the table
- Check channel subscription code
- Verify user has read permissions

### Getting Help

- Supabase Docs: https://supabase.com/docs
- Next.js Docs: https://nextjs.org/docs
- Open an issue on GitHub

---

## Post-Setup Checklist

- [ ] Create first user account
- [ ] Upload test avatar
- [ ] Create test post
- [ ] Follow another user
- [ ] Send test message
- [ ] Check notifications work
- [ ] Test PWA install
- [ ] Verify Edge Functions execute
- [ ] Check email delivery

---

## Security Notes

1. Never commit `.env.local` to git
2. Keep `SUPABASE_SERVICE_ROLE_KEY` secret
3. Use Row Level Security (RLS) on all tables
4. Validate all user inputs
5. Set up rate limiting for API routes
6. Regularly rotate API keys

---

## Next Steps

1. **Customize Branding**: Update colors, logo, app name
2. **Add Features**: Events, groups, marketplace
3. **Moderation**: Set up content reporting
4. **Analytics**: Add tracking
5. **Monetization**: Premium features, ads
6. **Mobile Apps**: React Native wrapper

---

**You're ready to launch! 🚀**

For support, refer to `LAUNCH_CHECKLIST.md` for pre-launch verification.

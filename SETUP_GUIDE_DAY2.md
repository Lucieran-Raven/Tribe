# Day 2 Setup Guide - Authentication Configuration

## Required Supabase Dashboard Configuration

### 1. Configure Google OAuth Provider
1. Go to https://supabase.com/dashboard/project/sgodfejzvhphgeytmujl
2. Navigate to **Authentication → Providers**
3. Find **Google** and click **Enable**
4. Enter the Client ID:
   ```
   251750345398-k6j5i7h2q8p9t1m0n4b3v6c8x7z2a5q1.apps.googleusercontent.com
   ```
5. Enter your Google Client Secret (from Google Cloud Console)
6. Click **Save**

### 2. Configure Email Templates (Resend)
1. In Supabase Dashboard, go to **Authentication → Email Templates**
2. Update the "Confirm signup" template:
   - Use Resend as your email provider
   - Template subject: "Confirm your Tribe account"
   
3. Update the "Reset password" template:
   - Template subject: "Reset your Tribe password"

### 3. Configure Site URL & Redirect URLs
1. Go to **Authentication → URL Configuration**
2. Set **Site URL** to:
   - Production: `https://tribeapp.com`
   - Development: `http://localhost:3000`
   
3. Add to **Redirect URLs**:
   ```
   http://localhost:3000/auth/callback
   https://your-production-url.com/auth/callback
   ```

### 4. Deploy Edge Function
1. Install Supabase CLI if not already:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   supabase link --project-ref sgodfejzvhphgeytmujl
   ```

4. Deploy the welcome email function:
   ```bash
   supabase functions deploy send-welcome-email
   ```

5. Set the Resend API key as a secret:
   ```bash
   supabase secrets set RESEND_API_KEY=re_Dd9oWr9U_PiJ3sN8vQ2yKx5mL7uB4cT1
   ```

### 5. Set Up Database Webhook (Optional)
To trigger welcome emails automatically on signup:
1. Go to **Database → Webhooks**
2. Create a new webhook:
   - Table: `users`
   - Events: `INSERT`
   - URL: `https://sgodfejzvhphgeytmujl.supabase.co/functions/v1/send-welcome-email`

## Testing Authentication Flows

1. **Email/Password Signup:**
   - Go to http://localhost:3000/signup
   - Create an account
   - Check email for verification

2. **Google OAuth:**
   - Go to http://localhost:3000/login
   - Click "Continue with Google"
   - Select your Google account
   - Should redirect to /feed

3. **Password Reset:**
   - Go to http://localhost:3000/login
   - Click "Forgot password?"
   - Enter email
   - Check email for reset link

## Files Created in Day 2
- `app/auth/callback/route.ts` - OAuth callback handler
- `app/auth/reset-password/page.tsx` - Password reset page
- `app/auth/auth-code-error/page.tsx` - Auth error page
- `app/(auth)/login/page.tsx` - Updated with Google OAuth
- `lib/resend/client.ts` - Email client
- `supabase/functions/send-welcome-email/index.ts` - Edge Function

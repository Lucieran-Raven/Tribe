# Tribe - Launch Checklist & Setup Guide

## Pre-Launch Checklist

### Supabase Configuration
- [ ] Database migrations applied
- [ ] RLS policies enabled on all tables
- [ ] Storage buckets created (avatars, posts, stories)
- [ ] Edge Functions deployed
- [ ] Auth providers configured (Google OAuth)
- [ ] Email templates configured
- [ ] Webhooks set up for notifications

### Environment Variables
Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
RESEND_API_KEY=
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_R2_ACCESS_KEY=
CLOUDFLARE_R2_SECRET_KEY=
```

### Features Implemented

**Week 1:**
- ✅ Day 1: Foundation (Next.js, Supabase, Database)
- ✅ Day 2: Authentication (Google OAuth, Email)
- ✅ Day 3: User Profiles (Avatars, Follow system)
- ✅ Day 4: Posts & Feed
- ✅ Day 5: Comments & Interactions
- ✅ Day 6: Stories & Reels
- ✅ Day 7: PWA & Polish

**Week 2:**
- ✅ Day 8: Real-time Features
- ✅ Day 9: Direct Messages
- ✅ Day 10: Notifications & Push
- ✅ Day 11: Search & Explore
- ✅ Day 12: Edge Functions
- ✅ Day 13: Admin Dashboard
- ✅ Day 14: Testing & Launch

## Deploy Edge Functions

```bash
# Deploy welcome email function
supabase functions deploy send-welcome-email

# Deploy notification handler
supabase functions deploy handle-like-notification

# Set secrets
supabase secrets set RESEND_API_KEY=your_key
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_key
```

## Database Setup

Run migrations in order:
1. `001_initial_schema.sql`
2. `002_indexes.sql`
3. `003_rls_policies.sql`
4. `004_functions.sql`

## Testing Checklist

### Authentication
- [ ] Sign up with email
- [ ] Verify email flow
- [ ] Google OAuth login
- [ ] Password reset
- [ ] Logout

### Core Features
- [ ] Create post with image
- [ ] Like/unlike posts
- [ ] Comment on posts
- [ ] Follow/unfollow users
- [ ] View profile
- [ ] Edit profile
- [ ] Upload avatar

### Social Features
- [ ] View stories
- [ ] Create story
- [ ] Send direct message
- [ ] Receive notifications
- [ ] Search users/posts

### PWA
- [ ] Install on iOS (Add to Home Screen)
- [ ] Install on Android
- [ ] Offline page works
- [ ] Push notifications (if configured)

## Launch Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Post-Launch

### Monitoring
- Check Supabase dashboard for errors
- Monitor Edge Function invocations
- Track user signups and engagement

### Marketing
- Announce on campus social media
- Create demo video
- Set up feedback channel

## Support

For issues:
1. Check browser console for errors
2. Verify environment variables
3. Check Supabase logs
4. Review Edge Function logs

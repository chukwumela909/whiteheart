# Supabase Setup Guide for Whiteheart E-commerce

## 🚀 Quick Start

### 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in project details:
   - **Name**: whiteheart-ecommerce
   - **Database Password**: (save this securely)
   - **Region**: Choose closest to your users
4. Wait for project to initialize (~2 minutes)

### 2. Get Your API Keys

1. In your Supabase dashboard, go to **Project Settings** (gear icon)
2. Click on **API** in the sidebar
3. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

### 3. Configure Environment Variables

1. Create a `.env.local` file in your project root:

```bash
# Copy .env.local.example to .env.local
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

2. Replace the values with your actual Supabase credentials
3. **IMPORTANT**: Never commit `.env.local` to Git (already in .gitignore)

### 4. Set Up Database Schema

#### Option A: Using Supabase SQL Editor (Recommended)

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `supabase-schema.sql`
4. Paste into the SQL editor
5. Click **Run** to execute

#### Option B: Using Supabase CLI (if installed)

```bash
supabase db push
```

### 5. Configure Email Authentication

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Under **Email Templates**, customize if needed:
   - **Confirm signup**: Template for new user verification
   - **Magic Link**: Template for OTP codes
4. Configure email settings:
   - Go to **Authentication** → **Settings**
   - Set **Site URL** to `http://localhost:3000` (development)
   - Add production URL when deploying
   - Set **Redirect URLs**: Add both development and production URLs

### 6. Test Email Sending (Development)

For development, Supabase provides:
- **Inbucket**: View test emails in dashboard
- Go to **Authentication** → **URL Configuration** → **Inbucket URL**
- All OTP emails will appear here during testing

### 7. Start Your Development Server

```bash
npm run dev
```

Visit `http://localhost:3000/auth/signin` to test authentication.

## 📋 What's Been Set Up

### ✅ Frontend (Already Complete)

- **Authentication Pages**:
  - `/app/auth/signin/page.tsx` - Email entry & OTP verification
  - `/app/auth/callback/route.ts` - Handles email callback
  - `/app/auth/auth-code-error/page.tsx` - Error page
  
- **Supabase Client Configuration**:
  - `/lib/supabase/client.ts` - Client-side Supabase client
  - `/lib/supabase/server.ts` - Server-side Supabase client
  - `/lib/supabase/middleware.ts` - Session management
  - `/middleware.ts` - Route protection

### ✅ Database Schema

Tables created:
- `user_profiles` - Extended user information
- `user_addresses` - Shipping addresses
- `products` - Product catalog
- `cart_items` - Shopping cart
- `orders` - Order history
- `order_items` - Individual order products

Features:
- Row Level Security (RLS) enabled
- Automatic `updated_at` timestamps
- Foreign key relationships
- Proper indexes for performance

## 🔐 Authentication Flow

### New User Registration
1. User enters email → Click "Continue"
2. OTP sent to email (6-digit code)
3. User enters OTP → Click "Verify Code"
4. Account created automatically
5. User profile created in `user_profiles` table
6. Redirect to `/orders` page

### Returning User Login
1. User enters email → Click "Continue"
2. OTP sent to email
3. User enters OTP → Click "Verify Code"
4. Session created
5. User data fetched from database
6. Redirect to `/orders` page

## 🧪 Testing the Authentication

1. **Start Dev Server**:
   ```bash
   npm run dev
   ```

2. **Go to Sign In Page**:
   ```
   http://localhost:3000/auth/signin
   ```

3. **Test New User Flow**:
   - Enter your email
   - Click "Continue"
   - Check Inbucket for OTP (in Supabase dashboard)
   - Enter the 6-digit code
   - Should redirect to orders page

4. **Verify in Supabase**:
   - Go to **Authentication** → **Users**
   - You should see your test user
   - Go to **Table Editor** → `user_profiles`
   - Profile should be created

## 🚨 Common Issues & Solutions

### Issue: "Invalid API key"
**Solution**: Check that your `.env.local` has correct keys from Supabase dashboard.

### Issue: OTP not arriving
**Solution**: 
- Development: Check Inbucket in Supabase dashboard
- Production: Verify email settings and SMTP configuration

### Issue: "Failed to send OTP"
**Solution**:
- Verify email provider is enabled in Authentication settings
- Check Site URL is correctly configured
- Ensure redirect URLs include your domain

### Issue: User created but no profile
**Solution**: 
- Check RLS policies are correctly set
- Verify `user_profiles` table exists
- Check browser console for errors

### Issue: Session not persisting
**Solution**:
- Ensure `middleware.ts` is in root directory
- Check that cookies are enabled in browser
- Verify Supabase client configuration

## 📚 Next Steps

After authentication works:

1. **Update Orders Page** to fetch real user orders
2. **Update Profile Page** to load/save user data
3. **Implement Cart** with database persistence
4. **Add Product Management** for admins
5. **Set Up Payment Integration** (Stripe/Paystack)

## 🔗 Useful Links

- [Supabase Dashboard](https://supabase.com/dashboard)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## 💡 Tips

- **Always test in development first** before deploying
- **Monitor Supabase logs** for authentication issues
- **Use RLS policies** to secure your data
- **Keep your anon key public** (it's meant to be), but keep service_role key secret
- **Set up proper email provider** before production (SendGrid, AWS SES, etc.)

---

🎉 **You're all set!** Follow the steps above to complete your Supabase setup and start testing authentication.

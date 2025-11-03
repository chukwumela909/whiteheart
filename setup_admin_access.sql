-- ================================================
-- ADMIN ACCESS SETUP QUERIES
-- ================================================
-- Use these queries to grant admin access to users

-- ================================================
-- METHOD 1: Set Admin by Email
-- ================================================
-- Replace 'your.email@example.com' with your actual email address

UPDATE user_profiles 
SET is_admin = true 
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'your.email@example.com'
);

-- ================================================
-- METHOD 2: Set Admin by User ID
-- ================================================
-- First, find your user_id by running this query:

SELECT 
  u.id as user_id,
  u.email,
  p.first_name,
  p.last_name,
  p.is_admin
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.user_id
WHERE u.email = 'your.email@example.com';

-- Then use the user_id to set admin access:

UPDATE user_profiles 
SET is_admin = true 
WHERE user_id = 'YOUR_USER_ID_HERE';

-- ================================================
-- METHOD 3: View All Users and Their Admin Status
-- ================================================
-- This helps you see all registered users

SELECT 
  u.id as user_id,
  u.email,
  u.created_at as registered_at,
  p.first_name,
  p.last_name,
  p.is_admin,
  p.created_at as profile_created
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.user_id
ORDER BY u.created_at DESC;

-- ================================================
-- METHOD 4: Remove Admin Access
-- ================================================
-- To revoke admin access from a user

UPDATE user_profiles 
SET is_admin = false 
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'user.email@example.com'
);

-- ================================================
-- METHOD 5: Set Multiple Admins at Once
-- ================================================
-- Replace emails with actual admin email addresses

UPDATE user_profiles 
SET is_admin = true 
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email IN (
    'admin1@example.com',
    'admin2@example.com',
    'admin3@example.com'
  )
);

-- ================================================
-- VERIFICATION QUERIES
-- ================================================

-- Check if your admin access was set successfully:
SELECT 
  u.email,
  p.first_name,
  p.last_name,
  p.is_admin
FROM user_profiles p
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'your.email@example.com';

-- List all admin users:
SELECT 
  u.email,
  p.first_name,
  p.last_name,
  p.is_admin
FROM user_profiles p
JOIN auth.users u ON p.user_id = u.id
WHERE p.is_admin = true
ORDER BY p.created_at DESC;

-- Count total admins:
SELECT COUNT(*) as total_admins
FROM user_profiles
WHERE is_admin = true;

-- ================================================
-- NOTES
-- ================================================
-- 1. After updating is_admin, the user should sign out and sign in again
-- 2. Admin access is checked on every admin route
-- 3. Only users with is_admin = true can access /admin routes
-- 4. Admin users can upload product images to Supabase Storage
-- 5. Admin users can create, edit, and delete products
-- 6. Admin users can view and manage all orders

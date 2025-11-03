# Admin Panel Setup Guide

## Overview
The admin panel is now fully functional with product and order management capabilities. Here's how to set up and use it.

## Features Completed

### 1. Product Management (✅ Complete)
- **Add New Products** (`/admin/products/new`)
  - Basic information (name, description, price, currency, stock, category, tax info)
  - Multiple image uploads to Supabase Storage
  - Color variants with hex codes
  - Size variants with individual stock quantities
  - Product features/tags
  
- **Edit Products** (`/admin/products/[id]/edit`)
  - Update all product information
  - Add/remove images
  - Manage colors, sizes, and features
  - Delete existing colors/sizes/features with confirmation

- **Product List** (`/admin/products`)
  - View all products in a table
  - Search by name or description
  - Filter by category
  - Quick edit and delete actions
  - Delete confirmation modal

### 2. Order Management (✅ Complete)
- **Order List** (`/admin/orders`)
  - View all customer orders
  - Search by order number or customer name
  - Filter by order status (pending, processing, shipped, delivered, cancelled)
  - View order details in modal
  
- **Order Details Modal**
  - Customer information and shipping address
  - Order items with product details, colors, sizes, quantities
  - Quick status update buttons
  - Order timeline and total amount

### 3. Admin Dashboard (✅ Complete)
- Real-time statistics:
  - Total products count
  - Total orders count
  - Pending orders count
  - Total revenue
- Quick action cards for Products and Orders

## Setting Up Admin Access

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project (evzecjzuvqzpzjrclnny)
3. Click on "SQL Editor" in the sidebar
4. Run this query (replace `YOUR_EMAIL_HERE` with your email):

```sql
UPDATE user_profiles 
SET is_admin = true 
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'YOUR_EMAIL_HERE'
);
```

5. Sign out and sign in again to the app to refresh your session

### Option 2: Using MCP Supabase Tool

1. Find your user ID by signing in to the app
2. Check the browser console or use this query to find your user_id:

```sql
SELECT user_id, first_name, last_name 
FROM user_profiles 
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'YOUR_EMAIL_HERE'
);
```

3. Then update the is_admin flag:

```sql
UPDATE user_profiles 
SET is_admin = true 
WHERE user_id = 'YOUR_USER_ID_HERE';
```

## Using the Admin Panel

### Accessing Admin Routes
Once you have admin privileges:
- Visit `/admin` - Admin Dashboard
- Visit `/admin/products` - Product Management
- Visit `/admin/products/new` - Add New Product
- Visit `/admin/orders` - Order Management

### Image Upload
- Product images are stored in Supabase Storage bucket `product-images`
- Images are automatically uploaded when creating/editing products
- Supported formats: JPEG, JPG, PNG, WebP, GIF
- Maximum file size: 5MB per image
- Images are publicly accessible for customer viewing

### Product Workflow
1. Click "Add New Product" from dashboard or product list
2. Fill in basic information (name, price, description)
3. Upload product images (multiple supported)
4. Add color variants with hex codes (e.g., Black #000000)
5. Add size variants with stock quantities (e.g., M: 50 units)
6. Add product features/tags (e.g., "Waterproof", "Breathable")
7. Click "Create Product"

### Order Workflow
1. View all orders in the order list
2. Use search to find specific orders by number or customer name
3. Filter by status to see orders in different stages
4. Click "View Details" to see full order information
5. Update order status using the quick action buttons:
   - **Pending** → New order received
   - **Processing** → Order being prepared
   - **Shipped** → Order sent to customer
   - **Delivered** → Order received by customer
   - **Cancelled** → Order cancelled

## Security Features

### Admin Verification
- All admin routes check for `is_admin = true` in user_profiles
- Non-admin users are redirected to homepage
- Unauthenticated users are redirected to sign-in page

### Row Level Security
- Storage policies ensure only admins can upload/delete images
- Product operations are restricted to admin users
- Order viewing and status updates require admin privileges

### Data Protection
- Image uploads are validated by file type and size
- All database operations use parameterized queries
- Admin actions can be logged for audit purposes

## Next Steps

### Immediate Setup
1. ✅ Create your admin account using one of the methods above
2. ✅ Sign in to the app
3. ✅ Navigate to `/admin` to access the dashboard
4. ✅ Add your first product to test the system

### Populate Your Store
1. Add real products with actual images
2. Set up color and size variants
3. Configure stock quantities
4. Add product features and descriptions

### Test Order Flow
Once you have products:
1. Create customer-facing product pages (next feature)
2. Test the shopping cart functionality
3. Complete checkout process
4. View and manage orders in admin panel

## Troubleshooting

### Can't Access Admin Panel
- Check if your user has `is_admin = true` in the database
- Sign out and sign in again to refresh session
- Check browser console for any errors

### Image Upload Fails
- Ensure file size is under 5MB
- Check file format (JPEG, PNG, WebP, GIF only)
- Verify storage bucket exists in Supabase

### Products Not Showing
- Check if products were created successfully in database
- Verify product_images table has image URLs
- Check browser console for Supabase errors

### Order Status Not Updating
- Ensure you're an admin user
- Check network tab for API errors
- Verify orders table exists in database

## Database Tables

### Products
- `products` - Main product information
- `product_images` - Product image URLs with display order
- `product_colors` - Available color variants
- `product_sizes` - Available size variants with stock
- `product_features` - Product feature tags

### Orders
- `orders` - Order header with customer and total
- `order_items` - Individual items in each order

### Users
- `user_profiles` - User profile with is_admin flag
- `user_addresses` - Customer shipping addresses

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify database tables exist in Supabase
3. Check that RLS policies are correctly set up
4. Ensure storage bucket `product-images` exists

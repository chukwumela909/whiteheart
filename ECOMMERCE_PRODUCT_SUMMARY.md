# Whiteheart E-commerce Platform

## Overview

This project is a modern web-based e-commerce platform for Whiteheart brand caps and accessories. The system features passwordless authentication using OTP (One-Time Password) verification, comprehensive product management, shopping cart functionality, and an admin panel for inventory management.

## Key Users

- Customers (primary users - browse, purchase products)
- Administrators (manage products, orders, and inventory via Supabase assignment)

## 3.3.1 Functional Requirements

Below are the core features and actions the system will support once implemented.

### 1. User Authentication (Passwordless)

**New User Registration:**
- The system shall allow users to register by providing only their email address.
- Upon email submission, an OTP (One-Time Password) shall be sent to the user's email.
- The system shall verify the OTP and automatically authenticate the user upon successful verification.
- No password creation or storage is required.

**Returning User Login:**
- The system shall allow existing users to log in using only their email address.
- An OTP shall be sent to the registered email address.
- Upon successful OTP verification, the system shall authenticate the user and fetch their profile data.
- User session shall be maintained across pages until logout.

### 2. User Profile Management

- Users shall be able to view and update their profile information including:
  - First name and last name
  - Email address (view only, used for authentication)
- Users shall be able to add, edit, and delete multiple delivery addresses with details:
  - Address line 1 and 2 (apartment/suite)
  - City and postal code
  - Country/region selection
  - Phone number with country code
  - Default address designation
- The system shall display "No addresses added" when no addresses exist.

### 3. Product Browsing and Details

- Users shall be able to browse products on the homepage with:
  - Product images with carousel navigation
  - Product name, price, and basic information
  - Category filtering
- Users shall be able to view detailed product pages including:
  - Multiple product images with swipe/arrow navigation
  - Product name, price, and tax information
  - Feature tags (weight, materials, special editions)
  - Color selection with visual swatches
  - Size selection (XS, S, M, L, XL)
  - Size guide modal with measurements and instructions
  - Add to Bag functionality

### 4. Shopping Cart Management

- Users shall be able to add products to their shopping cart with:
  - Selected color and size
  - Quantity specification
- The system shall provide a cart sidebar displaying:
  - Cart icon badge showing item count
  - Product thumbnails and details
  - Individual item prices and quantities
  - Subtotal calculation
  - Empty cart state with "Continue shopping" option
- Users shall be able to:
  - View cart contents by clicking the cart icon
  - Update item quantities
  - Remove items from cart
  - Proceed to checkout

### 5. Checkout Process

- The system shall guide users through checkout with:
  - Order summary with all cart items
  - Delivery address selection or addition
  - Payment method integration
  - Order confirmation
- Users must be authenticated to proceed with checkout.

### 6. Order Management

- Users shall be able to view their order history on the Orders page.
- The system shall display "No orders yet" for users without purchase history.
- Order details shall include:
  - Order date and order number
  - Product details (name, color, size, quantity)
  - Shipping address
  - Order status and tracking information

### 7. Admin Panel (Supabase-Managed Access)

**Admin Assignment:**
- Administrators shall be assigned roles directly in Supabase database.
- Only users with admin role can access admin functionalities.

**Product Management:**
- Admins shall be able to add new products with:
  - Product name, description, and price
  - Multiple product images upload
  - Available colors with hex codes
  - Available sizes
  - Feature tags and specifications
  - Stock quantity
  - Category assignment
- Admins shall be able to edit existing products:
  - Update product information
  - Modify pricing
  - Change product images
  - Update inventory levels
- Admins shall be able to delete products from the catalog.
- The system shall provide a product list view with search and filter capabilities.

**Order Management (Admin):**
- Admins shall be able to view all customer orders.
- Admins shall be able to update order status.
- The system shall provide order analytics and reports.

### 8. Navigation and User Experience

- The system shall provide a responsive navigation bar with:
  - Whiteheart logo (redirects to homepage)
  - Shop, Magazine, and Customer Service links
  - Search functionality
  - User account icon (redirects to authentication)
  - Shopping cart icon with item count badge
- Mobile users shall have access to a hamburger menu with sidebar navigation.
- The system shall maintain consistent branding using custom fonts (Dancing Script, Simon).

### 9. Modals and Overlays

- The system shall provide modal interfaces for:
  - Edit Profile (name editing)
  - Add/Edit Address
  - Size Guide (product-specific)
  - Shopping Cart sidebar
- All modals shall include:
  - Backdrop blur effect
  - Close button (X icon)
  - Appropriate action buttons (Save, Cancel)

## Suggested Database Tables

### Authentication & Users
- **users**: id, email, created_at, updated_at, is_admin
- **otp_verifications**: id, user_id, otp_code, expires_at, verified, created_at

### User Profile
- **user_profiles**: id, user_id, first_name, last_name, phone, created_at, updated_at
- **user_addresses**: id, user_id, first_name, last_name, company, address_line1, address_line2, city, postal_code, country, phone, phone_country_code, is_default, created_at, updated_at

### Products
- **products**: id, name, description, price, currency, tax_info, category, stock_quantity, created_at, updated_at, created_by_admin_id
- **product_images**: id, product_id, image_url, display_order, created_at
- **product_colors**: id, product_id, color_name, hex_code, created_at
- **product_sizes**: id, product_id, size_name, stock_quantity, created_at
- **product_features**: id, product_id, feature_label, created_at

### Shopping Cart & Orders
- **cart_items**: id, user_id, product_id, color_id, size_id, quantity, created_at, updated_at
- **orders**: id, user_id, order_number, total_amount, currency, status, shipping_address_id, created_at, updated_at
- **order_items**: id, order_id, product_id, color_name, size_name, quantity, unit_price, subtotal, created_at

### Admin Activity Log
- **admin_logs**: id, admin_user_id, action_type, entity_type, entity_id, details, created_at

## Acceptance Criteria

### Authentication
- ✅ Users can register with email only (no password required).
- ✅ OTP is sent to user email for verification.
- ✅ New users are automatically authenticated after OTP verification.
- ✅ Returning users can log in using email + OTP.
- ✅ User session persists across page navigation.
- ✅ Users can log out and session is cleared.

### User Profile
- ✅ Users can view and edit their name (first and last).
- ✅ Users can add multiple delivery addresses with all required fields.
- ✅ Users can set a default address.
- ✅ Users can edit and delete existing addresses.
- ✅ Empty state is shown when no addresses exist.

### Product Browsing
- ✅ Homepage displays product catalog with images and prices.
- ✅ Product detail page shows comprehensive product information.
- ✅ Users can select colors and sizes before adding to cart.
- ✅ Size guide modal provides accurate measurements and instructions.
- ✅ Product images support carousel/swipe navigation.

### Shopping Cart
- ✅ Cart icon shows accurate item count badge.
- ✅ Cart sidebar slides in from right when cart icon is clicked.
- ✅ Empty cart state displays "Your bag is currently empty" message.
- ✅ Cart displays all added items with thumbnails and details.
- ✅ Users can update quantities or remove items.
- ✅ Subtotal is calculated correctly.

### Orders
- ✅ Users can view their order history.
- ✅ Empty state shows "No orders yet" for new users.
- ✅ Order details include all relevant information (products, shipping, status).

### Admin Panel
- ✅ Only users with admin role (assigned in Supabase) can access admin features.
- ✅ Admins can add new products with all required fields.
- ✅ Admins can edit existing product information.
- ✅ Admins can delete products from catalog.
- ✅ Product management interface is intuitive and efficient.
- ✅ All admin actions are logged for audit purposes.

### UI/UX
- ✅ Application is fully responsive (mobile, tablet, desktop).
- ✅ Consistent branding with custom fonts throughout.
- ✅ Modals include backdrop blur and smooth animations.
- ✅ All interactive elements have hover states.
- ✅ Navigation is intuitive and accessible.

## Tech Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Fonts**: Dancing Script (logo/branding), Simon (body text)

### Backend & Database
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with OTP (email magic links)
- **Storage**: Supabase Storage (product images)
- **API**: Next.js API Routes

### Additional Services
- **Email**: Supabase Auth Email (OTP delivery)
- **Image Hosting**: Cloudinary or Supabase Storage

## Security Considerations

- **Passwordless Authentication**: No passwords to store or manage, reducing security risks.
- **OTP Expiration**: OTP codes expire after a set time (e.g., 10 minutes).
- **Role-Based Access**: Admin privileges managed through Supabase RLS (Row Level Security).
- **Data Privacy**: User data protected with appropriate database policies.
- **Session Management**: Secure session handling with automatic expiration.
- **Input Validation**: All user inputs sanitized and validated.

## Next Steps

1. **Database Setup**
   - Create Supabase project and configure database schema
   - Set up Row Level Security policies
   - Create database migrations

2. **Authentication Implementation**
   - Configure Supabase Auth for OTP/magic links
   - Implement sign-up and sign-in flows
   - Set up session management

3. **Core Features Development**
   - Build product catalog and detail pages
   - Implement shopping cart functionality
   - Create user profile and address management
   - Develop checkout flow

4. **Admin Panel Development**
   - Create admin dashboard
   - Implement product CRUD operations
   - Build order management interface
   - Add analytics and reporting

5. **Testing & Deployment**
   - Unit testing for critical functions
   - Integration testing for user flows
   - Performance optimization
   - Deploy to production (Vercel)

## Notes

- **Currency Support**: Currently set to EUR; consider multi-currency support for international expansion.
- **Shipping Integration**: Future enhancement to integrate with shipping providers.
- **Payment Gateway**: Stripe or PayPal integration for secure payments.
- **Email Notifications**: Order confirmations, shipping updates, and promotional emails.
- **Analytics**: Google Analytics or similar for tracking user behavior and sales metrics.
- **SEO Optimization**: Product pages optimized for search engines.
- **Accessibility**: Ensure WCAG compliance for all users.
- **Mobile App**: Consider React Native app for iOS/Android in future phases.

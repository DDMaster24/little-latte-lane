# Little Latte Lane - Deployment Guide

## Environment Variables

Before deploying to Vercel, make sure to add these environment variables in your Vercel dashboard:

### Required Environment Variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key

## Deployment Steps:

1. **Push to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Production ready - all issues fixed"
   git push origin main
   ```

2. **Deploy to Vercel**:
   - Visit [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Add environment variables
   - Deploy!

## Features Included:

✅ Full restaurant management system
✅ User authentication with Supabase
✅ Menu management with categories
✅ Shopping cart with checkout
✅ Order management system
✅ Booking system for golf simulator
✅ Admin dashboard with analytics
✅ Staff kitchen dashboard
✅ Responsive neon-themed design
✅ PWA support
✅ Real-time updates

## Database Setup:

Make sure your Supabase database has the following tables:
- `profiles` (user profiles with roles)
- `categories` (menu categories)
- `menu_items` (menu items with stock)
- `orders` (customer orders)
- `order_items` (order line items)
- `bookings` (golf simulator bookings)
- `requests` (staff requests)

## Admin Access:

Create an admin user by:
1. Signing up normally
2. In Supabase, update the user's profile role to 'admin'
3. Staff users should have role 'staff'

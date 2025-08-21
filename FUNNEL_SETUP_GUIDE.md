# Post-Quiz Funnel Setup Guide

## 🎯 Overview
This guide covers the complete setup for the post-quiz funnel, including Stripe configuration, asset requirements, and deployment steps.

## 🔧 Stripe Configuration

### 1. Create Stripe Products
In your Stripe Dashboard, create these individual products:

#### Individual Products:
1. **Toolkit Product**
   - **Product Name**: "Influence Style Toolkit"
   - **Price**: $79
   - **Description**: "Complete influence style toolkit with style-specific content"

2. **Influence Engine™ Product**
   - **Product Name**: "The Influence Engine™"
   - **Price**: $499
   - **Description**: "AI-powered influence coaching platform"

3. **Book Product**
   - **Product Name**: "Influence First: Why Your Deals Are Dying"
   - **Price**: $19
   - **Description**: "Field guide for mastering deals and influence"

4. **Engine Bundle Product**
   - **Product Name**: "Influence Engine™ Bundle"
   - **Price**: $547
   - **Description**: "Complete package: Engine + Toolkit + Book"

5. **Mastery Bundle Product**
   - **Product Name**: "Influence Mastery Bundle"
   - **Price**: $347
   - **Description**: "Mastery package: Toolkit + Book"

#### Product Metadata:
Each product can include metadata for tracking:
- `toolkit_style`: The user's influence style (for toolkit purchases)
- `source_*`: Source tracking information
- `ndaSigned`: "true" or "false"

### 2. Environment Variables
Ensure these are set in your `.env.local`:
```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_BASE_URL=http://localhost:3001

# Stripe Price IDs (get these from your Stripe Dashboard)
STRIPE_TOOLKIT_PRICE_ID=price_...
STRIPE_ENGINE_PRICE_ID=price_...
STRIPE_BOOK_PRICE_ID=price_...
STRIPE_BUNDLE_ENGINE_PRICE_ID=price_...
STRIPE_BUNDLE_MASTERY_PRICE_ID=price_...
```

## 🖼️ Asset Requirements

### Required Assets
The funnel now uses **influence style icons** and **emoji icons** for product displays. However, you may want to add these assets for future enhancements:

#### Product Images (Optional - for future use)
If you want to replace the emoji icons with real images later:
```
public/assets/funnel/
├── toolkit-covers/
│   ├── catalyst-toolkit.png
│   ├── diplomat-toolkit.png
│   ├── anchor-toolkit.png
│   ├── navigator-toolkit.png
│   └── connector-toolkit.png
├── products/
│   ├── influence-engine-screenshot.png
│   ├── book-cover.png
│   ├── bundle-engine-graphic.png
│   └── bundle-mastery-graphic.png
└── videos/
    └── influence-engine-demo.mp4
```
**Specifications:**
- **Toolkit Covers**: 400x600px (2:3 ratio), PNG format
- **Product Images**: 400x600px (2:3 ratio), PNG format  
- **Demo Video**: 2-3 minutes, MP4 format, 720p minimum

#### Videos (Optional but Recommended)
```
public/assets/funnel/videos/
└── influence-engine-demo.mp4
```
**Specifications:**
- Duration: 2-3 minutes
- Format: MP4
- Quality: 720p minimum
- Content: Demo of the Influence Engine™ features

### Current Implementation
- **Toolkit Covers**: Uses real toolkit cover images from `/assets/funnel/toolkit-covers/`
- **Engine Offer**: Uses real engine screenshot from `/assets/funnel/product-images/`
- **Book Offer**: Uses real book cover from `/assets/funnel/product-images/`  
- **Bundle Offers**: Uses real bundle graphics from `/assets/funnel/product-images/`
- **Checkout**: Shows order summary with real product images
- **Demo Video**: Uses real demo video from `/assets/funnel/videos/`

## 📊 Database Setup

### Required Tables
Ensure these tables exist in your Supabase database:

1. **influence_profiles** - Contains snapshot and full profiles
2. **influence_users** - User data and quiz results (with existing NDA columns)
3. **quiz_selections** - Individual quiz answers
4. **funnel_steps** - Funnel progression tracking
5. **user_tags** - User tagging system
6. **funnel_products** - Product selection tracking
7. **checkout_sessions** - Stripe session tracking

### Existing Columns Used
The funnel reuses existing columns in the `influence_users` table:
- `nda_signed` - Boolean for NDA agreement status
- `nda_signed_at` - Timestamp when NDA was signed
- `nda_digital_signature` - Text input for digital signature
- `source_tracking` - JSONB for source attribution data

### Run Migrations
Execute these SQL files in your Supabase SQL editor:
- `database_migration.sql`
- `quiz_analytics_table.sql`

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] Stripe products created
- [ ] All assets uploaded to correct directories
- [ ] Database migrations executed
- [ ] Environment variables configured
- [ ] Funnel flow tested end-to-end

### Testing Checklist
- [ ] Quiz completion redirects to funnel
- [ ] Snapshot profile displays correctly
- [ ] Toolkit offer shows style-specific content
- [ ] Engine offer displays with demo video
- [ ] Book offer displays correctly
- [ ] Bundle offers change based on Engine selection
- [ ] Order summary displays selected products with images
- [ ] Stripe checkout session creates successfully
- [ ] Success page displays after payment

### Post-Deployment
- [ ] Monitor Stripe webhook events
- [ ] Check database for user data
- [ ] Verify analytics tracking
- [ ] Test email notifications (if configured)

## 🔍 Troubleshooting

### Common Issues

1. **Images not loading**
   - Check file paths and names
   - Verify file permissions
   - Check browser console for 404 errors

2. **Stripe checkout fails**
   - Verify Stripe keys are correct
   - Check Stripe dashboard for errors
   - Ensure product exists in Stripe

3. **Database errors**
   - Run migrations again
   - Check table permissions
   - Verify RLS policies

4. **Funnel not advancing**
   - Clear browser localStorage
   - Check console for JavaScript errors
   - Verify API endpoints are working

## 📈 Analytics & Tracking

### Tags Applied
The funnel automatically applies these tags:
- `SNAPSHOT_DELIVERED`
- `STYLE_[TYPE]` (e.g., `STYLE_CATALYST`)
- `PROD_TOOLKIT`, `PROD_ENGINE`, `PROD_BOOK`
- `NO_TOOLKIT`, `NO_ENGINE`, `NO_BOOK`
- `BUNDLE_PURCHASED`
- `DEMO_REENGAGE` (if demo <80% watched)

### Source Tracking
The checkout form collects:
- How did you hear about us?
- REIA event details
- Social media platform
- Referral source
- Other source details

## 🎨 Customization

### Styling
- Colors: Primary `#92278F`, Secondary `#a83399`
- Font: System fonts (Inter recommended)
- Components: Uses shadcn/ui components

### Content
- Update copy in individual component files
- Modify pricing in `lib/utils/post-quiz-funnel-state.ts`
- Adjust product descriptions in components

### Logic
- Funnel flow: `app/post-quiz-funnel/page.tsx`
- State management: `lib/utils/post-quiz-funnel-state.ts`
- API endpoints: `app/api/post-quiz-funnel/`

## 📞 Support

For technical issues:
1. Check browser console for errors
2. Review server logs
3. Verify database connections
4. Test API endpoints individually

For content changes:
1. Update component files directly
2. Modify state management logic
3. Adjust Stripe product metadata

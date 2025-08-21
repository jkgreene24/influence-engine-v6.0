# Post-Quiz Funnel Implementation

## Overview

This document outlines the comprehensive post-quiz funnel implementation for The Influence Engine™. The funnel is designed as a step-by-step guided flow where users make Yes/No decisions for each product offer before proceeding to checkout.

## Architecture

### Database Changes

#### New Tables Added:
1. **funnel_steps** - Tracks user progress through the funnel
2. **user_tags** - Comprehensive tagging system for analytics and re-engagement
3. **funnel_products** - Tracks product selections and declines
4. **funnel_analytics** - Detailed analytics for funnel optimization
5. **checkout_sessions** - Tracks Stripe checkout sessions

#### New Columns Added to users table:
- `funnel_step` - Current step in the funnel
- `funnel_completed` - Whether funnel is completed
- `funnel_started_at` - When funnel started
- `funnel_completed_at` - When funnel completed
- `demo_watch_percentage` - Demo video watch percentage
- `member_agreement_signed` - Whether member agreement is signed
- `member_agreement_signed_at` - When member agreement was signed

### Stripe Integration

#### Single Product Approach
- Uses one Stripe product with metadata for different toolkit styles
- Product metadata includes:
  - `product_types` - Comma-separated list of selected products
  - `toolkit_style` - User's influence style for toolkit personalization
  - `source_*` - Source tracking information
  - `member_agreement_signed` - Whether agreement is signed

#### Product SKUs:
- `IE_TOOLKIT_[STYLE]` - Style-specific toolkit (e.g., IE_TOOLKIT_CATALYST)
- `INFLUENCE_ENGINE_1YR` - Annual membership
- `BOOK_INFLUENCE_FIRST` - Book
- `BUNDLE_ENGINE` - Engine bundle ($547)
- `BUNDLE_MASTERY` - Mastery bundle ($347)

## Funnel Flow

### Step 1: Snapshot Delivery
- **Purpose**: Deliver quiz results and introduce the funnel
- **Tags**: `SNAPSHOT_DELIVERED`, `STYLE_[TYPE]`
- **Action**: User clicks "Unlock My Full Toolkit"

### Step 2: Toolkit Offer
- **Purpose**: Offer style-specific toolkit
- **Dynamic Content**: Header and cover image based on user's influence style
- **Price**: $79 (normally $119)
- **Tags**: `PROD_TOOLKIT` (if selected), `NO_TOOLKIT` (if declined)
- **Actions**: "Unlock My Full Toolkit" or "No thanks, continue"

### Step 3: Influence Engine™
- **Purpose**: Offer the main product with demo video
- **Price**: $499 (normally $997)
- **Demo Tracking**: Tracks watch percentage, tags `DEMO_REENGAGE` if <80%
- **Member Agreement**: Required for purchase
- **Tags**: `PROD_IE` (if selected), `NO_IE` (if declined)
- **Actions**: "Yes, add the Influence Engine™" or "No thanks"

### Step 4: Book Offer
- **Purpose**: Add-on book offer
- **Price**: $19 (normally $29)
- **Tags**: `PROD_BOOK` (if selected), `NO_BOOK` (if declined)
- **Actions**: "Yes, add the book" or "No thanks"

### Step 5: Bundle Offers
- **Purpose**: Bundle offer based on engine selection
- **Dynamic Logic**: 
  - If Engine selected → Engine Bundle ($547)
  - If Engine declined → Mastery Bundle ($347)
- **Tags**: `PROD_BUNDLE_[TYPE]` (if selected), `NO_BUNDLE` (if declined)
- **Actions**: "Yes, add the bundle" or "No thanks, continue"

### Step 6: Checkout
- **Purpose**: Final checkout with comprehensive form
- **Required Fields**: Name, Email, Phone
- **Optional Fields**: Company, Role/Title
- **Source Tracking**: "How did you hear about us?" with conditional fields
- **Member Agreement**: Scroll-to-sign for Engine buyers
- **Action**: "Complete Order"

### Step 7: Success
- **Purpose**: Order confirmation and next steps
- **Content**: Order summary, next steps, contact information

## Key Features

### Comprehensive Tagging System
- **Style Tags**: `STYLE_CATALYST`, `STYLE_DIPLOMAT`, etc.
- **Product Tags**: `PROD_TOOLKIT`, `PROD_IE`, `PROD_BOOK`, `PROD_BUNDLE`
- **Decline Tags**: `NO_TOOLKIT`, `NO_IE`, `NO_BOOK`, `NO_BUNDLE`
- **Source Tags**: `SRC_REIA_[EVENT]`, `SRC_SOCIAL_[PLATFORM]`, `SRC_REFERRAL_[NAME]`
- **Demo Tags**: `DEMO_REENGAGE` (if <80% watched)
- **Step Tags**: `[STEP]_COMPLETED`, `[STEP]_STARTED`

### Dynamic Content
- **Style-Specific Toolkit**: Different headers and covers based on influence style
- **Bundle Logic**: Different bundles based on engine selection
- **Source Tracking**: Conditional form fields based on source selection

### Analytics & Tracking
- **Funnel Analytics**: Every user action is tracked
- **Demo Progress**: Video watch percentage tracking
- **Product Selections**: Detailed tracking of Yes/No decisions
- **Source Attribution**: Comprehensive source tracking for marketing

### Cart Management
- **Dynamic Cart**: Products added/removed based on selections
- **Bundle Override**: Bundle selections replace individual items
- **Price Calculation**: Automatic total calculation

## API Endpoints

### `/api/post-quiz-funnel`
Handles all funnel state management:
- `select_product` - Add product to cart
- `decline_product` - Decline product offer
- `update_demo_progress` - Update demo watch percentage
- `sign_member_agreement` - Sign member agreement
- `move_to_next_step` - Move to next funnel step
- `select_bundle` - Select bundle type
- `update_source_tracking` - Update source information

### `/api/create-post-quiz-checkout`
Creates Stripe checkout session:
- Single product with metadata
- Source tracking included
- Member agreement status included
- Cart consolidation

## Environment Variables

### Stripe Configuration
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_TOOLKIT_PRICE_ID=price_...
STRIPE_IE_ANNUAL_PRICE_ID=price_...
STRIPE_BOOK_PRICE_ID=price_...
STRIPE_BUNDLE_ENGINE_PRICE_ID=price_...
STRIPE_BUNDLE_MASTERY_PRICE_ID=price_...
```

### Application Configuration
```env
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Database Migration

Run the following SQL to set up the database:

```sql
-- Add new columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS funnel_step VARCHAR(50) DEFAULT 'snapshot';
ALTER TABLE users ADD COLUMN IF NOT EXISTS funnel_completed BOOLEAN DEFAULT FALSE;
-- ... (see database_migration.sql for complete migration)
```

## File Structure

```
app/
├── post-quiz-funnel/
│   ├── page.tsx                    # Main funnel page
│   └── components/
│       ├── SnapshotDelivery.tsx    # Step 1
│       ├── ToolkitOffer.tsx        # Step 2
│       ├── EngineOffer.tsx         # Step 3
│       ├── BookOffer.tsx           # Step 4
│       ├── BundleOffer.tsx         # Step 5
│       ├── Checkout.tsx            # Step 6
│       └── Success.tsx             # Step 7
├── api/
│   ├── post-quiz-funnel/
│   │   └── route.ts                # Funnel state management
│   └── create-post-quiz-checkout/
│       └── route.ts                # Stripe checkout creation
lib/
└── utils/
    ├── post-quiz-funnel-state.ts   # State management
    └── influence-icons.tsx         # Icon utilities
```

## Usage

### Starting the Funnel
After quiz completion, users are automatically redirected to `/post-quiz-funnel`.

### State Management
The funnel uses both localStorage and database for state persistence:
- **localStorage**: Immediate state for smooth UX
- **Database**: Persistent state for analytics and recovery

### Analytics Integration
All user actions are tracked and can be used for:
- Funnel optimization
- A/B testing
- Re-engagement campaigns
- Marketing attribution

## Testing

### Manual Testing Checklist
- [ ] Quiz completion redirects to funnel
- [ ] Each step displays correctly
- [ ] Product selections update cart
- [ ] Bundle logic works correctly
- [ ] Demo tracking functions
- [ ] Source tracking captures data
- [ ] Checkout creates Stripe session
- [ ] Success page displays correctly

### Automated Testing
Consider implementing tests for:
- State management functions
- API endpoints
- Component rendering
- User flow validation

## Deployment Notes

1. **Database Migration**: Run migration before deployment
2. **Stripe Configuration**: Set up all required price IDs
3. **Environment Variables**: Configure all required env vars
4. **File Assets**: Ensure all images and videos are available
5. **Domain Configuration**: Update success/cancel URLs

## Support & Maintenance

### Common Issues
- **State Loss**: Check localStorage and database sync
- **Stripe Errors**: Verify price IDs and webhook configuration
- **Analytics Gaps**: Ensure all API calls are successful

### Monitoring
- Monitor funnel conversion rates
- Track demo completion rates
- Analyze source attribution
- Monitor Stripe webhook success rates

## Future Enhancements

1. **A/B Testing**: Different offer sequences
2. **Personalization**: Dynamic pricing based on user behavior
3. **Upsells**: Additional offers during checkout
4. **Retargeting**: Re-engagement campaigns for declined offers
5. **Analytics Dashboard**: Real-time funnel performance

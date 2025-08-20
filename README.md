# Influence Engine™ Phase 1 Master Build

A complete commercial launch funnel implementation for The Influence Engine™ with source tracking, pricing tokens, and automation integration.

## 🚀 Features

### Complete Funnel Flow
- **Step 1**: Lead Capture with source tracking
- **Step 2**: Quiz Entry with influence style assessment
- **Step 3**: Quiz Results with style snapshot
- **Step 4**: Toolkit Offer ($79)
- **Step 5**: Book Offer ($19) - skipped if SRC_BOOK
- **Step 6**: Influence Engine™ Offer ($499/year)
- **Step 6.5**: Bundle Offer ($497) - shown if 2+ declines
- **Step 7**: Checkout with Member Access Agreement
- **Step 8**: Success page

### Source Tracking
- REIA Event (with required REIA name)
- Social Media (Facebook, LinkedIn, Instagram, TikTok)
- Referral (with required referrer name)
- Word of Mouth (optional details)
- Other (optional specification)
- UTM parameter capture
- Special SRC_BOOK tracking

### Pricing System
- Token-based pricing for easy updates
- Dynamic price replacement in copy
- Support for multiple product tiers
- Bundle pricing with automatic discounts

### Automation Integration
- Mock automation service for testing
- Real-time event tracking
- Source tagging
- Product selection tracking
- Purchase completion tracking
- Nurture sequence triggers

## 📁 Project Structure

```
quick-quiz/
├── app/
│   ├── page.tsx                    # Main entry page with source tracking
│   ├── funnel/
│   │   ├── page.tsx               # Main funnel controller
│   │   └── components/
│   │       ├── QuizEntry.tsx      # Quiz questions and logic
│   │       ├── QuizResults.tsx    # Style snapshot display
│   │       ├── ToolkitOffer.tsx   # Toolkit offer page
│   │       ├── BookOffer.tsx      # Book offer page
│   │       ├── IEOffer.tsx        # Influence Engine offer
│   │       ├── BundleOffer.tsx    # Bundle offer page
│   │       ├── Checkout.tsx       # Checkout with agreement
│   │       └── Success.tsx        # Success page
│   ├── test-funnel/
│   │   └── page.tsx               # Test page for funnel flow
│   └── api/
│       └── create-checkout-session/
│           └── route.ts           # Stripe checkout integration
├── lib/
│   └── utils/
│       ├── pricing.ts             # Pricing configuration
│       ├── funnel-state.ts        # Funnel state management
│       └── mock-automation.ts     # Mock automation service
└── components/
    └── ui/                        # UI components
```

## 🛠️ Setup Instructions

### 1. Environment Variables
Create a `.env.local` file with the following variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_BOOK_PRICE_ID=price_book_id
STRIPE_TOOLKIT_PRICE_ID=price_toolkit_id
STRIPE_IE_ANNUAL_PRICE_ID=price_ie_annual_id
STRIPE_BUNDLE_PRICE_ID=price_bundle_id

# App
NEXT_PUBLIC_BASE_URL=http://localhost:3001
```

### 2. Install Dependencies
```bash
npm install
# or
pnpm install
```

### 3. Run Development Server
```bash
npm run dev
# or
pnpm dev
```

The app will be available at `http://localhost:3001`

## 🧪 Testing the Funnel

### Test Page
Visit `/test-funnel` to run a complete funnel test with mock automation tracking.

### Manual Testing
1. Visit the main page (`/`)
2. Fill out the lead capture form with source tracking
3. Complete the quiz to get your influence style
4. Navigate through the offer sequence
5. Complete checkout (mock Stripe integration)

## 💰 Pricing Configuration

Pricing is managed through tokens in `lib/utils/pricing.ts`:

```typescript
export const PRICING_TOKENS = {
  Book: 19,
  Toolkit: 79,
  IE_Annual: 499,
  IE_Standard: 997,
  Bundle: 497,
  Bundle_Standard: 597,
  MidTier: 199,
}
```

To update prices, simply change the values in this object. All copy will automatically update using the `replacePricingTokens()` function.

## 🔄 Automation Integration

The funnel includes a mock automation service that simulates third-party API calls:

### Events Tracked
- `TAG_ADDED` - Source tracking tags
- `QUIZ_STARTED` - Quiz initiation
- `QUIZ_COMPLETED` - Quiz completion
- `PRODUCT_SELECTED` - Product acceptance
- `PRODUCT_DECLINED` - Product decline
- `PURCHASE_COMPLETED` - Purchase completion

### Tags Generated
- `SRC_REIA_[Name]` - REIA event source
- `SRC_SOCIAL_[Platform]` - Social media source
- `SRC_REFERRAL_[Name]` - Referral source
- `SRC_WORDMOUTH` - Word of mouth
- `SRC_OTHER` - Other sources
- `SRC_BOOK` - Book link source
- `STYLE_[Style]` - Influence style
- `WANT_[Product]` - Product wanted
- `NO_[Product]` - Product declined
- `PROD_[Product]` - Product purchased

## 🎯 Funnel Logic

### Conditional Flow
- **Book Offer**: Skipped if `SRC_BOOK` is true
- **Bundle Offer**: Shown if 2+ products declined
- **Checkout**: Includes Member Access Agreement
- **Digital Signature**: Required for Influence Engine™ purchases

### State Management
Funnel state is managed in localStorage and includes:
- User progress through steps
- Quiz results (influence style)
- Product selections and declines
- Cart contents
- Source tracking data

## 🔧 Customization

### Adding New Products
1. Add pricing token to `PRICING_TOKENS`
2. Add product definition to `PRODUCTS`
3. Create offer component
4. Update funnel logic in `funnel-state.ts`

### Modifying Quiz Logic
1. Update questions in `QuizEntry.tsx`
2. Add new style definitions in `QuizResults.tsx`
3. Update routing logic as needed

### Changing Automation
1. Replace mock service with real API calls
2. Update event tracking in components
3. Configure webhooks for real-time updates

## 📊 Analytics & Tracking

The funnel tracks comprehensive data for analytics:

### User Data
- Contact information
- Company and role
- Source attribution
- UTM parameters

### Behavioral Data
- Quiz responses and style
- Product preferences
- Purchase decisions
- Funnel progression

### Source Attribution
- Detailed source tracking
- Referrer information
- Campaign attribution
- Conversion tracking

## 🚀 Deployment

### Production Setup
1. Set up production environment variables
2. Configure Stripe webhooks
3. Set up automation service integration
4. Configure domain and SSL

### Monitoring
- Funnel conversion rates
- Source attribution performance
- Product preference analysis
- Automation sequence effectiveness

## 📝 License

This project is proprietary software for The Influence Engine™. All rights reserved.

## 🤝 Support

For technical support or questions about the implementation, please contact the development team.

---

**The Influence Engine™** - AI-Powered Leadership Coaching

// Post-Quiz Funnel State Management
// Comprehensive state management for the new step-by-step funnel

export interface PostQuizFunnelState {
  // User identification
  userId: number;
  userEmail: string;
  
  // Current step in the funnel
  currentStep: FunnelStep;
  
  // Quiz results
  influenceStyle: string;
  secondaryStyle?: string;
  isBlend: boolean;
  
  // Product selections and declines
  products: {
    toolkit: ProductState;
    engine: ProductState;
    book: ProductState;
    bundle: ProductState;
  };
  
  // Demo tracking
  demo: {
    watched: boolean;
    watchPercentage: number;
    skipped: boolean;
  };
  
  // NDA agreement (using existing columns)
  ndaAgreement: {
    signed: boolean;
    signedAt?: string;
  };
  
  // Source tracking
  sourceTracking: SourceTracking;
  
  // Cart state (for Stripe)
  cart: CartItem[];
  
  // Analytics and tagging
  tags: string[];
  
  // Timestamps
  funnelStartedAt: string;
  lastUpdatedAt: string;
}

export type FunnelStep = 
  | 'snapshot' 
  | 'toolkit' 
  | 'engine' 
  | 'book' 
  | 'bundle' 
  | 'checkout' 
  | 'success';

export interface ProductState {
  offered: boolean;
  selected: boolean;
  declined: boolean;
  selectedAt?: string;
  declinedAt?: string;
  stripeSku?: string;
  price?: number;
}

export interface CartItem {
  type: 'toolkit' | 'engine' | 'book' | 'bundle_engine' | 'bundle_mastery';
  stripeSku: string;
  price: number;
  stripePriceId?: string;
  metadata?: Record<string, any>;
}

export interface SourceTracking {
  source?: string;
  reiaName?: string;
  socialPlatform?: string;
  referrerName?: string;
  otherSource?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

// Product configurations with Stripe Price IDs
export const PRODUCT_CONFIGS = {
  toolkit: {
    sku: 'IE_TOOLKIT',
    price: 79,
    stripePriceId: process.env.STRIPE_TOOLKIT_PRICE_ID,
  },
  engine: {
    sku: 'INFLUENCE_ENGINE_1YR',
    price: 499,
    stripePriceId: process.env.STRIPE_ENGINE_PRICE_ID,
  },
  book: {
    sku: 'BOOK_INFLUENCE_FIRST',
    price: 19,
    stripePriceId: process.env.STRIPE_BOOK_PRICE_ID,
  },
  bundle_engine: {
    sku: 'BUNDLE_ENGINE',
    price: 547,
    stripePriceId: process.env.STRIPE_BUNDLE_ENGINE_PRICE_ID,
  },
  bundle_mastery: {
    sku: 'BUNDLE_MASTERY',
    price: 347,
    stripePriceId: process.env.STRIPE_BUNDLE_MASTERY_PRICE_ID,
  },
} as const;

// Style-specific toolkit configurations
export const STYLE_TOOLKIT_CONFIGS = {
  catalyst: {
    sku: 'IE_TOOLKIT', // Use same SKU for all styles, differentiate via metadata
    header: 'Catalyst Influence Style Toolkit',
  },
  diplomat: {
    sku: 'IE_TOOLKIT',
    header: 'Diplomat Influence Style Toolkit',
  },
  anchor: {
    sku: 'IE_TOOLKIT',
    header: 'Anchor Influence Style Toolkit',
  },
  navigator: {
    sku: 'IE_TOOLKIT',
    header: 'Navigator Influence Style Toolkit',
  },
  connector: {
    sku: 'IE_TOOLKIT',
    header: 'Connector Influence Style Toolkit',
  },
} as const;

// Initial state
export function createInitialFunnelState(
  userId: number, 
  userEmail: string, 
  influenceStyle: string, 
  secondaryStyle?: string
): PostQuizFunnelState {
  return {
    userId,
    userEmail,
    currentStep: 'snapshot',
    influenceStyle,
    secondaryStyle,
    isBlend: !!secondaryStyle,
    products: {
      toolkit: { offered: false, selected: false, declined: false },
      engine: { offered: false, selected: false, declined: false },
      book: { offered: false, selected: false, declined: false },
      bundle: { offered: false, selected: false, declined: false },
    },
    demo: {
      watched: false,
      watchPercentage: 0,
      skipped: false,
    },
    ndaAgreement: {
      signed: false,
    },
    sourceTracking: {},
    cart: [],
    tags: [
      'SNAPSHOT_DELIVERED',
      `STYLE_${influenceStyle.toUpperCase()}`,
    ],
    funnelStartedAt: new Date().toISOString(),
    lastUpdatedAt: new Date().toISOString(),
  };
}

// State management functions
export function selectProduct(
  state: PostQuizFunnelState, 
  productType: keyof PostQuizFunnelState['products']
): PostQuizFunnelState {
  const updatedState = { ...state };
  
  // Update product state
  updatedState.products[productType] = {
    ...updatedState.products[productType],
    selected: true,
    declined: false,
    selectedAt: new Date().toISOString(),
  };
  
  // Add to cart
  const cartItem = getCartItemForProduct(productType, state.influenceStyle);
  if (cartItem) {
    updatedState.cart.push(cartItem);
  }
  
  // Add tag
  updatedState.tags.push(`PROD_${productType.toUpperCase()}`);
  
  // Remove decline tag if it exists
  updatedState.tags = updatedState.tags.filter(tag => tag !== `NO_${productType.toUpperCase()}`);
  
  updatedState.lastUpdatedAt = new Date().toISOString();
  return updatedState;
}

export function declineProduct(
  state: PostQuizFunnelState, 
  productType: keyof PostQuizFunnelState['products']
): PostQuizFunnelState {
  const updatedState = { ...state };
  
  // Update product state
  updatedState.products[productType] = {
    ...updatedState.products[productType],
    selected: false,
    declined: true,
    declinedAt: new Date().toISOString(),
  };
  
  // Remove from cart
  updatedState.cart = updatedState.cart.filter(item => 
    !item.type.includes(productType)
  );
  
  // Add decline tag
  updatedState.tags.push(`NO_${productType.toUpperCase()}`);
  
  // Remove selection tag if it exists
  updatedState.tags = updatedState.tags.filter(tag => tag !== `PROD_${productType.toUpperCase()}`);
  
  updatedState.lastUpdatedAt = new Date().toISOString();
  return updatedState;
}

export function updateDemoProgress(
  state: PostQuizFunnelState, 
  watchPercentage: number
): PostQuizFunnelState {
  const updatedState = { ...state };
  
  updatedState.demo.watchPercentage = watchPercentage;
  updatedState.demo.watched = watchPercentage >= 80;
  updatedState.demo.skipped = watchPercentage < 80;
  
  // Add demo engagement tag
  if (watchPercentage < 80) {
    updatedState.tags.push('DEMO_REENGAGE');
  }
  
  updatedState.lastUpdatedAt = new Date().toISOString();
  return updatedState;
}

export function signNdaAgreement(state: PostQuizFunnelState): PostQuizFunnelState {
  const updatedState = { ...state };
  
  updatedState.ndaAgreement.signed = true;
  updatedState.ndaAgreement.signedAt = new Date().toISOString();
  
  updatedState.lastUpdatedAt = new Date().toISOString();
  return updatedState;
}

export function moveToNextStep(state: PostQuizFunnelState): PostQuizFunnelState {
  const updatedState = { ...state };
  
  // Mark current step as completed
  updatedState.tags.push(`${state.currentStep.toUpperCase()}_COMPLETED`);
  
  // Determine next step
  const nextStep = getNextStep(state);
  updatedState.currentStep = nextStep;
  
  // Mark next step as started
  updatedState.tags.push(`${nextStep.toUpperCase()}_STARTED`);
  
  // Mark products as offered when reaching their step
  switch (nextStep) {
    case 'toolkit':
      updatedState.products.toolkit.offered = true;
      break;
    case 'engine':
      updatedState.products.engine.offered = true;
      break;
    case 'book':
      updatedState.products.book.offered = true;
      break;
    case 'bundle':
      updatedState.products.bundle.offered = true;
      break;
    case 'checkout':
      // No products to offer at checkout step
      break;
    case 'success':
      // No products to offer at success step
      break;
  }
  
  updatedState.lastUpdatedAt = new Date().toISOString();
  return updatedState;
}

export function getNextStep(state: PostQuizFunnelState): FunnelStep {
  switch (state.currentStep) {
    case 'snapshot':
      return 'toolkit';
    case 'toolkit':
      return 'engine';
    case 'engine':
      return 'book';
    case 'book':
      return 'bundle';
    case 'bundle':
      return 'checkout';
    case 'checkout':
      return 'success';
    default:
      return 'snapshot';
  }
}

export function shouldShowBundleOffer(state: PostQuizFunnelState): boolean {
  // Always show bundle offer - it's the 5th step in the funnel
  return true;
}

export function getBundleType(state: PostQuizFunnelState): 'engine' | 'mastery' {
  // Show engine bundle if engine was selected, mastery bundle if engine was declined
  return state.products.engine.selected ? 'engine' : 'mastery';
}

export function getCartItemForProduct(
  productType: string, 
  influenceStyle?: string
): CartItem | null {
  switch (productType) {
    case 'toolkit':
      const styleConfig = STYLE_TOOLKIT_CONFIGS[influenceStyle as keyof typeof STYLE_TOOLKIT_CONFIGS];
      return {
        type: 'toolkit',
        stripeSku: styleConfig?.sku || PRODUCT_CONFIGS.toolkit.sku,
        price: PRODUCT_CONFIGS.toolkit.price,
        stripePriceId: PRODUCT_CONFIGS.toolkit.stripePriceId,
        metadata: {
          influenceStyle,
          toolkitType: influenceStyle,
        },
      };
    case 'engine':
      return {
        type: 'engine',
        stripeSku: PRODUCT_CONFIGS.engine.sku,
        price: PRODUCT_CONFIGS.engine.price,
        stripePriceId: PRODUCT_CONFIGS.engine.stripePriceId,
      };
    case 'book':
      return {
        type: 'book',
        stripeSku: PRODUCT_CONFIGS.book.sku,
        price: PRODUCT_CONFIGS.book.price,
        stripePriceId: PRODUCT_CONFIGS.book.stripePriceId,
      };
    case 'bundle':
      // This will be determined by the bundle type
      return null;
    default:
      return null;
  }
}

export function getBundleCartItem(bundleType: 'engine' | 'mastery'): CartItem {
  const config = bundleType === 'engine' 
    ? PRODUCT_CONFIGS.bundle_engine 
    : PRODUCT_CONFIGS.bundle_mastery;
    
  return {
    type: bundleType === 'engine' ? 'bundle_engine' : 'bundle_mastery',
    stripeSku: config.sku,
    price: config.price,
    stripePriceId: config.stripePriceId,
    metadata: {
      bundleType,
      replacesIndividualItems: true,
      // Include what items this bundle replaces
      replacesItems: bundleType === 'engine' 
        ? ['toolkit', 'engine', 'book'] 
        : ['toolkit', 'book'],
    },
  };
}

// Tag generation helpers
export function generateSourceTags(sourceTracking: SourceTracking): string[] {
  const tags: string[] = [];
  
  if (sourceTracking.source === 'REIA Event' && sourceTracking.reiaName) {
    tags.push(`SRC_REIA_${sourceTracking.reiaName.replace(/\s+/g, '_')}`);
  }
  
  if (sourceTracking.source === 'Social Media' && sourceTracking.socialPlatform) {
    tags.push(`SRC_SOCIAL_${sourceTracking.socialPlatform.toUpperCase()}`);
  }
  
  if (sourceTracking.source === 'Referral' && sourceTracking.referrerName) {
    tags.push(`SRC_REFERRAL_${sourceTracking.referrerName.replace(/\s+/g, '_')}`);
  }
  
  if (sourceTracking.source === 'Book') {
    tags.push('SRC_BOOK');
  }
  
  if (sourceTracking.source === 'Other') {
    tags.push('SRC_OTHER');
  }
  
  return tags;
}

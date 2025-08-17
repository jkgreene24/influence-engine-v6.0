// Funnel state management for Influence Engine™ Phase 1 Master Build

export interface SourceTracking {
  // Source tracking fields
  source?: string; // REIA Event, Social Media, Referral, Word of Mouth, Other
  reiaName?: string; // Required if source is REIA Event
  socialPlatform?: string; // Facebook, LinkedIn, Instagram, TikTok
  referrerName?: string; // Required if source is Referral
  wordOfMouth?: string; // Optional text field
  otherSource?: string; // Optional text field
  
  // UTM tracking
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  
  // Special tracking
  srcBook?: boolean; // Set when entering from book link
}

export interface FunnelState {
  // User progress
  step: 'entry' | 'quiz' | 'results' | 'toolkit-offer' | 'book-offer' | 'ie-offer' | 'bundle-offer' | 'checkout' | 'success';
  
  // Quiz results
  influenceStyle?: string;
  secondaryStyle?: string;
  
  // Product selections
  wantsToolkit: boolean;
  wantsBook: boolean;
  wantsIE: boolean;
  wantsBundle: boolean;
  
  // Declines
  declinedToolkit: boolean;
  declinedBook: boolean;
  declinedIE: boolean;
  
  // Cart state
  cart: string[]; // Array of product keys
  
  // Source tracking
  sourceTracking: SourceTracking;
  
  // User data
  userData?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    company?: string;
    role?: string;
  };
}

export const INITIAL_FUNNEL_STATE: FunnelState = {
  step: 'entry',
  wantsToolkit: false,
  wantsBook: false,
  wantsIE: false,
  wantsBundle: false,
  declinedToolkit: false,
  declinedBook: false,
  declinedIE: false,
  cart: [],
  sourceTracking: {},
};

// Source tracking helpers
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
  
  if (sourceTracking.source === 'Word of Mouth') {
    tags.push('SRC_WORDMOUTH');
  }
  
  if (sourceTracking.source === 'Other') {
    tags.push('SRC_OTHER');
  }
  
  if (sourceTracking.srcBook) {
    tags.push('SRC_BOOK');
  }
  
  return tags;
}

// Funnel logic helpers
export function shouldShowBookOffer(state: FunnelState): boolean {
  return !state.sourceTracking.srcBook && !state.wantsBook && !state.declinedBook;
}

export function shouldShowBundleOffer(state: FunnelState): boolean {
  const declinedCount = [state.declinedToolkit, state.declinedBook, state.declinedIE].filter(Boolean).length;
  return declinedCount >= 2 && !state.wantsIE && !state.wantsBundle;
}

export function getNextStep(state: FunnelState): FunnelState['step'] {
  switch (state.step) {
    case 'entry':
      return 'quiz';
    case 'quiz':
      return 'results';
    case 'results':
      return 'toolkit-offer';
    case 'toolkit-offer':
      if (state.wantsToolkit) {
        return shouldShowBookOffer(state) ? 'book-offer' : 'ie-offer';
      } else {
        return shouldShowBookOffer(state) ? 'book-offer' : 'ie-offer';
      }
    case 'book-offer':
      return 'ie-offer';
    case 'ie-offer':
      if (state.wantsIE) {
        return 'checkout';
      } else {
        return shouldShowBundleOffer(state) ? 'bundle-offer' : 'checkout';
      }
    case 'bundle-offer':
      return 'checkout';
    case 'checkout':
      return 'success';
    default:
      return 'entry';
  }
}

// Cart management
export function addToCart(state: FunnelState, productKey: string): FunnelState {
  return {
    ...state,
    cart: [...state.cart, productKey],
  };
}

export function removeFromCart(state: FunnelState, productKey: string): FunnelState {
  return {
    ...state,
    cart: state.cart.filter(item => item !== productKey),
  };
}

export function clearCart(state: FunnelState): FunnelState {
  return {
    ...state,
    cart: [],
  };
}

// Product selection helpers
export function selectProduct(state: FunnelState, productKey: string): FunnelState {
  switch (productKey) {
    case 'Toolkit':
      return { ...state, wantsToolkit: true, declinedToolkit: false };
    case 'Book':
      return { ...state, wantsBook: true, declinedBook: false };
    case 'IE_Annual':
      return { ...state, wantsIE: true, declinedIE: false };
    case 'Bundle':
      return { 
        ...state, 
        wantsBundle: true,
        wantsToolkit: true,
        wantsBook: true,
        wantsIE: true,
        declinedToolkit: false,
        declinedBook: false,
        declinedIE: false,
        cart: ['Book', 'Toolkit', 'IE_Annual'], // Replace cart with bundle items
      };
    default:
      return state;
  }
}

export function declineProduct(state: FunnelState, productKey: string): FunnelState {
  switch (productKey) {
    case 'Toolkit':
      return { ...state, declinedToolkit: true, wantsToolkit: false };
    case 'Book':
      return { ...state, declinedBook: true, wantsBook: false };
    case 'IE_Annual':
      return { ...state, declinedIE: true, wantsIE: false };
    default:
      return state;
  }
}

// Local storage helpers
export function saveFunnelState(state: FunnelState): void {
  if (typeof window !== 'undefined') {
    console.log('Saving funnel state to localStorage:', state)
    localStorage.setItem('influence_funnel_state', JSON.stringify(state));
  }
}

export function loadFunnelState(): FunnelState | null {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('influence_funnel_state');
    console.log('Loading funnel state from localStorage:', saved)
    return saved ? JSON.parse(saved) : null;
  }
  return null;
}

export function clearFunnelState(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('influence_funnel_state');
  }
}

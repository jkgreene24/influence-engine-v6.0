// Pricing configuration with tokens for easy future changes
export const PRICING_TOKENS = {
  Book: 19,
  Toolkit: 79,
  IE_Annual: 499,
  IE_Standard: 997,
  Bundle: 547,
  Bundle_Standard: 597,
  MidTier: 199, // Placeholder for future use
} as const;

export type PricingToken = keyof typeof PRICING_TOKENS;

// Product definitions
export const PRODUCTS = {
  Book: {
    name: "Influence First: Why Your Deals Are Dying (and How to Fix It)",
    price: PRICING_TOKENS.Book,
    normalPrice: PRICING_TOKENS.Book,
    description: "The foundation of everything — the book that shows you why influence beats strategy every time.",
    features: [
      "The trust-killers that silently kill deals",
      "How to spot the real reason people say 'no'",
      "Quick-read tactics to lower defenses in minutes",
      "How to adapt your style in real time to save deals",
      "The method that turns hesitant prospects into easy yeses",
    ],
    stripePriceId: process.env.STRIPE_BOOK_PRICE_ID,
  },
  Toolkit: {
    name: "Complete Influence Style Toolkit",
    price: PRICING_TOKENS.Toolkit,
    normalPrice: PRICING_TOKENS.Toolkit,
    description: "Go beyond your snapshot. Get the exact words, moves, and strategies to win more deals faster.",
    features: [
      "Winning Phrases — openers, bridges, and closers that work with your style",
      "Style Playbook — the psychology of your influence strengths",
      "Influence Boosters — micro-adjustments that instantly raise your impact",
      "Scenario Strategies — how to approach common high-stakes situations",
      "Mistake Shield — avoid the traps that derail conversations",
      "Quick-Win Cards — pocket-sized reference for fast recall",
    ],
    stripePriceId: process.env.STRIPE_TOOLKIT_PRICE_ID,
  },
  IE_Annual: {
    name: "The Influence Engine™ Annual Membership",
    price: PRICING_TOKENS.IE_Annual,
    normalPrice: PRICING_TOKENS.IE_Standard,
    description: "Your deal coach in your pocket — live, on-demand coaching for your most important conversations.",
    features: [
      "Real-Time Prep — the right words, phrasing, and tone for your style",
      "Live Roleplay Simulations — realistic practice with pushback and objections",
      "Winning Phrase Banks — style-specific openers, bridges, and closers",
      "Deal Debriefs — pinpoint what worked and what to tweak",
      "Slack Community — collaborate, share wins, and get peer input",
      "Notion Resource Hub — one home for all tools, training, and updates",
    ],
    stripePriceId: process.env.STRIPE_IE_ANNUAL_PRICE_ID,
  },
  Bundle: {
    name: "Influence Mastery Bundle",
    price: PRICING_TOKENS.Bundle,
    normalPrice: PRICING_TOKENS.Bundle_Standard,
    description: "Complete influence system at our best value",
    features: [
      "The Book",
      "The Full Toolkit", 
      "The Influence Engine™ Annual Membership",
    ],
    stripePriceId: process.env.STRIPE_BUNDLE_PRICE_ID,
  },
} as const;

export type ProductKey = keyof typeof PRODUCTS;

// Helper function to get product by key
export function getProduct(key: ProductKey) {
  return PRODUCTS[key];
}

// Helper function to format price
export function formatPrice(price: number): string {
  return `$${price}`;
}

// Helper function to replace pricing tokens in text
export function replacePricingTokens(text: string): string {
  let result = text;
  Object.entries(PRICING_TOKENS).forEach(([token, price]) => {
    result = result.replace(new RegExp(`\\[PRICE:${token}\\]`, 'g'), formatPrice(price));
  });
  return result;
}

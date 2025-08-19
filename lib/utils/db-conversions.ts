// Utility functions to convert between frontend and database field names

export interface FrontendUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  role?: string;
  emailVerified: boolean;
  quizCompleted: boolean;
  demoWatched: boolean;
  ndaSigned: boolean;
  signatureUrl?: string;
  ndaDigitalSignature?: string;
  influenceStyle?: string;
  paidAt?: string;
  paidFor?: string;
  cart?: string[];
}

export interface DatabaseUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company?: string;
  role?: string;
  email_verified: boolean;
  quiz_completed: boolean;
  demo_watched: boolean;
  nda_signed: boolean;
  signature_url?: string;
  nda_digital_signature?: string;
  influence_style?: string;
  paid_at?: string;
  paid_for?: string;
}

// Convert database user to frontend format
export function dbToFrontendUser(dbUser: DatabaseUser): FrontendUser {
  return {
    id: dbUser.id,
    firstName: dbUser.first_name,
    lastName: dbUser.last_name,
    email: dbUser.email,
    phone: dbUser.phone,
    company: dbUser.company,
    role: dbUser.role,
    emailVerified: dbUser.email_verified,
    quizCompleted: dbUser.quiz_completed,
    demoWatched: dbUser.demo_watched,
    ndaSigned: dbUser.nda_signed,
    signatureUrl: dbUser.signature_url,
    ndaDigitalSignature: dbUser.nda_digital_signature,
    influenceStyle: dbUser.influence_style,
    paidAt: dbUser.paid_at,
    paidFor: dbUser.paid_for,
    cart: dbUser.paid_for ? dbUser.paid_for.split(',') : [],
  };
}

// Convert frontend user to database format
export function frontendToDbUser(frontendUser: Partial<FrontendUser>): Partial<DatabaseUser> {
  const dbUser: Partial<DatabaseUser> = {};
  
  if (frontendUser.firstName !== undefined) dbUser.first_name = frontendUser.firstName;
  if (frontendUser.lastName !== undefined) dbUser.last_name = frontendUser.lastName;
  if (frontendUser.email !== undefined) dbUser.email = frontendUser.email;
  if (frontendUser.phone !== undefined) dbUser.phone = frontendUser.phone;
  if (frontendUser.company !== undefined) dbUser.company = frontendUser.company;
  if (frontendUser.role !== undefined) dbUser.role = frontendUser.role;
  if (frontendUser.emailVerified !== undefined) dbUser.email_verified = frontendUser.emailVerified;
  if (frontendUser.quizCompleted !== undefined) dbUser.quiz_completed = frontendUser.quizCompleted;
  if (frontendUser.demoWatched !== undefined) dbUser.demo_watched = frontendUser.demoWatched;
  if (frontendUser.ndaSigned !== undefined) dbUser.nda_signed = frontendUser.ndaSigned;
  if (frontendUser.signatureUrl !== undefined) dbUser.signature_url = frontendUser.signatureUrl;
  if (frontendUser.ndaDigitalSignature !== undefined) dbUser.nda_digital_signature = frontendUser.ndaDigitalSignature;
  if (frontendUser.influenceStyle !== undefined) dbUser.influence_style = frontendUser.influenceStyle;
  if (frontendUser.paidAt !== undefined) dbUser.paid_at = frontendUser.paidAt;
  if (frontendUser.paidFor !== undefined) dbUser.paid_for = frontendUser.paidFor;
  
  return dbUser;
}

// Parse cart items from paid_for field
export function parseCartItems(paidFor?: string): string[] {
  if (!paidFor) return [];
  return paidFor.split(',').filter(item => item.trim() !== '');
}

// Convert cart items to paid_for format
export function cartItemsToPaidFor(cartItems: string[]): string {
  return cartItems.join(',');
} 
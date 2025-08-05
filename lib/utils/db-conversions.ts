// Database naming convention utilities
// Converts between snake_case (database) and camelCase (TypeScript)

export interface InfluenceUser {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  role?: string;
  createdAt?: string;
  emailVerified: boolean;
  quizCompleted: boolean;
  demoWatched: boolean;
  influenceStyle?: string;
  ndaSigned: boolean;
  signatureData?: string;
  paidAt?: string;
}

export interface DbInfluenceUser {
  id?: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company?: string;
  role?: string;
  created_at?: string;
  email_verified: boolean;
  quiz_completed: boolean;
  demo_watched: boolean;
  influence_style?: string;
  nda_signed: boolean;
  signature_url?: string;
  paid_at?: string;
}

// Convert camelCase to snake_case for database insertion
export function toDbFormat(user: InfluenceUser): DbInfluenceUser {
  return {
    first_name: user.firstName,
    last_name: user.lastName,
    email: user.email,
    phone: user.phone,
    company: user.company,
    role: user.role,
    email_verified: user.emailVerified,
    quiz_completed: user.quizCompleted,
    demo_watched: user.demoWatched,
    influence_style: user.influenceStyle,
    nda_signed: user.ndaSigned,
    signature_url: user.signatureData,
    paid_at: user.paidAt,
  };
}

// Convert snake_case to camelCase for frontend usage
export function fromDbFormat(dbUser: DbInfluenceUser): InfluenceUser {
  return {
    id: dbUser.id,
    firstName: dbUser.first_name,
    lastName: dbUser.last_name,
    email: dbUser.email,
    phone: dbUser.phone,
    company: dbUser.company,
    role: dbUser.role,
    createdAt: dbUser.created_at,
    emailVerified: dbUser.email_verified,
    quizCompleted: dbUser.quiz_completed,
    demoWatched: dbUser.demo_watched,
    influenceStyle: dbUser.influence_style,
    ndaSigned: dbUser.nda_signed,
    signatureData: dbUser.signature_url,
    paidAt: dbUser.paid_at,
  };
}

// Convert array of database users to frontend format
export function fromDbFormatArray(dbUsers: DbInfluenceUser[]): InfluenceUser[] {
  return dbUsers.map(fromDbFormat);
} 
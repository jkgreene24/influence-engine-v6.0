// LocalStorage-based database simulation for development/testing
// This provides a consistent interface that can later be replaced with real database calls

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  role?: string;
  influenceStyle?: string;
  secondaryStyle?: string;
  emailVerified?: boolean;
  quizCompleted?: boolean;
  demoWatched?: boolean;
  ndaSigned?: boolean;
  signatureData?: string;
  paidAt?: string;
  paidFor?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuizResult {
  id: string;
  userId: string;
  influenceStyle: string;
  secondaryStyle?: string;
  answers: Record<string, string>;
  completedAt: string;
}

export interface Purchase {
  id: string;
  userId: string;
  products: string[];
  total: number;
  status: 'pending' | 'completed' | 'failed';
  stripeSessionId?: string;
  createdAt: string;
  updatedAt: string;
}

// Storage keys
const STORAGE_KEYS = {
  USERS: 'influence_users',
  QUIZ_RESULTS: 'influence_quiz_results',
  PURCHASES: 'influence_purchases',
} as const;

// Helper functions
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function getTimestamp(): string {
  return new Date().toISOString();
}

function getStorageItem<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : [];
}

function setStorageItem<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}

// User operations
export const userDB = {
  async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const users = getStorageItem<User>(STORAGE_KEYS.USERS);
    
    // Check if user already exists by email
    const existingUser = users.find(u => u.email === userData.email);
    if (existingUser) {
      return existingUser;
    }

    const newUser: User = {
      ...userData,
      emailVerified: userData.emailVerified ?? false,
      quizCompleted: userData.quizCompleted ?? false,
      demoWatched: userData.demoWatched ?? false,
      ndaSigned: userData.ndaSigned ?? false,
      signatureData: userData.signatureData ?? '',
      paidAt: userData.paidAt ?? '',
      paidFor: userData.paidFor ?? '',
      id: generateId(),
      createdAt: getTimestamp(),
      updatedAt: getTimestamp(),
    };

    users.push(newUser);
    setStorageItem(STORAGE_KEYS.USERS, users);
    
    return newUser;
  },

  async getById(id: string): Promise<User | null> {
    const users = getStorageItem<User>(STORAGE_KEYS.USERS);
    return users.find(u => u.id === id) || null;
  },

  async getByEmail(email: string): Promise<User | null> {
    const users = getStorageItem<User>(STORAGE_KEYS.USERS);
    return users.find(u => u.email === email) || null;
  },

  async update(id: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User | null> {
    const users = getStorageItem<User>(STORAGE_KEYS.USERS);
    const userIndex = users.findIndex(u => u.id === id);
    
    if (userIndex === -1) return null;

    users[userIndex] = {
      ...users[userIndex],
      ...updates,
      updatedAt: getTimestamp(),
    };

    setStorageItem(STORAGE_KEYS.USERS, users);
    return users[userIndex];
  },

  async getAll(): Promise<User[]> {
    return getStorageItem<User>(STORAGE_KEYS.USERS);
  },

  async delete(id: string): Promise<boolean> {
    const users = getStorageItem<User>(STORAGE_KEYS.USERS);
    const filteredUsers = users.filter(u => u.id !== id);
    
    if (filteredUsers.length === users.length) return false;
    
    setStorageItem(STORAGE_KEYS.USERS, filteredUsers);
    return true;
  },
};

// Quiz results operations
export const quizDB = {
  async create(resultData: Omit<QuizResult, 'id' | 'completedAt'>): Promise<QuizResult> {
    const results = getStorageItem<QuizResult>(STORAGE_KEYS.QUIZ_RESULTS);
    
    const newResult: QuizResult = {
      ...resultData,
      id: generateId(),
      completedAt: getTimestamp(),
    };

    results.push(newResult);
    setStorageItem(STORAGE_KEYS.QUIZ_RESULTS, results);
    
    return newResult;
  },

  async getByUserId(userId: string): Promise<QuizResult[]> {
    const results = getStorageItem<QuizResult>(STORAGE_KEYS.QUIZ_RESULTS);
    return results.filter(r => r.userId === userId);
  },

  async getById(id: string): Promise<QuizResult | null> {
    const results = getStorageItem<QuizResult>(STORAGE_KEYS.QUIZ_RESULTS);
    return results.find(r => r.id === id) || null;
  },

  async getAll(): Promise<QuizResult[]> {
    return getStorageItem<QuizResult>(STORAGE_KEYS.QUIZ_RESULTS);
  },
};

// Purchase operations
export const purchaseDB = {
  async create(purchaseData: Omit<Purchase, 'id' | 'createdAt' | 'updatedAt'>): Promise<Purchase> {
    const purchases = getStorageItem<Purchase>(STORAGE_KEYS.PURCHASES);
    
    const newPurchase: Purchase = {
      ...purchaseData,
      id: generateId(),
      createdAt: getTimestamp(),
      updatedAt: getTimestamp(),
    };

    purchases.push(newPurchase);
    setStorageItem(STORAGE_KEYS.PURCHASES, purchases);
    
    return newPurchase;
  },

  async getById(id: string): Promise<Purchase | null> {
    const purchases = getStorageItem<Purchase>(STORAGE_KEYS.PURCHASES);
    return purchases.find(p => p.id === id) || null;
  },

  async getByUserId(userId: string): Promise<Purchase[]> {
    const purchases = getStorageItem<Purchase>(STORAGE_KEYS.PURCHASES);
    return purchases.filter(p => p.userId === userId);
  },

  async update(id: string, updates: Partial<Omit<Purchase, 'id' | 'createdAt'>>): Promise<Purchase | null> {
    const purchases = getStorageItem<Purchase>(STORAGE_KEYS.PURCHASES);
    const purchaseIndex = purchases.findIndex(p => p.id === id);
    
    if (purchaseIndex === -1) return null;

    purchases[purchaseIndex] = {
      ...purchases[purchaseIndex],
      ...updates,
      updatedAt: getTimestamp(),
    };

    setStorageItem(STORAGE_KEYS.PURCHASES, purchases);
    return purchases[purchaseIndex];
  },

  async getByStripeSessionId(sessionId: string): Promise<Purchase | null> {
    const purchases = getStorageItem<Purchase>(STORAGE_KEYS.PURCHASES);
    return purchases.find(p => p.stripeSessionId === sessionId) || null;
  },

  async getAll(): Promise<Purchase[]> {
    return getStorageItem<Purchase>(STORAGE_KEYS.PURCHASES);
  },
};

// Utility functions for data conversion (following the user's preference for camelCase in code)
export const dbConversions = {
  // Convert snake_case to camelCase for TypeScript
  toCamelCase: (obj: Record<string, any>): Record<string, any> => {
    const converted: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      converted[camelKey] = value;
    }
    return converted;
  },

  // Convert camelCase to snake_case for database
  toSnakeCase: (obj: Record<string, any>): Record<string, any> => {
    const converted: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      converted[snakeKey] = value;
    }
    return converted;
  },
};

// Clear all data (useful for testing)
export function clearAllData(): void {
  if (typeof window === 'undefined') return;
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}

// Export a main database interface
export const localDB = {
  users: userDB,
  quiz: quizDB,
  purchases: purchaseDB,
  conversions: dbConversions,
  clearAll: clearAllData,
};

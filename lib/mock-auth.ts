export interface MockProfile {
  id: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  user_name?: string
  primary_influence_style?: string
  secondary_influence_style?: string
  quiz_completed?: boolean
  demo_watched?: boolean
  nda_signed?: boolean
  created_at: string
  updated_at: string
}

export interface MockUser {
  id: string
  email: string
  phone?: string
  email_confirmed_at?: string
  created_at: string
  user_metadata: {
    first_name?: string
    last_name?: string
    full_name?: string
    phone?: string
    influence_style?: string
    avatar_url?: string
  }
}

class MockAuthService {
  private users: MockUser[] = []
  private profiles: MockProfile[] = []
  private currentUser: MockUser | null = null

  constructor() {
    // Load from localStorage if available
    if (typeof window !== "undefined") {
      const savedUsers = localStorage.getItem("mock_users")
      const savedProfiles = localStorage.getItem("mock_profiles")
      const savedCurrentUser = localStorage.getItem("mock_current_user")

      if (savedUsers) this.users = JSON.parse(savedUsers)
      if (savedProfiles) this.profiles = JSON.parse(savedProfiles)
      if (savedCurrentUser) this.currentUser = JSON.parse(savedCurrentUser)
    }
  }

  private saveToStorage() {
    if (typeof window !== "undefined") {
      localStorage.setItem("mock_users", JSON.stringify(this.users))
      localStorage.setItem("mock_profiles", JSON.stringify(this.profiles))
      localStorage.setItem("mock_current_user", JSON.stringify(this.currentUser))
    }
  }

  private generateId() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  async signUp(email: string, password: string, metadata: any = {}) {
    // Check if email already exists
    const existingUserByEmail = this.users.find((u) => u.email.toLowerCase() === email.toLowerCase())
    if (existingUserByEmail) {
      return {
        data: null,
        error: { message: "User already registered with this email address" },
      }
    }

    // Check if phone already exists (if provided)
    if (metadata.phone) {
      const existingUserByPhone = this.users.find((u) => u.phone === metadata.phone)
      if (existingUserByPhone) {
        return {
          data: null,
          error: { message: "User already registered with this phone number" },
        }
      }
    }

    const userId = this.generateId()
    const now = new Date().toISOString()

    const newUser: MockUser = {
      id: userId,
      email,
      phone: metadata.phone,
      email_confirmed_at: undefined, // Will be set after email verification
      created_at: now,
      user_metadata: {
        first_name: metadata.first_name,
        last_name: metadata.last_name,
        full_name: metadata.full_name,
        phone: metadata.phone,
        influence_style: metadata.influence_style,
        avatar_url: metadata.avatar_url,
      },
    }

    const newProfile: MockProfile = {
      id: userId,
      email,
      first_name: metadata.first_name || "",
      last_name: metadata.last_name || "",
      phone: metadata.phone,
      user_name: metadata.user_name || "",
      primary_influence_style: metadata.influence_style,
      secondary_influence_style: undefined,
      quiz_completed: false,
      demo_watched: false,
      nda_signed: false,
      created_at: now,
      updated_at: now,
    }

    this.users.push(newUser)
    this.profiles.push(newProfile)
    this.saveToStorage()

    return {
      data: { user: newUser },
      error: null,
    }
  }

  async signIn(email: string, password: string) {
    const user = this.users.find((u) => u.email.toLowerCase() === email.toLowerCase())

    if (!user) {
      return {
        data: null,
        error: { message: "Invalid login credentials" },
      }
    }

    if (!user.email_confirmed_at) {
      return {
        data: null,
        error: { message: "Please verify your email address before signing in" },
      }
    }

    this.currentUser = user
    this.saveToStorage()

    return {
      data: { user },
      error: null,
    }
  }

  async signOut() {
    this.currentUser = null
    this.saveToStorage()
  }

  getCurrentUser(): MockUser | null {
    return this.currentUser
  }

  getProfile(userId: string): MockProfile | null {
    return this.profiles.find((p) => p.id === userId) || null
  }

  getAllProfiles(): MockProfile[] {
    return this.profiles
  }

  async updateUser(updates: any) {
    if (!this.currentUser) {
      return { data: null, error: { message: "No user logged in" } }
    }

    this.currentUser.user_metadata = {
      ...this.currentUser.user_metadata,
      ...updates.data,
    }

    // Update in users array
    const userIndex = this.users.findIndex((u) => u.id === this.currentUser!.id)
    if (userIndex !== -1) {
      this.users[userIndex] = this.currentUser
    }

    this.saveToStorage()
    return { data: { user: this.currentUser }, error: null }
  }

  async updateProfile(userId: string, updates: Partial<MockProfile>) {
    const profileIndex = this.profiles.findIndex((p) => p.id === userId)
    if (profileIndex === -1) {
      return { data: null, error: { message: "Profile not found" } }
    }

    this.profiles[profileIndex] = {
      ...this.profiles[profileIndex],
      ...updates,
      updated_at: new Date().toISOString(),
    }

    this.saveToStorage()
    return { data: this.profiles[profileIndex], error: null }
  }

  async confirmEmail(userId: string) {
    const userIndex = this.users.findIndex((u) => u.id === userId)
    if (userIndex !== -1) {
      this.users[userIndex].email_confirmed_at = new Date().toISOString()
      this.saveToStorage()
      return { error: null }
    }
    return { error: { message: "User not found" } }
  }

  // Helper method to simulate email confirmation for testing
  async simulateEmailConfirmation(email: string) {
    const user = this.users.find((u) => u.email.toLowerCase() === email.toLowerCase())
    if (user) {
      return this.confirmEmail(user.id)
    }
    return { error: { message: "User not found" } }
  }
}

export const MockAuth = new MockAuthService()

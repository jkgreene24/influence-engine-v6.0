import { MockAuth, type MockProfile } from "@/lib/mock-auth"

// Mock Supabase client that uses localStorage instead of real database
export function createClient() {
  return {
    auth: {
      async getUser() {
        const user = MockAuth.getCurrentUser()
        return {
          data: { user },
          error: null,
        }
      },

      async signInWithPassword({ email, password }: { email: string; password: string }) {
        return await MockAuth.signIn(email, password)
      },

      async signUp({ email, password, options }: { email: string; password: string; options?: any }) {
        return await MockAuth.signUp(email, password, options?.data || {})
      },

      async signOut() {
        await MockAuth.signOut()
        return { error: null }
      },

      async updateUser(updates: any) {
        return await MockAuth.updateUser(updates)
      },

      async signInWithOAuth({ provider, options }: { provider: string; options?: any }) {
        // Mock OAuth - just redirect to callback
        if (typeof window !== "undefined") {
          window.location.href = options?.redirectTo || "/auth/callback"
        }
        return { error: null }
      },

      async exchangeCodeForSession(code: string) {
        // Mock OAuth callback
        return { error: null }
      },
    },

    from(table: string) {
      if (table === "profiles") {
        return {
          select(columns = "*") {
            return {
              eq(column: string, value: any) {
                return {
                  single() {
                    const profile = MockAuth.getProfile(value)
                    return Promise.resolve({
                      data: profile,
                      error: profile ? null : { message: "Profile not found" },
                    })
                  },
                }
              },
              order(column: string, options?: any) {
                const profiles = MockAuth.getAllProfiles()
                const sorted = [...profiles].sort((a, b) => {
                  const aVal = new Date(a[column as keyof MockProfile] as string).getTime()
                  const bVal = new Date(b[column as keyof MockProfile] as string).getTime()
                  return options?.ascending === false ? bVal - aVal : aVal - bVal
                })
                return Promise.resolve({
                  data: sorted,
                  error: null,
                })
              },
            }
          },

          upsert(data: any) {
            return {
              async then(callback: (result: any) => void) {
                const result = await MockAuth.updateProfile(data.id, data)
                callback(result)
                return result
              },
            }
          },
        }
      }

      // Default empty response for other tables
      return {
        select() {
          return Promise.resolve({ data: [], error: null })
        },
        insert() {
          return Promise.resolve({ data: null, error: null })
        },
        update() {
          return Promise.resolve({ data: null, error: null })
        },
        delete() {
          return Promise.resolve({ data: null, error: null })
        },
      }
    },

    storage: {
      from(bucket: string) {
        return {
          upload(path: string, file: File, options?: any) {
            // Mock file upload - just return a fake URL
            const fakeUrl = `https://mock-storage.example.com/${bucket}/${path}`
            return Promise.resolve({
              data: { path: fakeUrl },
              error: null,
            })
          },

          getPublicUrl(path: string) {
            return {
              data: { publicUrl: `https://mock-storage.example.com/${bucket}/${path}` },
            }
          },
        }
      },
    },
  }
}

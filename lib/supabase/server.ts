import { MockAuth } from "@/lib/mock-auth"

// Mock server client - same as client for demo purposes
export async function createClient() {
  return {
    auth: {
      async getUser() {
        const user = MockAuth.getCurrentUser()
        return {
          data: { user },
          error: null,
        }
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
            }
          },
        }
      }

      return {
        select() {
          return Promise.resolve({ data: [], error: null })
        },
      }
    },
  }
}

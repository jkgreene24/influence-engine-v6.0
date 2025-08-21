"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function FunnelPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the new post-quiz-funnel system
    console.log('Old funnel page accessed, redirecting to new system')
    router.push("/post-quiz-funnel")
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-[#92278F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to new funnel system...</p>
      </div>
    </div>
  )
}

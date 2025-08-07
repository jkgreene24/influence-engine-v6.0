"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, CheckCircle, Mail, Clock, Users, Zap, Navigation, Link, Anchor, Crown } from "lucide-react"
import { useRouter } from "next/navigation"

export default function NDASuccessPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("current_influence_user") || "null")
    if (!currentUser) {
      router.push("/")
      return
    }

    if (!currentUser.quizCompleted) {
      router.push("/quick-quiz")
      return
    }

    if (!currentUser.demoWatched) {
      router.push("/influence-demo")
      return
    }

    if (!currentUser.ndaSigned) {
      router.push("/influence-nda")
      return
    }

    setUser(currentUser)
    setLoading(false)
  }, [router])

  const getStyleIcon = (style: string) => {
    switch (style?.toLowerCase()) {
      case "catalyst":
        return <Zap className="w-6 h-6" />
      case "diplomat":
        return <Users className="w-6 h-6" />
      case "anchor":
        return <Anchor className="w-6 h-6" />
      case "navigator":
        return <Navigation className="w-6 h-6" />
      case "connector":
        return <Link className="w-6 h-6" />
      default:
        return <Users className="w-6 h-6" />
    }
  }

  const getStyleColor = (style: string) => {
    switch (style?.toLowerCase()) {
      case "catalyst":
        return "bg-orange-500"
      case "diplomat":
        return "bg-pink-500"
      case "anchor":
        return "bg-green-500"
      case "navigator":
        return "bg-blue-500"
      case "connector":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#92278F]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <img src="/logo.png" alt="Logo" className="w-10 h-10 rounded-full" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">The Influence Engine™</h1>
                <p className="text-sm text-gray-600">Agreement Completed</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Success Card */}
        <Card className="mb-8 border-2 border-[#92278F] bg-gradient-to-r from-[#92278F]/10 to-purple-50">
          <CardContent className="text-center py-12">
            <div className="w-20 h-20 bg-[#92278F] rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">🎉 Agreement Successfully Signed!</h1>
            <p className="text-xl text-gray-600 mb-6">
              Thank you {user.firstName}! Your Use & Confidentiality Agreement has been completed.
            </p>

            <Badge className="bg-[#92278F] text-white text-lg px-4 py-2 mb-6">ACCESS GRANTED</Badge>

            <div className="bg-white rounded-lg p-6 mb-8 border">
              <h3 className="font-bold text-gray-900 mb-4">What's Next:</h3>
              <div className="text-left space-y-3">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Agreement signed and recorded ✓</span>
                </div>
                <div className="flex items-center space-x-3">
                   <CheckCircle className="w-5 h-5 text-green-500" />
                   <span className="text-gray-700">Access granted to The Influence Engine™ ✓</span>
                 </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Email campaign preparation ✓</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <span className="text-gray-700">Email campaign coming soon</span>
                </div>
              </div>
            </div>

            {/* User's Style Display */}
            {user.primaryInfluenceStyle && (
              <Card className="mb-8 border-2 border-[#92278F]/20 bg-gradient-to-r from-[#92278F]/5 to-purple-50">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <div className="flex justify-center items-center space-x-4 mb-8">
                      <div
                        className={`w-16 h-16 ${getStyleColor(user.primaryInfluenceStyle)} rounded-full flex items-center justify-center text-white`}
                      >
                        {getStyleIcon(user.primaryInfluenceStyle)}
                      </div>
                      {user.secondaryInfluenceStyle && (
                        <>
                          <div className="text-2xl font-bold text-[#92278F]">+</div>
                          <div
                            className={`w-16 h-16 ${getStyleColor(user.secondaryInfluenceStyle)} rounded-full flex items-center justify-center text-white`}
                          >
                            {getStyleIcon(user.secondaryInfluenceStyle)}
                          </div>
                        </>
                      )}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {user.primaryInfluenceStyle}
                        {user.secondaryInfluenceStyle && ` + ${user.secondaryInfluenceStyle}`} Influence Style
                    </h2>
                    <p className="text-gray-600">Your influence style analysis is complete</p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Button
              onClick={() => router.push("/")}
              size="lg"
              className="bg-[#92278F] hover:bg-[#7a1f78] text-white px-8 py-4 text-lg font-semibold"
            >
              Return to Home
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

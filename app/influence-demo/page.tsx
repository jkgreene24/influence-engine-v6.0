"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, Play, CheckCircle, Clock, Zap, Users, Target, Navigation } from "lucide-react"
import { useRouter } from "next/navigation"

export default function InfluenceDemoPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [videoWatched, setVideoWatched] = useState(false)
  const [watchTime, setWatchTime] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("current_influence_user") || "null")
    if (!currentUser) {
      router.push("/")
      return
    }

    if (!currentUser.quizCompleted) {
      router.push("/influence-quiz")
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
        return <Target className="w-6 h-6" />
      case "navigator":
        return <Navigation className="w-6 h-6" />
      case "connector":
        return <Users className="w-6 h-6" />
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

  const handleVideoEnd = async () => {
    setVideoWatched(true)

    // Update user data
    const updatedUser = {
      ...user,
      demoWatched: true,
    }

    localStorage.setItem("current_influence_user", JSON.stringify(updatedUser))

    // Update users array
    const users = JSON.parse(localStorage.getItem("influence_users") || "[]")
    const userIndex = users.findIndex((u: any) => u.id === user.id)
    if (userIndex !== -1) {
      users[userIndex] = updatedUser
      localStorage.setItem("influence_users", JSON.stringify(users))
    }

    setUser(updatedUser)
  }

  const simulateVideoWatch = () => {
    // Simulate watching the video for demo purposes
    setWatchTime(100)
    setVideoWatched(true)
    handleVideoEnd()
  }

  const handleContinue = () => {
    router.push("/influence-profile")
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
                <p className="text-sm text-gray-600">Demo Video</p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={() => router.push("/influence-quiz")}
              className="text-gray-600 hover:text-[#92278F]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Quiz
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">See The Influence Engine™ in Action</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
            Hi {user.firstName}! Watch this 5-minute demo to see how personalized AI coaching can transform your
            leadership approach.
          </p>

          {/* User's Style Display */}
          {user.primaryInfluenceStyle && (
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
          )}

          <div className="bg-[#92278F]/10 rounded-lg p-4 mb-8">
            <p className="text-[#92278F] font-semibold">
              Your Style: {user.primaryInfluenceStyle}
              {user.secondaryInfluenceStyle && ` + ${user.secondaryInfluenceStyle}`}
            </p>
          </div>
        </div>

        {/* Video Section */}
        <Card className="mb-8">
          <CardContent className="p-0">
            <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ aspectRatio: "16/9" }}>
              {/* Placeholder for actual video */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-20 h-20 bg-[#92278F] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Play className="w-8 h-8 text-white ml-1" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">The Influence Engine™ Demo</h3>
                  <p className="text-gray-300 mb-4">
                    5 minutes • Personalized for {user.primaryInfluenceStyle} Leaders
                  </p>
                  <Button onClick={simulateVideoWatch} className="bg-[#92278F] hover:bg-[#7a1f78] text-white">
                    <Play className="w-4 h-4 mr-2" />
                    Play Demo Video
                  </Button>
                </div>
              </div>

              {/* Progress bar (simulated) */}
              {watchTime > 0 && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-4">
                  <div className="flex items-center space-x-3 text-white text-sm">
                    <Clock className="w-4 h-4" />
                    <div className="flex-1 bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-[#92278F] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${watchTime}%` }}
                      ></div>
                    </div>
                    <span>{watchTime}%</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* What You'll Learn */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">
              What You'll Learn About {user.primaryInfluenceStyle} Leadership
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Personalized AI Coaching</h4>
                    <p className="text-gray-600 text-sm">How AI adapts to your {user.primaryInfluenceStyle} style</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Real-World Scenarios</h4>
                    <p className="text-gray-600 text-sm">Practice leadership challenges specific to your style</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Instant Feedback</h4>
                    <p className="text-gray-600 text-sm">
                      Get guidance tailored to your natural communication approach
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Style-Specific Strategies</h4>
                    <p className="text-gray-600 text-sm">
                      Learn techniques that work with your {user.primaryInfluenceStyle} approach
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Measurable Results</h4>
                    <p className="text-gray-600 text-sm">Track your leadership impact and growth over time</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Advanced Techniques</h4>
                    <p className="text-gray-600 text-sm">Master advanced influence strategies for your style</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        {videoWatched ? (
          <Card className="border-2 border-green-200 bg-green-50">
            <CardContent className="text-center py-8">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Excellent! You've watched the demo</h2>
              <p className="text-gray-600 mb-6">
                Now let's show you your personalized {user.primaryInfluenceStyle} influence style snapshot based on your
                assessment results.
              </p>
              <Button
                onClick={handleContinue}
                size="lg"
                className="bg-[#92278F] hover:bg-[#7a1f78] text-white px-8 py-4"
              >
                View Your Snapshot Profile
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-2 border-[#92278F]/20 bg-[#92278F]/5">
            <CardContent className="text-center py-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready to see your personalized results?</h2>
              <p className="text-gray-600 mb-6">
                Watch the demo video above to unlock your {user.primaryInfluenceStyle} influence style snapshot.
              </p>
              <Button disabled size="lg" className="bg-gray-400 text-white px-8 py-4 cursor-not-allowed">
                Watch Demo First
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

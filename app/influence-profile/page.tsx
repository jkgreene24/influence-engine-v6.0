"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, Zap, Users, Navigation, Unlock, Link, Anchor } from "lucide-react"
import { useRouter } from "next/navigation"

export default function InfluenceProfile() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [dbProfile, setDbProfile] = useState<any>(null)
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

    setUser(currentUser)
    fetchDbProfile(currentUser)
    setLoading(false)
  }, [router])

  const fetchDbProfile = async (userData: any) => {
    try {
      // First try to use the influenceStyle directly from the database
      if (userData.influenceStyle) {
        console.log("Using influenceStyle from database:", userData.influenceStyle)
        const response = await fetch(`/api/get-influence-profile?style=${userData.influenceStyle.toLowerCase()}`)
        const data = await response.json()
        
        if (response.ok) {
          console.log("Profile found for influenceStyle:", userData.influenceStyle, data)
          setDbProfile(data)
          return
        }
      }
      
      // Fallback to the old method using primary/secondary styles
      const primaryStyle = userData.primaryInfluenceStyle?.toLowerCase()
      const secondaryStyle = userData.secondaryInfluenceStyle?.toLowerCase()
      
      // Try different style combinations to find a match in the database
      const styleCombinations = []
      
      // Add the primary-secondary combination first
      if (primaryStyle && secondaryStyle) {
        styleCombinations.push(`${primaryStyle}-${secondaryStyle}`)
      }
      
      // Add just the primary style as fallback
      if (primaryStyle) {
        styleCombinations.push(primaryStyle)
      }
      
      // Add the reverse combination (secondary-primary)
      if (primaryStyle && secondaryStyle) {
        styleCombinations.push(`${secondaryStyle}-${primaryStyle}`)
      }

      console.log("Trying fallback style combinations:", styleCombinations)

      // Try each combination until we find a match
      for (const styleKey of styleCombinations) {
        console.log("Fetching profile for style:", styleKey)
        
        const response = await fetch(`/api/get-influence-profile?style=${styleKey}`)
        const data = await response.json()
        
        if (response.ok) {
          console.log("Profile found for style:", styleKey, data)
          setDbProfile(data)
          return
        }
      }
      
      console.log("No profile found for any style combination")
    } catch (error) {
      console.error("Error fetching profile:", error)
    }
  }

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

  const formatProfileText = (text: string) => {
    if (!text) return ""
    
    // Split by double line breaks to preserve paragraphs
    const paragraphs = text.split(/\n\n+/)
    
    return paragraphs.map((paragraph, index) => {
      // Split by single line breaks for line breaks within paragraphs
      const lines = paragraph.split(/\n/)
      
      return (
        <div key={index} className="mb-4">
          {lines.map((line, lineIndex) => (
            <div key={lineIndex} className="mb-2">
              {line.trim()}
            </div>
          ))}
        </div>
      )
    })
  }

  const handleContinue = () => {
    router.push("/influence-nda")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#92278F]"></div>
      </div>
    )
  }

  if (!dbProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Stuck here?</h2>
          <p className="text-gray-600 mb-6">Please complete the assessment first.</p>
          <Button onClick={() => router.push("/quick-quiz")} className="bg-[#92278F] hover:bg-[#7a1f78]">
            Take Assessment
          </Button>
        </div>
      </div>
    )
  }

  // Extract style information from the database profile
  const influenceStyle = dbProfile.influence_style
  const styles = influenceStyle.split('-')
  const primaryStyle = styles[0]
  const secondaryStyle = styles.length > 1 ? styles[1] : null

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
                <p className="text-sm text-gray-600">Your Snapshot Profile</p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={() => router.push("/influence-demo")}
              className="text-gray-600 hover:text-[#92278F]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Demo
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header Card */}
        <Card className="mb-8 border-2 border-[#92278F]/20 bg-gradient-to-r from-[#92278F]/5 to-purple-50">
          <CardContent className="p-8 text-center">
            <div className="flex justify-center items-center space-x-4 mb-6">
              <div className={`w-16 h-16 ${getStyleColor(primaryStyle)} rounded-full flex items-center justify-center text-white`}>
                {getStyleIcon(primaryStyle)}
              </div>
              {secondaryStyle && (
                <>
                  <div className="text-2xl font-bold text-[#92278F]">+</div>
                  <div className={`w-16 h-16 ${getStyleColor(secondaryStyle)} rounded-full flex items-center justify-center text-white`}>
                    {getStyleIcon(secondaryStyle)}
                  </div>
                </>
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {primaryStyle.charAt(0).toUpperCase() + primaryStyle.slice(1)}
              {secondaryStyle && <span> + {secondaryStyle.charAt(0).toUpperCase() + secondaryStyle.slice(1)}</span>}
            </h1>
            <p className="text-gray-600 mb-4">
              Hi {user.firstName}! Here's your personalized influence style snapshot.
            </p>
            <Badge className="bg-[#92278F] text-white text-lg px-4 py-2">Snapshot Profile</Badge>
          </CardContent>
        </Card>

        {/* Superpower Card */}
        <Card className="mb-8 border-2 border-[#92278F]/20 from-[#92278F]/5 to-purple-50">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Your Superpower</h2>
            <div className="text-gray-600 text-lg">
              {dbProfile.snapshot_profile ? formatProfileText(dbProfile.snapshot_profile) : "Loading your superpower..."}
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="border-2 border-[#92278F] bg-gradient-to-r from-[#92278F]/10 to-purple-50">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-[#92278F] rounded-full flex items-center justify-center mx-auto mb-4">
              <Unlock className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              💥 Ready to access The Influence Engine™?
            </h2>
            <p className="text-gray-600 mb-6 text-lg">
              Unlock The Influence Engine™—the AI-powered influence coaching system built for {primaryStyle} leaders who want to maximize
              their influence and impact.
            </p>
            <Button
              onClick={handleContinue}
              size="lg"
              className="bg-[#92278F] hover:bg-[#7a1f78] text-white px-8 py-4 text-lg font-semibold"
            >
              Access The Influence Engine™
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <p className="text-sm text-gray-500 mt-4">
              Next: Review and sign NDA to access The Influence Engine™
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

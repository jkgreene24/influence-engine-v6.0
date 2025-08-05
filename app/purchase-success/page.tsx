"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, CheckCircle, Gift, Users, Zap, Navigation, Link, Anchor } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

export default function PurchaseSuccessPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sessionId, setSessionId] = useState<string>("")
  const [fullProfile, setFullProfile] = useState<any>(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("current_influence_user") || "null")
    if (!currentUser) {
      router.push("/")
      return
    }

    const sessionIdParam = searchParams.get("session_id")
    if (sessionIdParam) {
      setSessionId(sessionIdParam)
    }

    setUser(currentUser)
    setLoading(false)
  }, [router, searchParams])

  // Fetch full profile when user is loaded
  useEffect(() => {
    if (user && !fullProfile) {
      fetchFullProfile(user)
    }
  }, [user])

  const fetchFullProfile = async (userData: any) => {
    setProfileLoading(true)
    try {
      const primaryStyle = userData.primaryInfluenceStyle?.toLowerCase()
      const secondaryStyle = userData.secondaryInfluenceStyle?.toLowerCase()
      
      const styleCombinations = []
      if (primaryStyle && secondaryStyle) {
        styleCombinations.push(`${primaryStyle}-${secondaryStyle}`)
      }
      if (primaryStyle) {
        styleCombinations.push(primaryStyle)
      }
      if (primaryStyle && secondaryStyle) {
        styleCombinations.push(`${secondaryStyle}-${primaryStyle}`)
      }

      console.log("Trying style combinations for full profile:", styleCombinations)

      for (const styleKey of styleCombinations) {
        console.log("Fetching full profile for style:", styleKey)
        const response = await fetch(`/api/get-full-profile?style=${styleKey}`)
        const data = await response.json()
        
        if (response.ok) {
          console.log("Full profile found for style:", styleKey, data)
          setFullProfile(data)
          return
        }
      }
      console.log("No full profile found for any style combination")
    } catch (error) {
      console.error("Error fetching full profile:", error)
    } finally {
      setProfileLoading(false)
    }
  }

  const formatProfileText = (text: string) => {
    if (!text) return ""
    const paragraphs = text.split(/\n\n+/)
    return paragraphs.map((paragraph, index) => {
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

  const handleAccessToolkit = () => {
    // This would redirect to the actual toolkit access
    alert("Toolkit access will be provided via email within 24 hours!")
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
                <p className="text-sm text-gray-600">Purchase Successful</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Success Card */}
        <Card className="mb-8 border-2 border-green-200 bg-green-50">
          <CardContent className="py-12">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">🎉 Purchase Successful!</h1>
            <p className="text-xl text-gray-600 mb-6">
              Thank you {user.firstName}! Your {user.primaryInfluenceStyle}
              {user.secondaryInfluenceStyle && ` + ${user.secondaryInfluenceStyle}`} toolkit is now yours.
            </p>

            {sessionId && (
              <div className="bg-white rounded-lg p-4 mb-6 border">
                <p className="text-sm text-gray-600 mb-2">Transaction ID:</p>
                <p className="font-mono text-sm bg-gray-100 p-2 rounded">{sessionId}</p>
                <p className="text-sm text-gray-600 mt-2">Payment Date:</p>
                <p className="text-sm font-medium">{new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
              </div>
            )}

            <div className="bg-white rounded-lg p-6 mb-8 border">
              <h3 className="font-bold text-gray-900 mb-4">What's Next:</h3>
              <div className="text-left space-y-3">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Payment processed successfully ✓</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Toolkit access granted ✓</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Welcome email sent ✓</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Community access activated ✓</span>
                </div>
              </div>
            </div>

                         {/* Full Profile Display */}
             {fullProfile && (
               <Card className="mb-8 border-2 border-[#92278F]/20 bg-gradient-to-r from-[#92278F]/5 to-purple-50">
                 <CardContent className="p-8">
                   <div className="text-center mb-6">
                     <div className={`w-16 h-16 ${getStyleColor(user.primaryInfluenceStyle)} rounded-full flex items-center justify-center mx-auto mb-4`}>
                       {getStyleIcon(user.primaryInfluenceStyle)}
                     </div>
                     <h2 className="text-2xl font-bold text-gray-900 mb-2">
                       {user.primaryInfluenceStyle}
                       {user.secondaryInfluenceStyle && ` → ${user.secondaryInfluenceStyle}`} Full Toolkit
                     </h2>
                     <p className="text-gray-600">Your complete influence framework is now unlocked</p>
                   </div>
                   
                    <div className="bg-white rounded-lg p-6 border">
                      <h3 className="font-bold text-gray-900 mb-4">Complete Influence Style Framework</h3>
                      <div className="text-gray-700 text-lg leading-relaxed">
                        {fullProfile.full_profile ? formatProfileText(fullProfile.full_profile) : "Loading your complete toolkit..."}
                      </div>
                    </div>
                 </CardContent>
               </Card>
             )}

             {profileLoading && (
               <Card className="mb-8 border-2 border-[#92278F]/20 bg-gradient-to-r from-[#92278F]/5 to-purple-50">
                 <CardContent className="p-8 text-center">
                   <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#92278F] mx-auto mb-4"></div>
                   <p className="text-gray-600">Loading your complete toolkit...</p>
                 </CardContent>
               </Card>
             )}

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
               {/* Toolkit Access */}
               <Card className="border-2 border-[#92278F]/20 bg-gradient-to-r from-[#92278F]/5 to-purple-50">
                 <CardContent className="p-6 text-center">
                   <div className={`w-12 h-12 ${getStyleColor(user.primaryInfluenceStyle)} rounded-full flex items-center justify-center mx-auto mb-3`}>
                     {getStyleIcon(user.primaryInfluenceStyle)}
                   </div>
                   <h3 className="font-semibold text-gray-900 mb-2">Your Toolkit</h3>
                   <p className="text-sm text-gray-600 mb-4">
                     Complete {user.primaryInfluenceStyle} influence framework with advanced strategies
                   </p>
                   <Button
                     onClick={handleAccessToolkit}
                     size="sm"
                     className="bg-[#92278F] hover:bg-[#7a1f78] text-white"
                   >
                     Access Toolkit
                     <ArrowRight className="ml-2 w-4 h-4" />
                   </Button>
                 </CardContent>
               </Card>

               {/* Community Access */}
               <Card className="border-2 border-blue-200 bg-blue-50">
                 <CardContent className="p-6 text-center">
                   <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                     <Users className="w-6 h-6 text-white" />
                   </div>
                   <h3 className="font-semibold text-gray-900 mb-2">Community</h3>
                   <p className="text-sm text-gray-600 mb-4">
                     Join our private Notion hub and Slack community for support
                   </p>
                   <Button
                     variant="outline"
                     size="sm"
                     className="border-blue-500 text-blue-600 hover:bg-blue-50"
                   >
                     Join Community
                     <ArrowRight className="ml-2 w-4 h-4" />
                   </Button>
                 </CardContent>
               </Card>
             </div>

                         <div className="bg-white rounded-lg p-6 mb-8 border">
               <h3 className="font-bold text-gray-900 mb-4">📧 Automated Email Coming Soon</h3>
               <p className="text-gray-600 mb-4">
                 You'll receive an automated email within 24 hours with:
               </p>
               <div className="text-left space-y-2">
                 <div className="flex items-center space-x-2">
                   <Gift className="w-4 h-4 text-green-500" />
                   <span className="text-gray-700">Complete {user.primaryInfluenceStyle} toolkit document (PDF)</span>
                 </div>
                 <div className="flex items-center space-x-2">
                   <Gift className="w-4 h-4 text-green-500" />
                   <span className="text-gray-700">Notion resource hub invitation link</span>
                 </div>
                 <div className="flex items-center space-x-2">
                   <Gift className="w-4 h-4 text-green-500" />
                   <span className="text-gray-700">Slack community invitation link</span>
                 </div>
                 <div className="flex items-center space-x-2">
                   <Gift className="w-4 h-4 text-green-500" />
                   <span className="text-gray-700">Getting started guide and next steps</span>
                 </div>
               </div>
             </div>

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
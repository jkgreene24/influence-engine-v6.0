"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PostQuizFunnelState } from "@/lib/utils/post-quiz-funnel-state"
import { Zap, Users, Navigation, Unlock, Link, Anchor } from "lucide-react"

interface SnapshotDeliveryProps {
  funnelState: PostQuizFunnelState
  onNext: () => void
}

export default function SnapshotDelivery({ funnelState, onNext }: SnapshotDeliveryProps) {
  const [dbProfile, setDbProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSnapshotProfile()
  }, [])

  const fetchSnapshotProfile = async () => {
    try {
      console.log("=== SNAPSHOT PROFILE FETCH START ===")
      console.log("Funnel state:", funnelState)
      console.log("Fetching snapshot profile for style:", funnelState.influenceStyle)
      
      let profileData = null
      
      if (isBlend && secondaryStyle) {
        // For blends, try to fetch a blend-specific profile first
        console.log("Fetching blend profile for:", `${funnelState.influenceStyle}-${secondaryStyle}`)
        const blendUrl = `/api/get-influence-profile?style=${funnelState.influenceStyle.toLowerCase()}-${secondaryStyle.toLowerCase()}`
        console.log("Trying blend URL:", blendUrl)
        
        try {
          const blendResponse = await fetch(blendUrl)
          if (blendResponse.ok) {
            const blendData = await blendResponse.json()
            console.log("Blend profile found:", blendData)
            profileData = blendData
          } else {
            console.log("No blend profile found, will combine individual profiles")
          }
        } catch (error) {
          console.log("Error fetching blend profile, will combine individual profiles")
        }
        
        // If no blend profile found, fetch both individual profiles
        if (!profileData) {
          console.log("Fetching individual profiles for blend")
          const [primaryResponse, secondaryResponse] = await Promise.all([
            fetch(`/api/get-influence-profile?style=${funnelState.influenceStyle.toLowerCase()}`),
            fetch(`/api/get-influence-profile?style=${secondaryStyle.toLowerCase()}`)
          ])
          
          if (primaryResponse.ok && secondaryResponse.ok) {
            const [primaryData, secondaryData] = await Promise.all([
              primaryResponse.json(),
              secondaryResponse.json()
            ])
            
            // Create a combined blend profile
            profileData = {
              ...primaryData,
              influence_style: `${funnelState.influenceStyle}-${secondaryStyle}`,
              snapshot_profile: `🧭 ${getStyleDisplayName(funnelState.influenceStyle)}-${getStyleDisplayName(secondaryStyle)} Blend Snapshot\n\n🎯 Your Superpower: You combine the strategic vision of a ${getStyleDisplayName(funnelState.influenceStyle)} with the dynamic energy of a ${getStyleDisplayName(secondaryStyle)}.\n\n🔍 Key Blind Spot: You might overthink situations where quick action is needed, or rush into action without proper planning.\n\n🚀 Quick Action: When facing a decision, pause for 30 seconds to assess if you need more strategy or more momentum.`,
              full_profile: `🧭 ${getStyleDisplayName(funnelState.influenceStyle)}-${getStyleDisplayName(secondaryStyle)} Blend | Complete Influence Style Toolkit\n\nThis is your comprehensive guide to mastering your unique blend of ${getStyleDisplayName(funnelState.influenceStyle)} and ${getStyleDisplayName(secondaryStyle)} influence styles.`
            }
            console.log("Created combined blend profile:", profileData)
          }
        }
      } else {
        // For single styles, fetch the individual profile
        const url = `/api/get-influence-profile?style=${funnelState.influenceStyle.toLowerCase()}`
        console.log("Fetching from URL:", url)
        
        const response = await fetch(url)
        console.log("API response status:", response.status)
        
        const data = await response.json()
        console.log("API response data:", data)
        
        if (response.ok) {
          console.log("Snapshot profile found:", data)
          profileData = data
        } else {
          console.log("No profile found in database, using fallback")
          console.log("Error response:", data)
        }
      }
      
      if (profileData) {
        setDbProfile(profileData)
      } else {
        // If no profile found, we'll use the basic style info
        setDbProfile(null)
      }
    } catch (error) {
      console.error("Error fetching snapshot profile:", error)
      setDbProfile(null)
    } finally {
      setLoading(false)
      console.log("=== SNAPSHOT PROFILE FETCH COMPLETE ===")
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

  const getStyleDisplayName = (style: string) => {
    const styleNames: Record<string, string> = {
      catalyst: "Catalyst",
      diplomat: "Diplomat", 
      anchor: "Anchor",
      navigator: "Navigator",
      connector: "Connector"
    }
    const normalizedStyle = style.toLowerCase()
    return styleNames[normalizedStyle] || style
  }

  const getStyleDescription = (style: string) => {
    const descriptions: Record<string, string> = {
      catalyst: "You create momentum and drive outcomes. People follow you because of your energy, confidence, and push-forward mindset.",
      diplomat: "You influence through empathy and presence. People open up around you and feel understood and supported.",
      anchor: "You provide consistency and structure. People trust you because you're steady, clear, and dependable.",
      navigator: "You lead with vision and strategic thinking. You zoom out and keep the big picture in focus.",
      connector: "You build bridges. You create alignment and connection that brings people together to make progress."
    }
    const normalizedStyle = style.toLowerCase()
    return descriptions[normalizedStyle] || ""
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

  const primaryStyle = funnelState.influenceStyle
  const secondaryStyle = funnelState.secondaryStyle
  const isBlend = funnelState.isBlend

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#92278F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your snapshot profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-[#92278F] to-[#a83399] text-white py-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img src="/logo.png" alt="Logo" className="w-12 h-12 rounded-full" />
            <span className="text-2xl font-bold tracking-tight">The Influence Engine™</span>
          </div>
          <h1 className="text-4xl font-bold mb-2">🎯 Here's your Influence Style Snapshot!</h1>
          <p className="text-xl text-white/90">
            This quick profile is your starting point — it reveals your natural way of leading, persuading, and connecting with others.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Style Identity Card */}
        <Card className="border-2 border-[#92278F]/20 bg-gradient-to-r from-[#92278F]/5 to-purple-50 mb-8">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              {isBlend && secondaryStyle ? (
                <div className="flex justify-center items-center space-x-4">
                  <div className={`w-20 h-20 ${getStyleColor(primaryStyle)} rounded-full flex items-center justify-center text-white`}>
                    {getStyleIcon(primaryStyle)}
                  </div>
                  <div className="text-2xl font-bold text-gray-600">+</div>
                  <div className={`w-20 h-20 ${getStyleColor(secondaryStyle)} rounded-full flex items-center justify-center text-white`}>
                    {getStyleIcon(secondaryStyle)}
                  </div>
                </div>
              ) : (
                <div className={`w-24 h-24 ${getStyleColor(primaryStyle)} rounded-full flex items-center justify-center text-white mx-auto`}>
                  {getStyleIcon(primaryStyle)}
                </div>
              )}
              
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {isBlend && secondaryStyle 
                    ? `${getStyleDisplayName(primaryStyle)}–${getStyleDisplayName(secondaryStyle)} Blend`
                    : `Your Influence Style: ${getStyleDisplayName(primaryStyle)}`
                  }
                </h2>
                <p className="text-lg text-gray-700">
                  {isBlend && secondaryStyle 
                    ? `You combine the ${getStyleDescription(primaryStyle).toLowerCase()} with the ${getStyleDescription(secondaryStyle).toLowerCase()} This gives you a unique ability to adapt your approach based on the situation.`
                    : getStyleDescription(primaryStyle)
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Snapshot Profile Content */}
        {dbProfile && dbProfile.snapshot_profile ? (
          <Card className="mb-8 border-2 border-[#92278F]/20 from-[#92278F]/5 to-purple-50">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Your Superpower</h2>
              <div className="text-gray-600 text-lg">
                {formatProfileText(dbProfile.snapshot_profile)}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900 text-center">Inside your snapshot you'll see:</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                  ✅
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">A headline strength that defines how you influence</h3>
                  <p className="text-gray-600">Your natural communication patterns that others respond to</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                  🔎
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">One key blind spot that could stall your deals</h3>
                  <p className="text-gray-600">The subtle patterns that might be holding you back</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                  🚀
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Quick action tip to put into practice today</h3>
                  <p className="text-gray-600">An immediate way to strengthen your influence</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-8 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-lg text-blue-900 mb-4">
                💡 This is just the beginning. Your full style has far more depth — but here's your first taste.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center space-y-6">
          <Button
            onClick={onNext}
            className="bg-[#92278F] hover:bg-[#7a1f78] text-white px-8 py-3 text-lg font-semibold"
          >
            Unlock My Full Toolkit →
          </Button>
          <p className="text-sm text-gray-500">Next: Get your complete influence style toolkit</p>
        </div>
      </div>
    </div>
  )
}

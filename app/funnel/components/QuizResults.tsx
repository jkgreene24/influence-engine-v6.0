"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Zap, Users, Anchor, Navigation, Link, Target, Shield, Crown, Star } from "lucide-react"
import { type FunnelState } from "@/lib/utils/funnel-state"
import { automationHelpers } from "@/lib/utils/mock-automation"

interface QuizResultsProps {
  funnelState: FunnelState
  updateFunnelState: (newState: Partial<FunnelState>) => void
  goToNextStep: () => void
}

interface StyleInfo {
  name: string
  description: string
  strengths: string[]
  icon: any
  color: string
  bgColor: string
}

const styleInfo: Record<string, StyleInfo> = {
  "Catalyst": {
    name: "Catalyst",
    description: "You lead with urgency and bold energy, moving people into action.",
    strengths: ["Directness", "momentum", "fast decision-making"],
    icon: Zap,
    color: "text-orange-600",
    bgColor: "bg-orange-100"
  },
  "Connector": {
    name: "Connector",
    description: "You lead by bringing people together and creating alignment.",
    strengths: ["Group awareness", "facilitation", "collaboration"],
    icon: Link,
    color: "text-purple-600",
    bgColor: "bg-purple-100"
  },
  "Diplomat": {
    name: "Diplomat",
    description: "You create emotional safety and hold space for others to thrive.",
    strengths: ["Empathy", "conflict reduction", "emotional clarity"],
    icon: Users,
    color: "text-pink-600",
    bgColor: "bg-pink-100"
  },
  "Anchor": {
    name: "Anchor",
    description: "You lead with structure, consistency, and grounded presence.",
    strengths: ["Stability", "process", "reliability"],
    icon: Anchor,
    color: "text-green-600",
    bgColor: "bg-green-100"
  },
  "Navigator": {
    name: "Navigator",
    description: "You see long-range patterns and guide others with insight and foresight.",
    strengths: ["Strategy", "vision", "pattern recognition"],
    icon: Navigation,
    color: "text-blue-600",
    bgColor: "bg-blue-100"
  },
  "Catalyst-Connector": {
    name: "Catalyst–Connector",
    description: "You drive change with both action and group momentum.",
    strengths: ["Energy", "inclusivity", "social clarity"],
    icon: Zap,
    color: "text-orange-600",
    bgColor: "bg-orange-100"
  },
  "Connector-Diplomat": {
    name: "Connector–Diplomat",
    description: "You build trust through connection and emotional awareness.",
    strengths: ["Relational harmony", "empathy", "mediation"],
    icon: Link,
    color: "text-purple-600",
    bgColor: "bg-purple-100"
  },
  "Anchor-Navigator": {
    name: "Anchor–Navigator",
    description: "You stabilize the present while guiding toward the future.",
    strengths: ["Planning", "system design", "steadiness"],
    icon: Anchor,
    color: "text-green-600",
    bgColor: "bg-green-100"
  },
  "Navigator-Anchor": {
    name: "Navigator–Anchor",
    description: "You structure ideas into clear strategies with long-term value.",
    strengths: ["Strategic calm", "foresight", "planning"],
    icon: Navigation,
    color: "text-blue-600",
    bgColor: "bg-blue-100"
  },
  "Catalyst-Diplomat": {
    name: "Catalyst–Diplomat",
    description: "You spark action with emotional clarity and courage.",
    strengths: ["Momentum with heart", "trust-building"],
    icon: Zap,
    color: "text-orange-600",
    bgColor: "bg-orange-100"
  },
  "Navigator-Catalyst": {
    name: "Navigator–Catalyst",
    description: "You combine strategic foresight with bold execution.",
    strengths: ["Vision", "decisive action", "influence"],
    icon: Navigation,
    color: "text-blue-600",
    bgColor: "bg-blue-100"
  },
  "Diplomat-Anchor": {
    name: "Diplomat–Anchor",
    description: "You offer calm emotional steadiness and dependable support.",
    strengths: ["Safe presence", "loyalty", "follow-through"],
    icon: Users,
    color: "text-pink-600",
    bgColor: "bg-pink-100"
  }
}

export default function QuizResults({ funnelState, updateFunnelState, goToNextStep }: QuizResultsProps) {
  const [loading, setLoading] = useState(false)

  const influenceStyle = funnelState.influenceStyle || "Connector"
  const secondaryStyle = funnelState.secondaryStyle
  const style = styleInfo[influenceStyle] || styleInfo["Connector"]
  const Icon = style.icon

  const handleContinue = async () => {
    setLoading(true)
    
    try {
      // Tag quiz completion in automation
      if (funnelState.userData?.email) {
        await automationHelpers.tagQuizEvents(funnelState.userData.email, influenceStyle)
        await automationHelpers.tagQuizCompletion(funnelState.userData.email)
      }
    } catch (error) {
      console.error('Failed to tag quiz completion:', error)
    }

    // Update step and continue
    updateFunnelState({ step: 'results' })
    goToNextStep()
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
                <p className="text-sm text-gray-600">AI-Powered Leadership Coaching</p>
              </div>
            </div>
            <Badge variant="outline" className="text-sm">
              Quiz Complete
            </Badge>
          </div>
        </div>
      </header>

      {/* Results Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Your Influence Style Revealed
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Based on your responses, here's how you naturally influence and lead others.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Result */}
          <div className="lg:col-span-2">
            <Card className="mb-8">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <div className={`w-20 h-20 ${style.bgColor} rounded-full flex items-center justify-center mx-auto mb-6`}>
                    <Icon className={`w-10 h-10 ${style.color}`} />
                  </div>
                  
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Your Influence Style: {style.name}
                  </h2>
                  
                  <p className="text-xl text-gray-600 mb-6 max-w-2xl mx-auto">
                    {style.description}
                  </p>

                  {secondaryStyle && (
                    <div className="mb-6">
                      <Badge variant="outline" className="text-sm">
                        Secondary: {secondaryStyle}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Communication Strengths */}
                <div className="bg-gray-50 rounded-lg p-6 mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Target className="w-5 h-5 mr-2 text-[#92278F]" />
                    Your Communication Strengths
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    {style.strengths.map((strength, index) => (
                      <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center space-x-2">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="font-medium text-gray-900">{strength}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* What This Means */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">What This Means for You</h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                      <h4 className="font-semibold text-blue-900 mb-3">Your Natural Approach</h4>
                      <p className="text-blue-800 text-sm">
                        You naturally {style.description.toLowerCase()}. This is your default way of influencing others and getting things done.
                      </p>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                      <h4 className="font-semibold text-green-900 mb-3">Your Unique Value</h4>
                      <p className="text-green-800 text-sm">
                        Your {style.strengths[0].toLowerCase()} and {style.strengths[1].toLowerCase()} make you particularly effective in situations that require your specific approach.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Next Steps */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What's Next?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-[#92278F] text-white rounded-full flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Get Your Personalized Resources</h4>
                      <p className="text-sm text-gray-600">Access tools and strategies tailored to your influence style.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-[#92278F] text-white rounded-full flex items-center justify-center text-sm font-bold">
                      2
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Join The Influence Engine™</h4>
                      <p className="text-sm text-gray-600">Get ongoing coaching and support to master your influence.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-[#92278F] text-white rounded-full flex items-center justify-center text-sm font-bold">
                      3
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Connect with Your Community</h4>
                      <p className="text-sm text-gray-600">Meet other leaders who share your influence approach.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Button */}
              <Button
                onClick={handleContinue}
                disabled={loading}
                className="w-full bg-[#92278F] hover:bg-[#7a1f78] text-white py-4 text-lg font-semibold"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>Continue to Resources</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </Button>

              {/* Share Results */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Share Your Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Share your influence style with your team and network.
                  </p>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <span>📧 Email Results</span>
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <span>📱 Share on LinkedIn</span>
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <span>📋 Copy Link</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

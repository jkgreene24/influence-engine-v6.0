"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, Users, Anchor, Link, Navigation, ArrowRight, Star, Target, MessageCircle } from "lucide-react"
import { type FunnelState } from "@/lib/utils/funnel-state"

interface QuizResultsProps {
  funnelState: FunnelState
  updateFunnelState: (newState: Partial<FunnelState>) => void
  goToNextStep: () => void
}

// Style definitions with descriptions and strengths
const styleDefinitions = {
  catalyst: {
    name: "Catalyst",
    icon: <Zap className="w-8 h-8" />,
    color: "bg-orange-500",
    description: "You drive action and create momentum through energy and urgency",
    strengths: [
      "Natural ability to motivate and energize teams",
      "Quick decision-making in high-pressure situations",
      "Excellent at breaking through resistance and inertia",
      "Strong presence that commands attention"
    ],
    howOthersSeeYou: "Others see you as dynamic, decisive, and action-oriented. You're the person who gets things moving when others are stuck.",
    quickWin: "Use your energy to create urgency around important deadlines and decisions."
  },
  navigator: {
    name: "Navigator",
    icon: <Navigation className="w-8 h-8" />,
    color: "bg-blue-500",
    description: "You guide with strategic vision and long-term thinking",
    strengths: [
      "Exceptional strategic planning and foresight",
      "Ability to see the big picture and connect dots",
      "Strong analytical and problem-solving skills",
      "Natural leadership through vision and direction"
    ],
    howOthersSeeYou: "Others see you as thoughtful, strategic, and wise. You're the person they turn to for guidance on complex decisions.",
    quickWin: "Share your strategic insights to help others understand the 'why' behind decisions."
  },
  diplomat: {
    name: "Diplomat",
    icon: <Users className="w-8 h-8" />,
    color: "bg-pink-500",
    description: "You build trust through empathy and emotional intelligence",
    strengths: [
      "Exceptional emotional intelligence and empathy",
      "Natural ability to build rapport and trust",
      "Skilled at resolving conflicts and finding common ground",
      "Strong listening and communication skills"
    ],
    howOthersSeeYou: "Others see you as caring, trustworthy, and emotionally intelligent. You're the person they confide in and seek advice from.",
    quickWin: "Use your empathy to understand others' perspectives before making decisions."
  },
  anchor: {
    name: "Anchor",
    icon: <Anchor className="w-8 h-8" />,
    color: "bg-green-500",
    description: "You provide stability and reliable structure in chaos",
    strengths: [
      "Exceptional organizational and execution skills",
      "Reliable and consistent follow-through",
      "Strong attention to detail and quality",
      "Natural ability to create order from chaos"
    ],
    howOthersSeeYou: "Others see you as reliable, organized, and trustworthy. You're the person they count on to get things done right.",
    quickWin: "Use your organizational skills to create clear processes that help others succeed."
  },
  connector: {
    name: "Connector",
    icon: <Link className="w-8 h-8" />,
    color: "bg-purple-500",
    description: "You unify people and create alignment across differences",
    strengths: [
      "Natural ability to build bridges between people",
      "Skilled at finding common ground and shared goals",
      "Strong networking and relationship-building skills",
      "Ability to translate between different perspectives"
    ],
    howOthersSeeYou: "Others see you as collaborative, inclusive, and unifying. You're the person who brings diverse groups together.",
    quickWin: "Use your connecting skills to align different stakeholders around shared objectives."
  }
}

export default function QuizResults({ funnelState, updateFunnelState, goToNextStep }: QuizResultsProps) {
  const influenceStyle = funnelState.influenceStyle?.toLowerCase()
  const style = influenceStyle ? styleDefinitions[influenceStyle as keyof typeof styleDefinitions] : null

  useEffect(() => {
    // Auto-advance to next step after 5 seconds
    const timer = setTimeout(() => {
      goToNextStep()
    }, 5000)

    return () => clearTimeout(timer)
  }, [goToNextStep])

  if (!style) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading your results...</p>
        </div>
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
                <p className="text-sm text-gray-600">AI-Powered Leadership Coaching</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Results Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Your Influence Style Snapshot
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Here's your Influence Style — a quick glimpse at how you naturally connect, persuade, and inspire action.
          </p>
        </div>

        {/* Style Card */}
        <Card className="mb-8 border-2 border-gray-200 shadow-lg">
          <CardHeader className="text-center pb-6">
            <div className={`w-20 h-20 ${style.color} rounded-full flex items-center justify-center mx-auto mb-4 text-white`}>
              {style.icon}
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
              {style.name}
            </CardTitle>
            <p className="text-lg text-gray-600">
              {style.description}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Core Strengths */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Star className="w-5 h-5 text-[#92278F] mr-2" />
                Your Style's Core Strengths
              </h3>
              <ul className="space-y-2">
                {style.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-[#92278F] rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* How Others See You */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Users className="w-5 h-5 text-[#92278F] mr-2" />
                How Others See You
              </h3>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                {style.howOthersSeeYou}
              </p>
            </div>

            {/* Quick Win */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Target className="w-5 h-5 text-[#92278F] mr-2" />
                One Thing You Can Do Right Now
              </h3>
              <p className="text-gray-700 bg-[#92278F]/5 p-4 rounded-lg border border-[#92278F]/20">
                {style.quickWin}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-6">
            But this is just the start. The next step is unlocking the full playbook for your style.
          </p>
          <Button
            onClick={goToNextStep}
            className="bg-[#92278F] hover:bg-[#7a1f78] text-white px-8 py-3 text-lg font-semibold"
          >
            See How to Unlock My Full Style
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>

        {/* Auto-advance notice */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Continuing automatically in a few seconds...
          </p>
        </div>
      </div>
    </div>
  )
}

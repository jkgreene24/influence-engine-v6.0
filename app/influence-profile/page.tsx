"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, Zap, Users, Target, Navigation, Eye, MessageCircle, Unlock, Star } from "lucide-react"
import { useRouter } from "next/navigation"

// Snapshot profile templates
const snapshotProfiles = {
  "Navigator-Connector": {
    primary: "Navigator",
    secondary: "Connector",
    primaryIcon: <Navigation className="w-6 h-6" />,
    secondaryIcon: <Users className="w-6 h-6" />,
    superpower:
      "You lead with logic—but connect with care. You create clarity in conversations and emotional traction. People trust your thinking—and feel safe because you invite them into it. You don't overpower, you orchestrate.",
    offTrack:
      "You can get stuck between preparation and people-pleasing. You overthink how others might feel, and in trying to be thoughtful, you hesitate too long—or dilute your insight.",
    peopleSay: [
      "You always make things feel both smart and human.",
      "You don't miss the emotional undercurrents.",
      "You're the calm voice that helps everyone make sense of things.",
    ],
    influenceMoves: [
      "Framing insights in accessible, human language",
      "Creating structure without shutting down emotion",
      "Helping others feel both seen and supported through clear direction",
    ],
    unlockResults:
      "You shift tension by breaking down complexity and tuning into emotional energy. You're not forceful—but when you clarify something everyone's been circling, people relax and follow.",
    spotThis: [
      "Clarifying questions that soften the conversation",
      "Summaries that honor both head and heart",
      "Steady, attuned tone—especially in high-stakes discussions",
    ],
  },
  "Catalyst-Diplomat": {
    primary: "Catalyst",
    secondary: "Diplomat",
    primaryIcon: <Zap className="w-6 h-6" />,
    secondaryIcon: <Users className="w-6 h-6" />,
    superpower:
      "You drive action with heart. You create urgency while staying emotionally connected. People follow your energy because they trust you see them—not just the goal. You're the spark that ignites both momentum and meaning.",
    offTrack:
      "You can burn out trying to move fast while caring for everyone. Sometimes your urgency clashes with your empathy, leaving you torn between pushing forward and slowing down for others.",
    peopleSay: [
      "You make things happen without leaving people behind.",
      "You have this way of making urgent feel exciting, not stressful.",
      "You care about the work AND the people doing it.",
    ],
    influenceMoves: [
      "Creating urgency while acknowledging emotional impact",
      "Building momentum through emotional connection",
      "Driving results while maintaining psychological safety",
    ],
    unlockResults:
      "You transform resistance into enthusiasm by combining drive with genuine care. When people feel both pushed and supported, they move mountains.",
    spotThis: [
      "High-energy communication that includes emotional check-ins",
      "Quick decisions followed by 'How does everyone feel about this?'",
      "Passionate advocacy paired with genuine listening",
    ],
  },
  "Anchor-Navigator": {
    primary: "Anchor",
    secondary: "Navigator",
    primaryIcon: <Target className="w-6 h-6" />,
    secondaryIcon: <Navigation className="w-6 h-6" />,
    superpower:
      "You build with vision and stability. You create reliable systems while keeping the long-term picture in focus. People trust your foundation because it's built to last and designed with purpose. You're the steady force that turns strategy into reality.",
    offTrack:
      "You can get stuck in analysis paralysis, over-planning while opportunities pass by. Sometimes your need for both stability and strategic perfection prevents you from taking necessary action.",
    peopleSay: [
      "You think three steps ahead while keeping us grounded.",
      "You make complex plans feel achievable and safe.",
      "You're the person we trust to build something that lasts.",
    ],
    influenceMoves: [
      "Creating structured pathways to long-term goals",
      "Building confidence through thorough preparation",
      "Balancing immediate needs with future vision",
    ],
    unlockResults:
      "You transform chaos into sustainable progress by combining careful planning with steady execution. When people see your roadmap, they feel confident about the journey.",
    spotThis: [
      "Detailed plans that account for multiple scenarios",
      "Calm leadership during uncertain times",
      "Strategic questions that reveal long-term implications",
    ],
  },
  "Diplomat-Anchor": {
    primary: "Diplomat",
    secondary: "Anchor",
    primaryIcon: <Users className="w-6 h-6" />,
    secondaryIcon: <Target className="w-6 h-6" />,
    superpower:
      "You lead with empathy and reliability. You create emotional safety while providing steady structure. People trust you because you understand their feelings and give them solid ground to stand on. You're the caring foundation that never wavers.",
    offTrack:
      "You can get overwhelmed trying to support everyone while maintaining perfect systems. Sometimes your desire to help emotionally conflicts with your need for order and stability.",
    peopleSay: [
      "You make everyone feel heard and supported.",
      "You're the calm in any storm—emotionally and practically.",
      "You care deeply but never let things fall apart.",
    ],
    influenceMoves: [
      "Creating emotional safety through consistent structure",
      "Supporting others while maintaining clear boundaries",
      "Building trust through reliable emotional presence",
    ],
    unlockResults:
      "You heal dysfunction by combining genuine care with practical solutions. When people feel both understood and supported by solid systems, they thrive.",
    spotThis: [
      "Empathetic responses followed by practical next steps",
      "Consistent emotional availability without drama",
      "Structured support that feels warm, not rigid",
    ],
  },
  "Connector-Catalyst": {
    primary: "Connector",
    secondary: "Catalyst",
    primaryIcon: <Users className="w-6 h-6" />,
    secondaryIcon: <Zap className="w-6 h-6" />,
    superpower:
      "You unite people and ignite action. You build bridges between ideas and individuals, then energize everyone to move forward together. People follow you because you make them feel connected to something bigger and exciting.",
    offTrack:
      "You can exhaust yourself trying to keep everyone aligned while maintaining momentum. Sometimes your desire for unity slows down your natural drive for action.",
    peopleSay: [
      "You bring out the best in everyone and get us moving.",
      "You make collaboration feel energizing, not draining.",
      "You're the glue that holds teams together while pushing us forward.",
    ],
    influenceMoves: [
      "Building consensus that leads to immediate action",
      "Creating shared excitement around common goals",
      "Unifying diverse perspectives into forward momentum",
    ],
    unlockResults:
      "You transform fragmented groups into high-performing teams by connecting hearts and minds, then channeling that energy into results.",
    spotThis: [
      "Inclusive conversations that end with clear action steps",
      "High energy that brings people together rather than overwhelming them",
      "Natural ability to find common ground and build on it",
    ],
  },
}

// Single style profiles
const singleStyleProfiles = {
  Catalyst: {
    primary: "Catalyst",
    secondary: "",
    primaryIcon: <Zap className="w-6 h-6" />,
    secondaryIcon: <></>,
    superpower:
      "You are pure momentum. You see opportunity and act immediately, creating energy that pulls others forward. People follow your drive because your urgency is contagious and your confidence is magnetic.",
    offTrack:
      "You can burn out from constant action and leave others behind in your wake. Sometimes your speed creates chaos instead of progress.",
    peopleSay: [
      "You make things happen when everyone else is still talking.",
      "Your energy is infectious—you get us all fired up.",
      "You see possibilities where others see problems.",
    ],
    influenceMoves: [
      "Creating urgency that motivates rather than overwhelms",
      "Taking bold action that inspires others to follow",
      "Turning ideas into immediate momentum",
    ],
    unlockResults: "You break through inertia and resistance by demonstrating what's possible through decisive action.",
    spotThis: [
      "Quick decisions that energize the room",
      "Bold moves that others wouldn't dare make",
      "Infectious enthusiasm for new possibilities",
    ],
  },
  Navigator: {
    primary: "Navigator",
    secondary: "",
    primaryIcon: <Navigation className="w-6 h-6" />,
    secondaryIcon: <></>,
    superpower:
      "You see the bigger picture and chart the course forward. You think strategically while others think tactically, creating clarity about where to go and why it matters.",
    offTrack:
      "You can get lost in planning and lose touch with immediate needs. Sometimes your long-term focus makes you seem disconnected from current realities.",
    peopleSay: [
      "You always know where we're headed and why.",
      "You see around corners that others don't even notice.",
      "You make complex strategies feel clear and achievable.",
    ],
    influenceMoves: [
      "Connecting current actions to long-term vision",
      "Anticipating challenges before they become problems",
      "Creating strategic clarity that guides decision-making",
    ],
    unlockResults:
      "You transform confusion into direction by helping others see the path from where they are to where they need to be.",
    spotThis: [
      "Strategic questions that reveal hidden implications",
      "Long-term thinking that influences short-term decisions",
      "Calm confidence about the future direction",
    ],
  },
  Diplomat: {
    primary: "Diplomat",
    secondary: "",
    primaryIcon: <Users className="w-6 h-6" />,
    secondaryIcon: <></>,
    superpower:
      "You understand the human element in every situation. You read emotions, build trust, and create psychological safety that allows others to perform at their best.",
    offTrack:
      "You can get overwhelmed by everyone's emotions and lose sight of practical outcomes. Sometimes your empathy prevents you from making tough decisions.",
    peopleSay: [
      "You really get what people are going through.",
      "You make everyone feel safe to be themselves.",
      "You see the person behind the problem.",
    ],
    influenceMoves: [
      "Creating emotional safety that enables honest communication",
      "Reading between the lines to understand real concerns",
      "Building trust through genuine empathy and understanding",
    ],
    unlockResults:
      "You unlock potential by helping people feel truly seen and understood, which allows them to bring their best selves to the work.",
    spotThis: [
      "Deep listening that makes others feel heard",
      "Emotional intelligence that defuses tension",
      "Genuine care that builds lasting trust",
    ],
  },
  Anchor: {
    primary: "Anchor",
    secondary: "",
    primaryIcon: <Target className="w-6 h-6" />,
    secondaryIcon: <></>,
    superpower:
      "You provide stability and reliability in chaos. You create structure, follow through consistently, and give others solid ground to stand on when everything else is shifting.",
    offTrack:
      "You can become rigid and resist necessary changes. Sometimes your need for stability prevents adaptation to new circumstances.",
    peopleSay: [
      "You're the rock we can always count on.",
      "You keep everything organized and running smoothly.",
      "You never drop the ball—ever.",
    ],
    influenceMoves: [
      "Creating reliable systems that others can depend on",
      "Providing calm stability during turbulent times",
      "Following through consistently on commitments",
    ],
    unlockResults:
      "You enable others to take risks and innovate because they know you'll provide the stable foundation they need.",
    spotThis: [
      "Consistent follow-through that builds trust",
      "Calm presence during crisis situations",
      "Practical solutions that actually work",
    ],
  },
  Connector: {
    primary: "Connector",
    secondary: "",
    primaryIcon: <Users className="w-6 h-6" />,
    secondaryIcon: <></>,
    superpower:
      "You build bridges between people, ideas, and possibilities. You create alignment and shared understanding that transforms individual efforts into collective success.",
    offTrack:
      "You can get stuck trying to please everyone and lose sight of what needs to be done. Sometimes your desire for consensus prevents necessary decisions.",
    peopleSay: [
      "You bring people together like no one else can.",
      "You help us all see the bigger picture together.",
      "You make collaboration feel natural and easy.",
    ],
    influenceMoves: [
      "Building consensus that leads to unified action",
      "Creating shared understanding across different perspectives",
      "Facilitating connections that generate new possibilities",
    ],
    unlockResults:
      "You multiply impact by helping others see how their individual contributions connect to create something greater than the sum of its parts.",
    spotThis: [
      "Natural ability to find common ground",
      "Inclusive communication that brings everyone in",
      "Collaborative solutions that work for everyone",
    ],
  },
}

export default function InfluenceProfile() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [snapshotData, setSnapshotData] = useState<any>(null)
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
    generateSnapshotProfile(currentUser)
    setLoading(false)
  }, [router])

  const generateSnapshotProfile = (userData: any) => {
    const primaryStyle = userData.primaryInfluenceStyle
    const secondaryStyle = userData.secondaryInfluenceStyle

    let profileKey = primaryStyle
    if (secondaryStyle) {
      profileKey = `${primaryStyle}-${secondaryStyle}`
    }

    // Check if we have a specific blend profile
    let snapshot = snapshotProfiles[profileKey as keyof typeof snapshotProfiles]

    // If no specific blend, use single style
    if (!snapshot) {
      snapshot = singleStyleProfiles[primaryStyle as keyof typeof singleStyleProfiles]
    }

    setSnapshotData(snapshot)
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

  if (!snapshotData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Unable to generate profile</h2>
          <p className="text-gray-600 mb-6">Please complete the assessment first.</p>
          <Button onClick={() => router.push("/quick-quiz")} className="bg-[#92278F] hover:bg-[#7a1f78]">
            Take Assessment
          </Button>
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
              <div className="w-16 h-16 bg-[#92278F] rounded-full flex items-center justify-center text-white">
                {snapshotData.primaryIcon}
              </div>
              {snapshotData.secondary && (
                <>
                  <div className="text-2xl font-bold text-[#92278F]">→</div>
                  <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center text-white">
                    {snapshotData.secondaryIcon}
                  </div>
                </>
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🧭 {snapshotData.primary}
              {snapshotData.secondary && <span> → 🧩 {snapshotData.secondary}</span>}
            </h1>
            <p className="text-gray-600 mb-4">
              Hi {user.firstName}! Here's your personalized influence style snapshot.
            </p>
            <Badge className="bg-[#92278F] text-white text-lg px-4 py-2">Snapshot Profile</Badge>
          </CardContent>
        </Card>

        {/* Superpower */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-xl">
              <span>🎯</span>
              <span>Your Superpower</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 text-lg leading-relaxed">{snapshotData.superpower}</p>
          </CardContent>
        </Card>

        {/* Off Track */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-xl">
              <span>⚠️</span>
              <span>When You Go Off-Track...</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 text-lg leading-relaxed">{snapshotData.offTrack}</p>
          </CardContent>
        </Card>

        {/* People Say */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-xl">
              <span>🧠</span>
              <span>People Say...</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {snapshotData.peopleSay.map((quote: string, index: number) => (
                <div key={index} className="flex items-start space-x-3">
                  <MessageCircle className="w-5 h-5 text-[#92278F] mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700 italic">"{quote}"</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Influence Moves */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-xl">
              <span>🗣</span>
              <span>Your Influence Moves</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {snapshotData.influenceMoves.map((move: string, index: number) => (
                <div key={index} className="flex items-start space-x-3">
                  <Star className="w-5 h-5 text-[#92278F] mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">{move}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Unlock Results */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-xl">
              <span>🔓</span>
              <span>How You Unlock Results</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 text-lg leading-relaxed">{snapshotData.unlockResults}</p>
          </CardContent>
        </Card>

        {/* Spot This */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-xl">
              <span>👀</span>
              <span>Spot This In…</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {snapshotData.spotThis.map((item: string, index: number) => (
                <div key={index} className="flex items-start space-x-3">
                  <Eye className="w-5 h-5 text-[#92278F] mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">{item}</p>
                </div>
              ))}
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
              💥 Want your full {snapshotData.primary}
              {snapshotData.secondary && ` → ${snapshotData.secondary}`} toolkit?
            </h2>
            <p className="text-gray-600 mb-6 text-lg">
              Unlock the complete profile—built for {snapshotData.primary.toLowerCase()} leaders who want to maximize
              their influence and impact.
            </p>
            <Button
              onClick={handleContinue}
              size="lg"
              className="bg-[#92278F] hover:bg-[#7a1f78] text-white px-8 py-4 text-lg font-semibold"
            >
              Access Your Full Toolkit
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <p className="text-sm text-gray-500 mt-4">
              Next: Review and sign NDA to access your complete influence toolkit
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

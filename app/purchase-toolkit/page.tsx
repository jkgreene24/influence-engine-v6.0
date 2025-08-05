"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, CreditCard, Shield, CheckCircle, Zap, Users, Navigation, Link, Anchor } from "lucide-react"
import { useRouter } from "next/navigation"

export default function PurchaseToolkitPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const [purchased, setPurchased] = useState(false)
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

  const handlePurchase = async () => {
    setPurchasing(true)

    try {
      // Create Stripe checkout session
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userEmail: user.email,
          userName: `${user.firstName} ${user.lastName}`,
          influenceStyle: user.primaryInfluenceStyle,
          secondaryStyle: user.secondaryInfluenceStyle,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create checkout session")
      }

      const { sessionUrl } = await response.json()
      
      // Redirect to Stripe Checkout
      window.location.href = sessionUrl
    } catch (error) {
      console.error("Purchase error:", error)
      alert("Failed to initiate purchase. Please try again.")
    } finally {
      setPurchasing(false)
    }
  }

  const handleBackToProfile = () => {
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
                <p className="text-sm text-gray-600">Purchase Full Toolkit</p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={handleBackToProfile}
              className="text-gray-600 hover:text-[#92278F]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Profile
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
              <div className={`w-16 h-16 ${getStyleColor(user.primaryInfluenceStyle)} rounded-full flex items-center justify-center text-white`}>
                {getStyleIcon(user.primaryInfluenceStyle)}
              </div>
              {user.secondaryInfluenceStyle && (
                <>
                  <div className="text-2xl font-bold text-[#92278F]">+</div>
                  <div className={`w-16 h-16 ${getStyleColor(user.secondaryInfluenceStyle)} rounded-full flex items-center justify-center text-white`}>
                    {getStyleIcon(user.secondaryInfluenceStyle)}
                  </div>
                </>
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {user.primaryInfluenceStyle}
              {user.secondaryInfluenceStyle && ` + ${user.secondaryInfluenceStyle}`} Toolkit
            </h1>
            <p className="text-gray-600 mb-4">
              Hi {user.firstName}! Ready to unlock your complete influence toolkit?
            </p>
            <Badge className="bg-[#92278F] text-white text-lg px-4 py-2">Full Toolkit Access</Badge>
          </CardContent>
        </Card>

        {/* Pricing Card */}
        <Card className="mb-8 border-2 border-green-200 bg-green-50">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Complete Influence Style Toolkit</h2>
            <div className="text-4xl font-bold text-green-600 mb-2">$19.00</div>
            <p className="text-gray-600 mb-6">One-time purchase • Lifetime access</p>
            
            <div className="bg-white rounded-lg p-6 mb-6 border">
              <h3 className="font-bold text-gray-900 mb-4">What's Included:</h3>
              <div className="text-left space-y-3">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Complete {user.primaryInfluenceStyle} influence framework</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Advanced communication strategies</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Negotiation and persuasion techniques</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Leadership and team building tools</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Private Notion resource hub access</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Slack community membership</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">1-year license with renewal options</span>
                </div>
              </div>
            </div>

            <Button
              onClick={handlePurchase}
              disabled={purchasing}
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {purchasing ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5" />
                  <span>Purchase Toolkit - $19.00</span>
                </div>
              )}
            </Button>

            <p className="text-sm text-gray-500 mt-4">
              Secure payment powered by Stripe • 14-day money-back guarantee
            </p>
          </CardContent>
        </Card>

        {/* Security & Trust */}
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Secure & Trusted</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">SSL Encrypted</h3>
                <p className="text-sm text-gray-600">Bank-level security for all transactions</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Money-Back Guarantee</h3>
                <p className="text-sm text-gray-600">14-day refund policy if not satisfied</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Community Access</h3>
                <p className="text-sm text-gray-600">Join our private community for support</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 
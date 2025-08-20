"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, CheckCircle, Users, Zap, Navigation, Link, Anchor, Crown } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

export default function PurchaseSuccessPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sessionId, setSessionId] = useState<string>("")
  const [purchaseType, setPurchaseType] = useState<string>("toolkit")
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
    const typeParam = searchParams.get("type")
    
    if (sessionIdParam) {
      setSessionId(sessionIdParam)
    }
    
    if (typeParam) {
      setPurchaseType(typeParam)
    }

    setUser(currentUser)
    setLoading(false)
  }, [router, searchParams])

  // Fetch full profile when user is loaded (only for toolkit purchases)
  useEffect(() => {
    if (user && !fullProfile && purchaseType === "toolkit") {
      fetchFullProfile(user)
    }
  }, [user, purchaseType])

  const fetchFullProfile = async (userData: any) => {
    setProfileLoading(true)
    try {
      // First try to use the influenceStyle directly from the database
      if (userData.influenceStyle) {
        console.log("Using influenceStyle from database for full profile:", userData.influenceStyle)
        const response = await fetch(`/api/get-full-profile?style=${userData.influenceStyle.toLowerCase()}`)
        const data = await response.json()
        
        if (response.ok) {
          console.log("Full profile found for influenceStyle:", userData.influenceStyle, data)
          setFullProfile(data)
          return
        }
      }
      
      // Fallback to the old method using primary/secondary styles
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

      console.log("Trying fallback style combinations for full profile:", styleCombinations)

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

  const getPurchaseTitle = () => {
    if (purchaseType === "betty") {
      return "The Influence Engine™"
    }
    return `${user?.primaryInfluenceStyle}${user?.secondaryInfluenceStyle ? ` + ${user.secondaryInfluenceStyle}` : ''} Toolkit`
  }

  const getPurchaseDescription = () => {
    if (purchaseType === "betty") {
      return "Your AI-powered influence coaching system is now active!"
    }
    return `Your purchase is complete.`
  }

  const getPurchasedItems = () => {
    if (!user?.cart) return []
    
    const items = user.cart
    const purchasedItems: string[] = []
    
    items.forEach((item: string) => {
      switch (item) {
        case 'Book':
          purchasedItems.push('Influence First Book (PDF)')
          break
        case 'Toolkit':
          purchasedItems.push(`${user?.influenceStyle || 'Your'} Influence Toolkit (PDF)`)
          break
        case 'IE_Annual':
          purchasedItems.push('Influence Engine Annual Access (Shared Link)')
          break
        case 'Bundle':
          purchasedItems.push('Complete Bundle: Book + Toolkit + IE Annual Access')
          break
        default:
          purchasedItems.push(item)
      }
    })
    
    return purchasedItems
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
        <Card className={`mb-8 border-2 ${purchaseType === "betty" ? "border-[#92278F] bg-gradient-to-r from-[#92278F]/10 to-purple-50" : "border-green-200 bg-green-50"}`}>
          <CardContent className="text-center py-12">
            <div className={`w-20 h-20 ${purchaseType === "betty" ? "bg-[#92278F]" : "bg-green-500"} rounded-full flex items-center justify-center mx-auto mb-6`}>
              {purchaseType === "betty" ? <Crown className="w-10 h-10 text-white" /> : <CheckCircle className="w-10 h-10 text-white" />}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">🎉 Purchase Successful!</h1>
            <p className="text-xl text-gray-600 mb-6">
              Thank you {user.firstName}! {getPurchaseDescription()}
            </p>

            {purchaseType === "betty" && (
              <Badge className="bg-[#92278F] text-white text-lg px-4 py-2 mb-6">PREMIUM ACCESS</Badge>
            )}

                         {sessionId && (
               <div className="bg-white rounded-lg p-4 mb-6 border">
                 <p className="text-sm text-gray-600 mb-2">Transaction ID:</p>
                 <p className="font-mono text-sm bg-gray-100 p-2 rounded">{sessionId}</p>
                 <p className="text-sm text-gray-600 mt-2">Payment Date:</p>
                 <p className="text-sm font-medium">{new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
               </div>
             )}

             {/* Purchased Items Display */}
             {getPurchasedItems().length > 0 && (
               <div className="bg-white rounded-lg p-6 mb-8 border">
                 <h3 className="font-bold text-gray-900 mb-4 text-center">What You Purchased:</h3>
                 <div className="space-y-3">
                   {getPurchasedItems().map((item, index) => (
                     <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                       <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                       <span className="text-gray-700 font-medium">{item}</span>
                     </div>
                   ))}
                 </div>
               </div>
             )}            

            <Button
              onClick={() => router.push("/")}
              size="lg"
              className={`${purchaseType === "betty" ? "bg-[#92278F] hover:bg-[#7a1f78]" : "bg-green-600 hover:bg-green-700"} text-white px-8 py-4 text-lg font-semibold`}
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
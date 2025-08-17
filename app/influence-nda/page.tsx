"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, ArrowRight, FileText, Shield, CheckCircle, RotateCcw, Pen, Zap, Users, Navigation, Link, Anchor, Crown } from "lucide-react"
import { useRouter } from "next/navigation"
import { replacePricingTokens, PRICING_TOKENS } from "@/lib/utils/pricing"
// import { loadStripe } from "@stripe/stripe-js"
// import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js"

// Initialize Stripe - TEMPORARILY COMMENTED OUT
// const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

// Payment Form Component - TEMPORARILY COMMENTED OUT
/*
function PaymentForm({ user, purchaseType, onSuccess, agreed, signatureData, onSignNDA }: { 
  user: any, 
  purchaseType: string, 
  onSuccess: (sessionId: string) => void,
  agreed: boolean,
  signatureData: string,
  onSignNDA: () => Promise<void>
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [purchasing, setPurchasing] = useState(false)
  const [cardholderName, setCardholderName] = useState(`${user.firstName} ${user.lastName}`)
  const [billingAddress, setBillingAddress] = useState("")
  const [billingCity, setBillingCity] = useState("")
  const [billingState, setBillingState] = useState("")
  const [billingZip, setBillingZip] = useState("")

  const handlePayment = async () => {
    if (!stripe || !elements) return

    // Check if NDA is signed
    if (!agreed || !signatureData) {
      alert("Please read and agree to the terms, then provide your signature before proceeding with payment.")
      return
    }

    setPurchasing(true)

    try {
      // First, sign the NDA
      await onSignNDA()

      const cardElement = elements.getElement(CardElement)
      if (!cardElement) {
        throw new Error("Card element not found")
      }

      // Create payment method
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: cardholderName,
          email: user.email,
          address: {
            line1: billingAddress,
            city: billingCity,
            state: billingState,
            postal_code: billingZip,
            country: 'US',
          },
        },
      })

      if (paymentMethodError) {
        throw new Error(paymentMethodError.message)
      }

      // Process payment
      const amount = purchaseType === "betty" ? PRICING_TOKENS.IE_Annual * 100 : PRICING_TOKENS.Book * 100 // Amount in cents
      
      const response = await fetch("/api/process-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userEmail: user.email,
          userName: `${user.firstName} ${user.lastName}`,
          influenceStyle: user.primaryInfluenceStyle,
          secondaryStyle: user.secondaryInfluenceStyle,
          purchaseType,
          paymentMethodId: paymentMethod.id,
          amount,
          userId: user.id,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Payment failed")
      }

      const result = await response.json()
      onSuccess(result.paymentIntentId)
    } catch (error) {
      console.error("Payment error:", error)
      alert(`Payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setPurchasing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="cardholder-name">Cardholder Name</Label>
        <Input
          id="cardholder-name"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          placeholder="Name on card"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="card-element">Card Information</Label>
        <div className="mt-1 p-3 border border-gray-300 rounded-md bg-white">
          <CardElement
            id="card-element"
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="billing-address">Billing Address</Label>
        <Input
          id="billing-address"
          value={billingAddress}
          onChange={(e) => setBillingAddress(e.target.value)}
          placeholder="123 Main St"
          className="mt-1"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="billing-city">City</Label>
          <Input
            id="billing-city"
            value={billingCity}
            onChange={(e) => setBillingCity(e.target.value)}
            placeholder="City"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="billing-state">State</Label>
          <Input
            id="billing-state"
            value={billingState}
            onChange={(e) => setBillingState(e.target.value)}
            placeholder="State"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="billing-zip">ZIP</Label>
          <Input
            id="billing-zip"
            value={billingZip}
            onChange={(e) => setBillingZip(e.target.value)}
            placeholder="12345"
            className="mt-1"
          />
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Lock className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-900">Secure Payment</span>
        </div>
        <p className="text-sm text-blue-700">
          Your payment information is encrypted and secure. We use industry-standard SSL encryption to protect your data.
        </p>
      </div>

             <Button
         onClick={handlePayment}
         disabled={purchasing || !cardholderName || !billingAddress || !billingCity || !billingState || !billingZip || !agreed || !signatureData}
         size="lg"
         className={`${purchaseType === "betty" ? "bg-[#92278F] hover:bg-[#7a1f78]" : "bg-green-600 hover:bg-green-700"} text-white px-8 py-4 text-lg font-semibold w-full disabled:bg-gray-400 disabled:cursor-not-allowed`}
       >
         {purchasing ? (
           <div className="flex items-center space-x-2">
             <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
             <span>Processing Payment...</span>
           </div>
         ) : (
           <div className="flex items-center space-x-2">
             <CreditCard className="w-5 h-5" />
             <span>Complete Purchase - {purchaseType === "betty" ? replacePricingTokens("[PRICE:IE_Annual]") : replacePricingTokens("[PRICE:Book]")}</span>
           </div>
         )}
       </Button>

       {(!agreed || !signatureData) && (
         <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
           <p className="text-sm text-yellow-800">
             {!agreed && !signatureData && "Please read and agree to the terms, then provide your signature above"}
             {agreed && !signatureData && "Please provide your digital signature above"}
             {!agreed && signatureData && "Please check the agreement checkbox above"}
           </p>
         </div>
       )}
    </div>
  )
}
*/

export default function InfluenceNDAPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [agreed, setAgreed] = useState(false)
  const [signing, setSigning] = useState(false)
  const [signed, setSigned] = useState(false)
  const [signatureData, setSignatureData] = useState<string>("")
  const [isDrawing, setIsDrawing] = useState(false)
  // const [purchaseType, setPurchaseType] = useState<"toolkit" | "betty">("toolkit")
  // const [showPaymentForm, setShowPaymentForm] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const router = useRouter()

  useEffect(() => {
    // Get existing user data from localStorage (from quiz results)
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

    // Check if already signed
    if (currentUser.ndaSigned) {
      setSigned(true)
      if (currentUser.signatureData) {
        setSignatureData(currentUser.signatureData)
      }
    }

    setUser(currentUser)
    setLoading(false)
  }, [router])

  // Signature pad functions
// Add this function to get accurate coordinates
const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
  const canvas = canvasRef.current
  if (!canvas) return { x: 0, y: 0 }

  const rect = canvas.getBoundingClientRect()
  const scaleX = canvas.width / rect.width
  const scaleY = canvas.height / rect.height

  let clientX, clientY
  if ("touches" in e) {
    clientX = e.touches[0].clientX
    clientY = e.touches[0].clientY
  } else {
    clientX = e.clientX
    clientY = e.clientY
  }

  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY
  }
}

const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
  setIsDrawing(true)
  const canvas = canvasRef.current
  if (!canvas) return

  const ctx = canvas.getContext("2d")
  if (!ctx) return

  ctx.strokeStyle = "#000000"
  ctx.lineWidth = 1
  ctx.lineCap = "round"
  ctx.lineJoin = "round"

  const { x, y } = getCanvasCoordinates(e)
  ctx.beginPath()
  ctx.moveTo(x, y)
}

const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
  if (!isDrawing) return

  const canvas = canvasRef.current
  if (!canvas) return

  const ctx = canvas.getContext("2d")
  if (!ctx) return

  if ("touches" in e) {
    e.preventDefault() // Prevent scrolling on touch
  }

  const { x, y } = getCanvasCoordinates(e)
  ctx.lineTo(x, y)
  ctx.stroke()
}

  const stopDrawing = () => {
    if (!isDrawing) return
    setIsDrawing(false)

    const canvas = canvasRef.current
    if (!canvas) return

    // Save signature data
    const dataURL = canvas.toDataURL("image/png")
    setSignatureData(dataURL)
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setSignatureData("")
  }

    const handleSignNDA = async () => {
    if (!agreed || !signatureData) return

    setSigning(true)

    try {
      // Update existing user with NDA signature
      const updatedUserRecord = {
        ...user,
        ndaSigned: true,
        signatureData: signatureData,
      }

      console.log("Updating existing user with NDA signature:", updatedUserRecord)

      const response = await fetch("/api/update-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedUserRecord),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Update user error:", errorData)
        throw new Error(`Failed to update user: ${errorData.error || 'Unknown error'}`)
      }

      console.log("User updated successfully with NDA signature")

      // Update localStorage with updated user record
      localStorage.setItem("current_influence_user", JSON.stringify(updatedUserRecord))



      setUser(updatedUserRecord)
      setSigned(true)
      
      // Redirect to NDA success page instead of payment
      router.push("/nda-success")
    } catch (error) {
      console.error("Error signing NDA:", error)
      alert("Failed to sign NDA. Please try again.")
    } finally {
      setSigning(false)
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

  // const handlePaymentSuccess = (sessionId: string) => {
  //   router.push(`/purchase-success?type=${purchaseType}&session_id=${sessionId}`)
  // }

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
                <p className="text-sm text-gray-600">Use & Confidentiality Agreement</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => router.push("/influence-profile")}
                className="text-gray-600 hover:text-[#92278F]"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Profile
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#92278F] rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Use & Confidentiality Agreement</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
             Hi {user.firstName}! Before accessing The Influence Engine™, please
             review and sign this Use & Confidentiality Agreement to protect our proprietary AI-powered system.
           </p>
        </div>

        {/* Agreement Content */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>The Influence Engine™ – Use & Confidentiality Agreement</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <div className="bg-gray-50 p-6 rounded-lg text-sm text-gray-700 max-h-96 overflow-y-auto">
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">✅ THE INFLUENCE ENGINE™</h3>
                <h4 className="text-md font-semibold text-gray-800">NON-DISCLOSURE & USE AGREEMENT</h4>
              </div>
              
              <p className="mb-4 text-gray-700">
                This agreement ("Agreement") is entered into between the undersigned ("User") and Jen Greene ("Owner"), 
                creator of The Influence Engine™, as a condition of accessing and using the system and its outputs.
              </p>

              <h4 className="font-semibold text-gray-900 mb-2 mt-6">1. Purpose</h4>
              <p className="mb-4">
                User understands that The Influence Engine™ is a proprietary coaching tool, powered by original logic, 
                phrasing, strategic frameworks, and influence-adaptive responses created by Jen Greene. This Agreement 
                is intended to protect that intellectual property and prevent misuse or duplication.
              </p>

              <h4 className="font-semibold text-gray-900 mb-2">2. Confidentiality & Use Restrictions</h4>
              <p className="mb-2">User agrees to:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Use the tool and its outputs only for personal or licensed use</li>
                <li>Not share, forward, publish, or post any scripts, responses, or phrasing outside of their own private use</li>
                <li>Not train, copy, reverse-engineer, or replicate the logic, tone, structure, or system behavior</li>
                <li>Not attempt to extract internal prompts, coaching structures, frameworks, or instructions from the tool</li>
              </ul>

              <h4 className="font-semibold text-gray-900 mb-2">3. Output Ownership</h4>
              <p className="mb-2">
                All phrasing, coaching language, response structure, and strategic logic generated by The Influence Engine™ 
                are protected content and remain the intellectual property of Jen Greene. User may use these outputs for 
                their own conversations, but may not:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Sell them</li>
                <li>Package or brand them as their own</li>
                <li>Use them to build another AI, course, tool, or system</li>
              </ul>

              <h4 className="font-semibold text-gray-900 mb-2">4. No Redistribution or Recording</h4>
              <p className="mb-2">User agrees not to:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Record or screen capture tool output for distribution</li>
                <li>Share access or login details with others</li>
                <li>Upload the experience to YouTube, social media, or any public platform without explicit permission</li>
              </ul>

              <h4 className="font-semibold text-gray-900 mb-2">5. Consequences of Violation</h4>
              <p className="mb-2">If this agreement is violated, the Owner reserves the right to:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Revoke all access to The Influence Engine™</li>
                <li>Refuse any future licensing or training</li>
                <li>Pursue legal action for damages or injunctive relief</li>
              </ul>

              <h4 className="font-semibold text-gray-900 mb-2">6. Duration</h4>
              <p className="mb-4">
                This Use & Confidentiality Agreement remains in effect indefinitely — even if the User stops using The Influence Engine™.
              </p>

              <h4 className="font-semibold text-gray-900 mb-2">7. Agreement</h4>
              <p className="mb-4">
                By accessing The Influence Engine™, the User agrees to these terms and acknowledges that violation may 
                result in access loss or legal consequences.
              </p>

              <p className="text-xs text-gray-500 mt-6">Last updated: {new Date().toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>



        {/* Agreement Section */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3 mb-6">
              <Checkbox
                id="agreement-checkbox"
                checked={agreed}
                onCheckedChange={(checked) => setAgreed(checked as boolean)}
                className="mt-1"
              />
              <label htmlFor="agreement-checkbox" className="text-gray-700 leading-relaxed cursor-pointer">
                I, {user.firstName} {user.lastName}, have read, understood, and agree to be bound by the terms of The
                Influence Engine™ Use & Confidentiality Agreement. I understand that I am gaining access to proprietary
                AI-powered methodologies and agree to keep all confidential information strictly confidential and use
                the system only for my personal development.
              </label>
            </div>

            {/* Digital Signature Section */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center space-x-2 mb-4">
                <Pen className="w-5 h-5 text-[#92278F]" />
                <h3 className="text-lg font-semibold text-gray-900">Digital Signature Required</h3>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Please provide your digital signature below to complete the agreement. You can sign using your mouse or
                finger on touch devices.
              </p>

              {/* Signature Canvas */}
              <div className="relative border-2 border-gray-300 rounded-lg bg-white mb-4">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={200}
                  className="w-full h-48 cursor-crosshair touch-none"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
                {!signatureData && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <p className="text-gray-400 text-lg">Sign here</p>
                  </div>
                )}
              </div>

              {/* Signature Controls */}
              <div className="flex justify-between items-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={clearSignature}
                  className="flex items-center space-x-2 bg-transparent"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Clear Signature</span>
                </Button>

                {signatureData && (
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Signature captured</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>



         {/* NDA Completion Section - Temporarily replacing payment */}
         <div className="mt-8 space-y-8">
           <Card className="border-2 border-[#92278F]/20 bg-gradient-to-r from-[#92278F]/5 to-purple-50">
             <CardContent className="p-8 text-center">
               <div className="w-16 h-16 bg-[#92278F] rounded-full flex items-center justify-center mx-auto mb-6">
                 <CheckCircle className="w-8 h-8 text-white" />
               </div>
               <h2 className="text-2xl font-bold text-gray-900 mb-4">Complete Your Use & Confidentiality Agreement</h2>
                <p className="text-gray-600 mb-6">
                  Once you've read and agreed to the terms above, click the button below to confirm your agreement and receive access to The Influence Engine™ via email campaign.
                </p>
               
                <div className="bg-white rounded-lg p-6 border mb-6">
                  <h3 className="font-bold text-gray-900 mb-4">What You'll Receive:</h3>
                  <div className="text-left space-y-3">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-[#92278F]" />
                      <span className="text-gray-700">Direct access link to The Influence Engine™</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-[#92278F]" />
                      <span className="text-gray-700">AI-powered influence coaching system</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-[#92278F]" />
                      <span className="text-gray-700">Personalized conversation guidance</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-[#92278F]" />
                      <span className="text-gray-700">Access to private Slack community</span>
                    </div>
                  </div>
                </div>

               <Button
                 onClick={handleSignNDA}
                 disabled={signing || !agreed || !signatureData}
                 size="lg"
                 className="bg-[#92278F] hover:bg-[#7a1f78] text-white px-8 py-4 text-lg font-semibold w-full disabled:bg-gray-400 disabled:cursor-not-allowed"
               >
                 {signing ? (
                   <div className="flex items-center space-x-2">
                     <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                     <span>Completing Use & Confidentiality Agreement...</span>
                   </div>
                 ) : (
                   <div className="flex items-center space-x-2">
                     <CheckCircle className="w-5 h-5" />
                     <span>Complete Agreement & Get Access</span>
                   </div>
                 )}
               </Button>

               {(!agreed || !signatureData) && (
                 <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                   <p className="text-sm text-yellow-800">
                     {!agreed && !signatureData && "Please read and agree to the terms, then provide your signature above"}
                     {agreed && !signatureData && "Please provide your digital signature above"}
                     {!agreed && signatureData && "Please check the agreement checkbox above"}
                   </p>
                 </div>
               )}
             </CardContent>
           </Card>
         </div>

         {/* TEMPORARILY COMMENTED OUT - Payment Section
         <div className="mt-8 space-y-8">
           <Card className="border-2 border-[#92278F]/20 bg-gradient-to-r from-[#92278F]/5 to-purple-50">
             <CardContent className="p-6">
               <div className="mb-6">
                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Your Purchase Option</h3>
                 <RadioGroup value={purchaseType} onValueChange={(value) => setPurchaseType(value as "toolkit" | "betty")}>
                   <div className="space-y-4">
                     <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                       <RadioGroupItem value="toolkit" id="toolkit" />
                       <div className="flex-1">
                         <Label htmlFor="toolkit" className="text-base font-medium cursor-pointer">
                           <div className="flex items-center space-x-3">
                             <div className="flex items-center space-x-2">
                               <div className={`w-8 h-8 ${getStyleColor(user.primaryInfluenceStyle)} rounded-full flex items-center justify-center text-white`}>
                                 {getStyleIcon(user.primaryInfluenceStyle)}
                               </div>
                               <div className="text-2xl font-bold text-[#92278F]">+</div>
                               {user.secondaryInfluenceStyle && (
                                 <div className={`w-8 h-8 ${getStyleColor(user.secondaryInfluenceStyle)} rounded-full flex items-center justify-center text-white`}>
                                   {getStyleIcon(user.secondaryInfluenceStyle)}
                                 </div>
                               )}
                             </div>
                             <div>
                               <div className="font-semibold">
                                 {user.primaryInfluenceStyle}
                                 {user.secondaryInfluenceStyle && ` + ${user.secondaryInfluenceStyle}`} Toolkit
                               </div>
                               <div className="text-sm text-gray-600">{replacePricingTokens("[PRICE:Book]")} • One-time purchase</div>
                             </div>
                           </div>
                         </Label>
                       </div>
                     </div>
                     
                     <div className="flex items-center space-x-3 p-4 border border-[#92278F] rounded-lg bg-gradient-to-r from-[#92278F]/5 to-purple-50">
                       <RadioGroupItem value="betty" id="betty" />
                       <div className="flex-1">
                         <Label htmlFor="betty" className="text-base font-medium cursor-pointer">
                           <div className="flex items-center space-x-3">
                             <div className="w-8 h-8 bg-[#92278F] rounded-full flex items-center justify-center text-white">
                               <Crown className="w-4 h-4" />
                             </div>
                             <div>
                               <div className="font-semibold flex items-center space-x-2">
                                 <span>The Influence Engine™</span>
                                 <Badge className="bg-[#92278F] text-white text-xs">PREMIUM</Badge>
                               </div>
                               <div className="text-sm text-gray-600">{replacePricingTokens("[PRICE:IE_Annual]")} • One-time purchase</div>
                             </div>
                           </div>
                         </Label>
                       </div>
                     </div>
                   </div>
                 </RadioGroup>
               </div>

               <div className="bg-gray-50 p-4 rounded-lg">
                 <h4 className="font-semibold text-gray-900 mb-2">What's Included:</h4>
                 {purchaseType === "toolkit" ? (
                   <div className="space-y-2 text-sm">
                     <div className="flex items-center space-x-2">
                       <CheckCircle className="w-4 h-4 text-green-500" />
                       <span>Complete {user.primaryInfluenceStyle} influence framework</span>
                     </div>
                     <div className="flex items-center space-x-2">
                       <CheckCircle className="w-4 h-4 text-green-500" />
                       <span>Advanced communication strategies</span>
                     </div>
                     <div className="flex items-center space-x-2">
                       <CheckCircle className="w-4 h-4 text-green-500" />
                       <span>Digital resource library</span>
                     </div>
                   </div>
                 ) : (
                   <div className="space-y-2 text-sm">
                     <div className="flex items-center space-x-2">
                       <CheckCircle className="w-4 h-4 text-[#92278F]" />
                       <span>Everything in Toolkit + AI-powered coaching</span>
                     </div>
                     <div className="flex items-center space-x-2">
                       <CheckCircle className="w-4 h-4 text-[#92278F]" />
                       <span>Personalized conversation scripts</span>
                     </div>
                     <div className="flex items-center space-x-2">
                       <CheckCircle className="w-4 h-4 text-[#92278F]" />
                       <span>Notion resource hub + Slack community</span>
                     </div>
                   </div>
                 )}
               </div>
             </CardContent>
           </Card>

           <Card className="border-2 border-[#92278F]/20 bg-gradient-to-r from-[#92278F]/5 to-purple-50">
             <CardContent className="p-8">
               <div className="text-center mb-8">
                 <div className={`w-16 h-16 ${purchaseType === "betty" ? "bg-[#92278F]" : "bg-green-500"} rounded-full flex items-center justify-center mx-auto mb-4`}>
                   {purchaseType === "betty" ? <Crown className="w-8 h-8 text-white" /> : <CreditCard className="w-8 h-8 text-white" />}
                 </div>
                 <h2 className="text-2xl font-bold text-gray-900 mb-2">
                   {purchaseType === "betty" ? "The Influence Engine™" : `${user.primaryInfluenceStyle}${user.secondaryInfluenceStyle ? ` + ${user.secondaryInfluenceStyle}` : ''} Toolkit`}
                 </h2>
                 <div className={`text-3xl font-bold ${purchaseType === "betty" ? "text-[#92278F]" : "text-green-600"} mb-2`}>
                   {purchaseType === "betty" ? replacePricingTokens("[PRICE:IE_Annual]") : replacePricingTokens("[PRICE:Book]")}
                 </div>
                 <p className="text-gray-600">One-time purchase • Secure payment</p>
               </div>

               <Elements stripe={stripePromise}>
                 <PaymentForm 
                   user={user} 
                   purchaseType={purchaseType} 
                   onSuccess={handlePaymentSuccess}
                   agreed={agreed}
                   signatureData={signatureData}
                   onSignNDA={handleSignNDA}
                 />
               </Elements>
             </CardContent>
           </Card>
         </div>
         */}

      </div>
    </div>
  )
}

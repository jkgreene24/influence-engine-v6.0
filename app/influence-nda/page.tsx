"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, ArrowRight, FileText, Shield, CheckCircle, RotateCcw, Pen, CreditCard, Zap, Users, Navigation, Link, Anchor, Crown, Lock } from "lucide-react"
import { useRouter } from "next/navigation"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js"

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

// Payment Form Component
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
      const amount = purchaseType === "betty" ? 49900 : 1900 // Amount in cents
      
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
             <span>Complete Purchase - ${purchaseType === "betty" ? "499.00" : "19.00"}</span>
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

export default function InfluenceNDAPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [agreed, setAgreed] = useState(false)
  const [signing, setSigning] = useState(false)
  const [signed, setSigned] = useState(false)
  const [signatureData, setSignatureData] = useState<string>("")
  const [isDrawing, setIsDrawing] = useState(false)
  const [purchaseType, setPurchaseType] = useState<"toolkit" | "betty">("toolkit")
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const router = useRouter()

  useEffect(() => {
    // For demo purposes, create a mock user if none exists
    let currentUser = JSON.parse(localStorage.getItem("current_influence_user") || "null")

    if (!currentUser) {
      currentUser = {
        id: Date.now().toString(),
        firstName: "Demo",
        lastName: "User",
        email: "demo@example.com",
        primaryInfluenceStyle: "Catalyst",
        secondaryInfluenceStyle: "Connector",
        quizCompleted: true,
        demoWatched: true,
        ndaSigned: false,
      }
      localStorage.setItem("current_influence_user", JSON.stringify(currentUser))
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
      // Update user data
      const updatedUser = {
        ...user,
        ndaSigned: true,
        signatureData: signatureData,
      }

      console.log("Updating user with NDA signature:", updatedUser)

      const response = await fetch("/api/update-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedUser),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Update user error:", errorData)
        throw new Error(`Failed to update user: ${errorData.error || 'Unknown error'}`)
      }

      const result = await response.json()
      console.log("User updated successfully:", result)

      // Update localStorage
      localStorage.setItem("current_influence_user", JSON.stringify(updatedUser))

      // Update users array
      const users = JSON.parse(localStorage.getItem("influence_users") || "[]")
      const userIndex = users.findIndex((u: any) => u.id === user.id)
      if (userIndex !== -1) {
        users[userIndex] = updatedUser
        localStorage.setItem("influence_users", JSON.stringify(users))
      }

      setUser(updatedUser)
      setSigned(true)
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

  const handlePaymentSuccess = (sessionId: string) => {
    router.push(`/purchase-success?type=${purchaseType}&session_id=${sessionId}`)
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
            Hi {user.firstName}! Before accessing your complete {user.primaryInfluenceStyle + (user.secondaryInfluenceStyle ? ` + ${user.secondaryInfluenceStyle}` : '')} influence toolkit, please
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
              <p className="mb-4 font-medium text-gray-900">
                Thank you for purchasing The Influence Engine™ — a proprietary AI-powered tool designed to elevate how
                you communicate, lead, negotiate, and build trust. This system is built on years of strategy, coaching
                experience, and intellectual property. To protect its integrity — and your experience — the following
                terms apply:
              </p>

              <h4 className="font-semibold text-gray-900 mb-2 mt-6">Private Use Only</h4>
              <p className="mb-4">
                Access is for your personal use only. Please do not share your login credentials, access link, or screen
                content with others. Group coaching, shared sessions, or screen-sharing is not permitted without written
                permission.
              </p>

              <h4 className="font-semibold text-gray-900 mb-2">No Screenshots, Recordings, or Transcripts</h4>
              <p className="mb-4">
                You may not post or share screenshots, video recordings, transcripts, or audio of The Influence
                Engine™'s responses, logic, or interface. This ensures the system cannot be misused, copied, or taken
                out of context.
              </p>

              <h4 className="font-semibold text-gray-900 mb-2">Talk About It — Just Don't Leak It</h4>
              <p className="mb-2">
                We encourage you to share your experience and results — feel free to post reactions, takeaways, or how
                the tool has helped you. But do not share:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Your access link or login credentials</li>
                <li>Full conversations, transcripts, or screenshots</li>
                <li>The system's backend logic or structure</li>
              </ul>
              <p className="mb-4 font-medium">Keep the experience public. Keep the engine protected.</p>

              <h4 className="font-semibold text-gray-900 mb-2">No Reverse Engineering</h4>
              <p className="mb-4">
                You agree not to replicate, reverse-engineer, extract, or mimic the tool's structure, phrasing, logic,
                or decision-making flow in any way.
              </p>

              <h4 className="font-semibold text-gray-900 mb-2">You're Accessing Proprietary IP</h4>
              <p className="mb-4">
                Your purchase grants a 1-year license to use The Influence Engine™. All toolkits, logic, and frameworks
                remain the intellectual property of the creator. Access does not imply ownership or permission to reuse
                elements elsewhere.
              </p>

              <h4 className="font-semibold text-gray-900 mb-2">Respect for Proprietary Use</h4>
              <p className="mb-4">
                You're welcome to be inspired by your experience with The Influence Engine™, but we ask that you refrain
                from directly copying or recreating its unique language, frameworks, or interaction style in other AI or
                coaching tools. We simply ask that you respect the time, originality, and intellectual effort behind
                this product.
              </p>

              <h4 className="font-semibold text-gray-900 mb-2">Access Duration & Future Terms</h4>
              <p className="mb-4">
                Your license is valid for 1 year from your purchase date. After one year, access may be renewed based on
                the terms and pricing available at that time. You will be notified of any changes in advance.
              </p>

              <h4 className="font-semibold text-gray-900 mb-2">Refund Policy</h4>
              <p className="mb-2">
                You may request a full refund within 14 days of purchase, but only if you've actively used the tool —
                including:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Completing the Influence Style Quiz</li>
                <li>Applying the Engine in at least one real conversation</li>
              </ul>
              <p className="mb-4">No refunds will be issued for non-use, curiosity access, or "just looking around."</p>

              <h4 className="font-semibold text-gray-900 mb-2">User Conduct</h4>
              <p className="mb-4">
                You agree not to use the Engine to manipulate, impersonate, or harm others — and not to apply the
                content in unethical, harassing, or illegal ways. This tool is built to support ethical influence,
                leadership, and communication.
              </p>

              <h4 className="font-semibold text-gray-900 mb-2">System Monitoring & Data Use</h4>
              <p className="mb-4">
                We may track general usage patterns to improve performance, identify bugs, and protect system health. No
                personal conversations are reviewed unless submitted for support.
              </p>

              <h4 className="font-semibold text-gray-900 mb-2">Support & Technical Issues</h4>
              <p className="mb-4">
                If you encounter technical problems, please reach out to [support@email.com]. Access time will not be
                paused or extended except in the case of verified, prolonged downtime caused by us.
              </p>

              <h4 className="font-semibold text-gray-900 mb-2">Community Access & Guidelines (Slack + Notion)</h4>
              <p className="mb-2">
                Your license may include access to our private Notion resource hub and Slack community. These spaces are
                designed to support your growth, answer questions, and connect with others. To maintain a respectful
                environment:
              </p>
              <p className="mb-2 font-medium text-green-700">✅ Allowed:</p>
              <ul className="list-disc pl-6 mb-2">
                <li>Asking questions, sharing wins, giving feedback</li>
                <li>Participating in group threads and resource discussions</li>
                <li>Using materials for your own influence journey</li>
              </ul>
              <p className="mb-2 font-medium text-red-700">🚫 Not Allowed:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Sharing login info or reposting content outside the group</li>
                <li>Pitching or DMing members without consent</li>
                <li>Posting aggressive, rude, or off-topic content</li>
                <li>Using the space to criticize or undermine the tool, creator, or other users</li>
              </ul>
              <p className="mb-4">Violation may result in removal from the community without refund.</p>

              <h4 className="font-semibold text-gray-900 mb-2">Non-Transferable Access</h4>
              <p className="mb-4">
                Your access cannot be transferred, loaned, or resold. Each user must purchase their own access to The
                Influence Engine™.
              </p>

              <h4 className="font-semibold text-gray-900 mb-2">Disclaimer</h4>
              <p className="mb-4">
                The Influence Engine™ offers strategic guidance for communication, negotiation, and leadership. It is
                not a substitute for legal, medical, or financial advice. You are responsible for how you apply its
                recommendations.
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



         {/* Purchase Selection and Payment Form - Always shown at bottom */}
         <div className="mt-8 space-y-8">
           {/* Purchase Selection */}
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
                               <div className="text-sm text-gray-600">$19.00 • One-time purchase</div>
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
                                 <span>Betty - The Influence Engine™</span>
                                 <Badge className="bg-[#92278F] text-white text-xs">PREMIUM</Badge>
                               </div>
                               <div className="text-sm text-gray-600">$499.00 • One-time purchase</div>
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

           {/* Payment Form - Always shown */}
           <Card className="border-2 border-[#92278F]/20 bg-gradient-to-r from-[#92278F]/5 to-purple-50">
             <CardContent className="p-8">
               <div className="text-center mb-8">
                 <div className={`w-16 h-16 ${purchaseType === "betty" ? "bg-[#92278F]" : "bg-green-500"} rounded-full flex items-center justify-center mx-auto mb-4`}>
                   {purchaseType === "betty" ? <Crown className="w-8 h-8 text-white" /> : <CreditCard className="w-8 h-8 text-white" />}
                 </div>
                 <h2 className="text-2xl font-bold text-gray-900 mb-2">
                   {purchaseType === "betty" ? "Betty - The Influence Engine™" : `${user.primaryInfluenceStyle}${user.secondaryInfluenceStyle ? ` + ${user.secondaryInfluenceStyle}` : ''} Toolkit`}
                 </h2>
                 <div className={`text-3xl font-bold ${purchaseType === "betty" ? "text-[#92278F]" : "text-green-600"} mb-2`}>
                   ${purchaseType === "betty" ? "499.00" : "19.00"}
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

      </div>
    </div>
  )
}

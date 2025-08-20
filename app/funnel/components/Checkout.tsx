"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CheckCircle, ArrowRight, Package, Crown, BookOpen, FileText, CreditCard } from "lucide-react"
import { type FunnelState } from "@/lib/utils/funnel-state"
import { getProduct, replacePricingTokens, PRODUCTS } from "@/lib/utils/pricing"
import { generateSourceTags } from "@/lib/utils/funnel-state"
import { automationHelpers } from "@/lib/utils/mock-automation"

interface CheckoutProps {
  funnelState: FunnelState
  updateFunnelState: (newState: Partial<FunnelState>) => void
  goToNextStep: () => void
}

export default function Checkout({ funnelState, updateFunnelState, goToNextStep }: CheckoutProps) {
  const [agreementChecked, setAgreementChecked] = useState(false)
  const [signature, setSignature] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Debug logging for each cart item
  console.log('Funnel State Cart:', funnelState.cart)
  console.log('Full Funnel State:', funnelState)
  console.log('LocalStorage funnel state:', localStorage.getItem('influence_funnel_state'))
  console.log('Available products:', Object.keys(PRODUCTS))
  console.log('Test getProduct("Book"):', getProduct('Book'))
  console.log('Test getProduct("Toolkit"):', getProduct('Toolkit'))
  console.log('Test getProduct("IE_Annual"):', getProduct('IE_Annual'))
  
  const total = funnelState.cart.reduce((sum, cartItem) => {
    console.log('Processing cart item:', cartItem)
    const product = getProduct(cartItem as any)
    console.log('Product found:', product)
    const price = product?.price || 0
    console.log('Price for', cartItem, ':', price)
    return sum + price
  }, 0)
  
  const hasIE = funnelState.cart.includes('IE_Annual') || funnelState.cart.includes('Bundle')
  console.log('Total:', total)
  console.log('Has IE:', hasIE)

  // Check if this was an auto-upgrade to bundle
  const wasAutoUpgraded = funnelState.wantsBundle && funnelState.cart.includes('Bundle')

  const handleCheckout = async () => {
    if (!agreementChecked) {
      setError("Please accept the Member Access Agreement")
      return
    }

    if (hasIE && !signature.trim()) {
      setError("Please provide your digital signature")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Generate source tags
      const sourceTags = generateSourceTags(funnelState.sourceTracking)
      
      // Prepare metadata for Stripe
      const metadata = {
        userEmail: funnelState.userData?.email || "",
        userName: `${funnelState.userData?.firstName || ""} ${funnelState.userData?.lastName || ""}`,
        influenceStyle: funnelState.influenceStyle || "",
        secondaryStyle: funnelState.secondaryStyle || "",
        sourceTags: sourceTags.join(","),
        srcBook: funnelState.sourceTracking.srcBook ? "true" : "false",
        reiaName: funnelState.sourceTracking.reiaName || "",
        socialPlatform: funnelState.sourceTracking.socialPlatform || "",
        referrerName: funnelState.sourceTracking.referrerName || "",
        wordOfMouth: funnelState.sourceTracking.wordOfMouth || "",
        otherSource: funnelState.sourceTracking.otherSource || "",
        utmSource: funnelState.sourceTracking.utmSource || "",
        utmMedium: funnelState.sourceTracking.utmMedium || "",
        utmCampaign: funnelState.sourceTracking.utmCampaign || "",
        cart: funnelState.cart.join(","),
        signature: signature.trim(),
      }

      // Create checkout session
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userEmail: funnelState.userData?.email,
          userName: `${funnelState.userData?.firstName} ${funnelState.userData?.lastName}`,
          influenceStyle: funnelState.influenceStyle,
          secondaryStyle: funnelState.secondaryStyle,
          cart: funnelState.cart,
          metadata,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create checkout session")
      }

      const { sessionUrl } = await response.json()
      
      // Tag purchase in automation
      try {
        if (funnelState.userData?.email) {
          await automationHelpers.tagPurchase(funnelState.userData.email, funnelState.cart, total)
        }
      } catch (error) {
        console.error('Failed to tag purchase:', error)
      }
      
      // Redirect to Stripe checkout
      window.location.href = sessionUrl
    } catch (err) {
      console.error("Checkout error:", err)
      setError("Failed to process checkout. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const getItemIcon = (productKey: string) => {
    switch (productKey) {
      case 'Book':
        return <BookOpen className="w-5 h-5" />
      case 'Toolkit':
        return <FileText className="w-5 h-5" />
      case 'IE_Annual':
        return <Crown className="w-5 h-5" />
      case 'Bundle':
        return <Package className="w-5 h-5" />
      default:
        return <Package className="w-5 h-5" />
    }
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

      {/* Checkout Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Complete Your Purchase
          </h1>
          <p className="text-xl text-gray-600">
            You're just one step away from unlocking your influence potential.
          </p>
        </div>

        {/* Auto-Upgrade Notification */}
        {wasAutoUpgraded && (
          <Card className="mb-6 border-2 border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-900">Smart Upgrade Applied!</h3>
                  <p className="text-sm text-green-700">
                    We've automatically upgraded you to our complete bundle to save you money. 
                    You're getting everything you need at our best price!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Cart Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5" />
                <span>Order Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                                                          {funnelState.cart.map((cartItem, index) => {
                 console.log('Displaying cart item:', cartItem, 'at index:', index)
                 const product = getProduct(cartItem as any)
                 console.log('Product for display:', product)
                                  
                 if (!product) {
                   console.warn(`Product not found for cart item: ${cartItem}`)
                   // Show a fallback item if product not found
                   return (
                     <div key={index} className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-red-50">
                       <div className="flex items-center space-x-3">
                         <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white">
                           <Package className="w-5 h-5" />
                         </div>
                         <div>
                           <h4 className="font-medium text-gray-900">Unknown Product: {cartItem}</h4>
                           <p className="text-sm text-red-600">Product configuration missing</p>
                         </div>
                       </div>
                       <div className="text-right">
                         <p className="font-semibold text-red-600">$0</p>
                       </div>
                     </div>
                   )
                 }
                 
                 // Special handling for Bundle - show individual items
                 if (cartItem === 'Bundle') {
                   return (
                     <div key={index} className="space-y-3">
                       {/* Bundle header */}
                       <div className="flex items-center justify-between p-3 border-2 border-[#92278F] rounded-lg bg-[#92278F]/5">
                         <div className="flex items-center space-x-3">
                           <div className="w-8 h-8 bg-[#92278F] rounded-full flex items-center justify-center text-white">
                             {getItemIcon(cartItem)}
                           </div>
                           <div>
                             <h4 className="font-medium text-gray-900">{product.name}</h4>
                             <p className="text-sm text-gray-600">{product.description}</p>
                           </div>
                         </div>
                         <div className="text-right">
                           <p className="font-semibold text-[#92278F]">
                             {replacePricingTokens(`[PRICE:${cartItem}]`)}
                           </p>
                         </div>
                       </div>
                       
                       {/* Bundle contents */}
                       <div className="ml-8 space-y-2">
                         <div className="flex items-center justify-between text-sm">
                           <span className="text-gray-600">• The Book</span>
                         </div>
                         <div className="flex items-center justify-between text-sm">
                           <span className="text-gray-600">• The Full Toolkit</span>
                         </div>
                         <div className="flex items-center justify-between text-sm">
                           <span className="text-gray-600">• The Influence Engine™ Annual</span>
                         </div>
                       </div>
                     </div>
                   )
                 }
                 
                 // Regular product display
                 return (
                   <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                     <div className="flex items-center space-x-3">
                       <div className="w-8 h-8 bg-[#92278F] rounded-full flex items-center justify-center text-white">
                         {getItemIcon(cartItem)}
                       </div>
                       <div>
                         <h4 className="font-medium text-gray-900">{product.name}</h4>
                         <p className="text-sm text-gray-600">{product.description}</p>
                       </div>
                     </div>
                     <div className="text-right">
                       <p className="font-semibold text-gray-900">
                         {replacePricingTokens(`[PRICE:${cartItem}]`)}
                       </p>
                     </div>
                   </div>
                 )
               })}
              
              {/* Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-[#92278F]">
                    ${total}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Member Access Agreement */}
          <Card>
            <CardHeader>
              <CardTitle>Member Access Agreement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ScrollArea className="h-64 w-full border border-gray-200 rounded-lg p-4">
                <div className="text-sm text-gray-700 space-y-4">
                  <h4 className="font-semibold text-gray-900">The Influence Engine™ Member Access Agreement</h4>
                  
                  <p><strong>1. Access and Use</strong></p>
                  <p>By purchasing access to The Influence Engine™, you agree to use the materials, tools, and resources provided solely for your personal and professional development. You may not share, distribute, or resell any content without explicit written permission.</p>
                  
                  <p><strong>2. Intellectual Property</strong></p>
                  <p>All content, materials, and intellectual property within The Influence Engine™ remain the exclusive property of The Influence Engine™ and its creators. You are granted a limited, non-exclusive license to use these materials for your personal development.</p>
                  
                  <p><strong>3. Professional Use</strong></p>
                  <p>You may use the techniques and strategies learned through The Influence Engine™ in your professional practice, but you may not teach, train, or coach others using our proprietary methods without proper licensing or certification.</p>
                  
                  <p><strong>4. Confidentiality</strong></p>
                  <p>You agree to maintain the confidentiality of proprietary information shared within The Influence Engine™ community and not to disclose specific techniques or strategies to non-members.</p>
                  
                  <p><strong>5. Results Disclaimer</strong></p>
                  <p>While The Influence Engine™ provides proven strategies and techniques, individual results may vary. We do not guarantee specific outcomes or financial results from the use of our materials.</p>
                  
                  <p><strong>6. Community Guidelines</strong></p>
                  <p>As a member, you agree to maintain professional and respectful behavior in all community interactions, including Slack channels and other communication platforms.</p>
                  
                  <p><strong>7. Termination</strong></p>
                  <p>Access to The Influence Engine™ may be terminated for violation of this agreement or community guidelines. No refunds will be provided for violations resulting in termination.</p>
                  
                  <p><strong>8. Updates and Changes</strong></p>
                  <p>This agreement may be updated from time to time. Continued use of The Influence Engine™ constitutes acceptance of any changes.</p>
                  
                  <p className="text-xs text-gray-500 mt-4">
                    By checking the box below and providing your digital signature, you acknowledge that you have read, understood, and agree to be bound by this Member Access Agreement.
                  </p>
                </div>
              </ScrollArea>

              {/* Agreement Checkbox */}
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="agreement"
                  checked={agreementChecked}
                  onCheckedChange={(checked) => setAgreementChecked(checked as boolean)}
                />
                <label htmlFor="agreement" className="text-sm text-gray-700 leading-relaxed">
                  I have read, understood, and agree to the Member Access Agreement above.
                </label>
              </div>

              {/* Digital Signature (required for IE) */}
              {hasIE && (
                <div className="space-y-2">
                  <label htmlFor="signature" className="block text-sm font-medium text-gray-700">
                    Digital Signature <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="signature"
                    value={signature}
                    onChange={(e) => setSignature(e.target.value)}
                    placeholder="Type your full name to sign"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#92278F] focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500">
                    By typing your name above, you are providing your digital signature and agreeing to the terms.
                  </p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Checkout Button */}
              <Button
                onClick={handleCheckout}
                disabled={loading || !agreementChecked || (hasIE && !signature.trim())}
                className="w-full bg-[#92278F] hover:bg-[#7a1f78] text-white py-3 text-lg font-semibold"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <CreditCard className="w-5 h-5" />
                    <span>Complete Purchase</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

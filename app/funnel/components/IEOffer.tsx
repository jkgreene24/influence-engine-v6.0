"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, ArrowRight, Zap, Users, MessageCircle, Target, Clock, Shield, Crown } from "lucide-react"
import { type FunnelState } from "@/lib/utils/funnel-state"
import { getProduct, replacePricingTokens } from "@/lib/utils/pricing"

interface IEOfferProps {
  funnelState: FunnelState
  updateFunnelState: (newState: Partial<FunnelState>) => void
  updateFunnelStateAndGoToNext: (newState: Partial<FunnelState>) => void
  goToNextStep: () => void
}

export default function IEOffer({ funnelState, updateFunnelState, updateFunnelStateAndGoToNext, goToNextStep }: IEOfferProps) {
  const ie = getProduct('IE_Annual')

  const handleYes = () => {
    const newCart = [...funnelState.cart, 'IE_Annual']
    console.log('IEOffer - Adding to cart:', {
      currentCart: funnelState.cart,
      newCart: newCart,
      currentState: funnelState
    })
    
    // Update state and go to next step in one operation
    updateFunnelStateAndGoToNext({
      wantsIE: true,
      declinedIE: false,
      cart: newCart
    })
  }

  const handleNo = () => {
    updateFunnelState({
      declinedIE: true,
      wantsIE: false
    })
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
          </div>
        </div>
      </header>

      {/* Offer Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {replacePricingTokens("The Influence Engine™ — Your Deal Coach in Your Pocket — Only [PRICE:IE_Annual]/year")}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {replacePricingTokens("Normally [PRICE:IE_Standard] — First-Adopter Rate. Keep it as long as you stay active.")}
          </p>
        </div>

        {/* Main Offer Card */}
        <Card className="mb-8 border-2 border-[#92278F] shadow-xl">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-[#92278F] rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
              The Influence Engine™ isn't just training
            </CardTitle>
            <p className="text-lg text-gray-600">
              It's live, on-demand coaching for your most important conversations.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* What You Get */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">You get:</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-[#92278F] mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Real-Time Prep</h4>
                    <p className="text-sm text-gray-600">The right words, phrasing, and tone for your style</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Users className="w-5 h-5 text-[#92278F] mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Live Roleplay Simulations</h4>
                    <p className="text-sm text-gray-600">Realistic practice with pushback and objections</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <MessageCircle className="w-5 h-5 text-[#92278F] mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Winning Phrase Banks</h4>
                    <p className="text-sm text-gray-600">Style-specific openers, bridges, and closers</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Target className="w-5 h-5 text-[#92278F] mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Deal Debriefs</h4>
                    <p className="text-sm text-gray-600">Pinpoint what worked and what to tweak</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Zap className="w-5 h-5 text-[#92278F] mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Slack Community</h4>
                    <p className="text-sm text-gray-600">Collaborate, share wins, and get peer input</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-[#92278F] mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Notion Resource Hub</h4>
                    <p className="text-sm text-gray-600">One home for all tools, training, and updates</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="bg-[#92278F]/5 p-6 rounded-lg border border-[#92278F]/20">
              <p className="text-lg text-gray-900 font-medium text-center mb-4">
                🎯 No scripts. No fluff. Just what works — for you.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={handleYes}
            className="bg-[#92278F] hover:bg-[#7a1f78] text-white px-8 py-4 text-lg font-semibold flex-1 sm:flex-none"
          >
            Yes — Add The Influence Engine™
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <Button
            onClick={handleNo}
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 text-lg font-semibold flex-1 sm:flex-none"
          >
            No Thanks — Show Me Another Option
          </Button>
        </div>

        {/* Price Display */}
        <div className="text-center mt-8">
          <div className="inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm border">
            <span className="text-sm text-gray-600">Annual membership:</span>
            <span className="text-2xl font-bold text-[#92278F]">
              {replacePricingTokens("[PRICE:IE_Annual]")}
            </span>
            <span className="text-sm text-gray-500 line-through">
              {replacePricingTokens("[PRICE:IE_Standard]")}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

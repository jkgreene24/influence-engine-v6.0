"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, ArrowRight, Package, Zap, Target, Shield, FileText, Users } from "lucide-react"
import { type FunnelState } from "@/lib/utils/funnel-state"
import { getProduct, replacePricingTokens } from "@/lib/utils/pricing"
import { automationHelpers } from "@/lib/utils/mock-automation"

interface ToolkitOfferProps {
  funnelState: FunnelState
  updateFunnelState: (newState: Partial<FunnelState>) => void
  goToNextStep: () => void
}

export default function ToolkitOffer({ funnelState, updateFunnelState, goToNextStep }: ToolkitOfferProps) {
  const toolkit = getProduct('Toolkit')

  const handleYes = async () => {
    updateFunnelState({
      wantsToolkit: true,
      declinedToolkit: false,
      cart: [...funnelState.cart, 'Toolkit']
    })
    
    // Tag product selection in automation
    try {
      if (funnelState.userData?.email) {
        await automationHelpers.tagProductSelection(funnelState.userData.email, 'Toolkit', 'want')
      }
    } catch (error) {
      console.error('Failed to tag product selection:', error)
    }
    
    goToNextStep()
  }

  const handleNo = async () => {
    updateFunnelState({
      declinedToolkit: true,
      wantsToolkit: false
    })
    
    // Tag product decline in automation
    try {
      if (funnelState.userData?.email) {
        await automationHelpers.tagProductSelection(funnelState.userData.email, 'Toolkit', 'decline')
      }
    } catch (error) {
      console.error('Failed to tag product decline:', error)
    }
    
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
            {replacePricingTokens("Unlock Your Complete Influence Style Toolkit — Only [PRICE:Toolkit]")}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Go beyond your snapshot. Get the exact words, moves, and strategies to win more deals faster.
          </p>
        </div>

        {/* Main Offer Card */}
        <Card className="mb-8 border-2 border-[#92278F] shadow-xl">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-[#92278F] rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
              Your snapshot gave you the "what." The Toolkit gives you the how.
            </CardTitle>
            <p className="text-lg text-gray-600">
              It's the complete, style-specific playbook to put your influence into action.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* What's Inside */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">What's inside:</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <FileText className="w-5 h-5 text-[#92278F] mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Winning Phrases</h4>
                    <p className="text-sm text-gray-600">Openers, bridges, and closers that work with your style</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Target className="w-5 h-5 text-[#92278F] mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Style Playbook</h4>
                    <p className="text-sm text-gray-600">The psychology of your influence strengths</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Zap className="w-5 h-5 text-[#92278F] mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Influence Boosters</h4>
                    <p className="text-sm text-gray-600">Micro-adjustments that instantly raise your impact</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Users className="w-5 h-5 text-[#92278F] mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Scenario Strategies</h4>
                    <p className="text-sm text-gray-600">How to approach common high-stakes situations</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-[#92278F] mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Mistake Shield</h4>
                    <p className="text-sm text-gray-600">Avoid the traps that derail conversations</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-[#92278F] mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Quick-Win Cards</h4>
                    <p className="text-sm text-gray-600">Pocket-sized reference for fast recall</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="bg-[#92278F]/5 p-6 rounded-lg border border-[#92278F]/20">
              <p className="text-lg text-gray-900 font-medium text-center mb-4">
                💡 Think of it as your deal-closing cheat code.
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
            Yes — Add My Toolkit
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <Button
            onClick={handleNo}
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 text-lg font-semibold flex-1 sm:flex-none"
          >
            No Thanks — I'll Stick with My Snapshot
          </Button>
        </div>

        {/* Price Display */}
        <div className="text-center mt-8">
          <div className="inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm border">
            <span className="text-sm text-gray-600">One-time payment:</span>
            <span className="text-2xl font-bold text-[#92278F]">
              {replacePricingTokens("[PRICE:Toolkit]")}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

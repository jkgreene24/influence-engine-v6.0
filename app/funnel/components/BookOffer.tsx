"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, ArrowRight, BookOpen, Target, Eye, Clock, Users, Zap } from "lucide-react"
import { type FunnelState } from "@/lib/utils/funnel-state"
import { getProduct, replacePricingTokens } from "@/lib/utils/pricing"
import { automationHelpers } from "@/lib/utils/mock-automation"

interface BookOfferProps {
  funnelState: FunnelState
  updateFunnelState: (newState: Partial<FunnelState>) => void
  updateFunnelStateAndGoToNext: (newState: Partial<FunnelState>) => void
  goToNextStep: () => void
}

export default function BookOffer({ funnelState, updateFunnelState, updateFunnelStateAndGoToNext, goToNextStep }: BookOfferProps) {
  const book = getProduct('Book')

  const handleYes = () => {
    const newCart = [...funnelState.cart, 'Book']
    console.log('BookOffer - Adding to cart:', {
      currentCart: funnelState.cart,
      newCart: newCart,
      currentState: funnelState
    })
    
    // Update state and go to next step in one operation
    updateFunnelStateAndGoToNext({
      wantsBook: true,
      declinedBook: false,
      cart: newCart
    })
  }

  const handleNo = () => {
    // Update state and go to next step in one operation
    updateFunnelStateAndGoToNext({
      declinedBook: true,
      wantsBook: false
    })
    
    // Tag product decline in automation
    try {
      if (funnelState.userData?.email) {
        automationHelpers.tagProductSelection(funnelState.userData.email, 'Book', 'decline')
      }
    } catch (error) {
      console.error('Failed to tag product decline:', error)
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

      {/* Offer Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {replacePricingTokens("Get the Book That Started It All — Only [PRICE:Book]")}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Influence First: Why Your Deals Are Dying (and How to Fix It)
          </p>
        </div>

        {/* Main Offer Card */}
        <Card className="mb-8 border-2 border-[#92278F] shadow-xl">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-[#92278F] rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
              This is the foundation of everything
            </CardTitle>
            <p className="text-lg text-gray-600">
              The book that shows you why influence beats strategy every time.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* What You'll Learn */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Inside you'll learn:</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <Target className="w-5 h-5 text-[#92278F] mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">The trust-killers that silently kill deals</h4>
                    <p className="text-sm text-gray-600">Identify and avoid the hidden deal-breakers</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Eye className="w-5 h-5 text-[#92278F] mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">How to spot the real reason people say "no"</h4>
                    <p className="text-sm text-gray-600">Read between the lines of objections</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-[#92278F] mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Quick-read tactics to lower defenses in minutes</h4>
                    <p className="text-sm text-gray-600">Fast-acting influence techniques</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Users className="w-5 h-5 text-[#92278F] mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">How to adapt your style in real time to save deals</h4>
                    <p className="text-sm text-gray-600">Dynamic influence adjustments</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 md:col-span-2">
                  <Zap className="w-5 h-5 text-[#92278F] mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">The method that turns hesitant prospects into easy yeses</h4>
                    <p className="text-sm text-gray-600">Proven framework for closing deals</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Great Deals First Notice */}
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">Already in Great Deals First™?</h4>
                  <p className="text-blue-700 text-sm">
                    The book is included. No need to buy it here.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={handleYes}
            className="bg-[#92278F] hover:bg-[#7a1f78] text-white px-8 py-4 text-lg font-semibold flex-1 sm:flex-none"
          >
            Yes — Add the Book
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <Button
            onClick={handleNo}
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 text-lg font-semibold flex-1 sm:flex-none"
          >
            No Thanks — I'll Skip for Now
          </Button>
        </div>

        {/* Price Display */}
        <div className="text-center mt-8">
          <div className="inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm border">
            <span className="text-sm text-gray-600">One-time payment:</span>
            <span className="text-2xl font-bold text-[#92278F]">
              {replacePricingTokens("[PRICE:Book]")}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

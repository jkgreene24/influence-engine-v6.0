"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, ArrowRight, Package, Zap, Target, Shield, FileText, Users, Crown, BookOpen } from "lucide-react"
import { type FunnelState } from "@/lib/utils/funnel-state"
import { getProduct, replacePricingTokens, PRICING_TOKENS } from "@/lib/utils/pricing"
import { automationHelpers } from "@/lib/utils/mock-automation"

interface BundleOfferProps {
  funnelState: FunnelState
  updateFunnelState: (newState: Partial<FunnelState>) => void
  updateFunnelStateAndGoToNext: (newState: Partial<FunnelState>) => void
  goToNextStep: () => void
}

export default function BundleOffer({ funnelState, updateFunnelState, updateFunnelStateAndGoToNext, goToNextStep }: BundleOfferProps) {
  const bundle = getProduct('Bundle')

  const handleYes = () => {
    // Replace cart with bundle items and apply bundle pricing
    updateFunnelStateAndGoToNext({
      wantsBundle: true,
      wantsToolkit: true,
      wantsBook: true,
      wantsIE: true,
      declinedToolkit: false,
      declinedBook: false,
      declinedIE: false,
      cart: ['Bundle'] // Use bundle product instead of individual items
    })
    
    // Tag bundle selection in automation
    try {
      if (funnelState.userData?.email) {
        automationHelpers.tagProductSelection(funnelState.userData.email, 'Bundle', 'want')
      }
    } catch (error) {
      console.error('Failed to tag bundle selection:', error)
    }
  }

  const handleNo = () => {
    // Keep current cart as is, just go to checkout
    updateFunnelStateAndGoToNext({})
    
    // Tag bundle decline in automation
    try {
      if (funnelState.userData?.email) {
        automationHelpers.tagProductSelection(funnelState.userData.email, 'Bundle', 'decline')
      }
    } catch (error) {
      console.error('Failed to tag bundle decline:', error)
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
             {replacePricingTokens("Bundle & Save — Get Everything You Need")}
           </h1>
           <p className="text-xl text-gray-600 max-w-3xl mx-auto">
             {funnelState.cart.length > 0 
               ? "Upgrade to our complete bundle and save money!"
               : "Complete your influence mastery with our best-value bundle."
             }
           </p>
        </div>

        {/* Main Offer Card */}
        <Card className="mb-8 border-2 border-[#92278F] shadow-xl">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-[#92278F] rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
              Get everything you need to master influence
            </CardTitle>
                         <p className="text-lg text-gray-600">
               {replacePricingTokens("Normally [PRICE:Bundle_Standard] — today only [PRICE:Bundle]. Save $50 instantly.")}
             </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Bundle Contents */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Complete Influence Mastery Bundle:</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {/* Book */}
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">The Book</h4>
                  <p className="text-sm text-gray-600">Influence First: Why Your Deals Are Dying</p>
                  <div className="mt-2">
                    <span className="text-xs text-gray-500 line-through">
                      {replacePricingTokens("[PRICE:Book]")}
                    </span>
                  </div>
                </div>

                {/* Toolkit */}
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">The Full Toolkit</h4>
                  <p className="text-sm text-gray-600">Complete style-specific playbook</p>
                  <div className="mt-2">
                    <span className="text-xs text-gray-500 line-through">
                      {replacePricingTokens("[PRICE:Toolkit]")}
                    </span>
                  </div>
                </div>

                {/* Influence Engine */}
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">The Influence Engine™</h4>
                  <p className="text-sm text-gray-600">Annual membership</p>
                  <div className="mt-2">
                    <span className="text-xs text-gray-500 line-through">
                      {replacePricingTokens("[PRICE:IE_Annual]")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

                         {/* Savings Highlight */}
             <div className="bg-green-50 p-6 rounded-lg border border-green-200">
               <div className="text-center">
                 <h4 className="font-medium text-green-900 mb-2">Bundle Savings</h4>
                 {funnelState.cart.length > 0 && (
                   <div className="mb-4 p-4 bg-white rounded-lg border border-green-200">
                     <p className="text-sm text-gray-600 mb-2">Your current selection:</p>
                     <div className="text-sm text-gray-700 space-y-1">
                       {funnelState.cart.map((item, index) => {
                         const product = getProduct(item as any)
                         return (
                           <div key={index} className="flex justify-between">
                             <span>• {product.name}</span>
                             <span className="font-medium">${product.price}</span>
                           </div>
                         )
                       })}
                     </div>
                     <div className="mt-2 pt-2 border-t border-green-200">
                       <div className="flex justify-between font-medium">
                         <span>Current Total:</span>
                         <span>${funnelState.cart.reduce((total, item) => {
                           const product = getProduct(item as any)
                           return total + product.price
                         }, 0)}</span>
                       </div>
                     </div>
                   </div>
                 )}
                 <div className="flex justify-center items-center space-x-4">
                   <div className="text-center">
                     <p className="text-sm text-gray-600">Regular Price</p>
                     <p className="text-lg font-semibold text-gray-500 line-through">
                       {replacePricingTokens("[PRICE:Bundle_Standard]")}
                     </p>
                   </div>
                   <div className="text-2xl text-green-600">→</div>
                   <div className="text-center">
                     <p className="text-sm text-gray-600">Bundle Price</p>
                     <p className="text-2xl font-bold text-[#92278F]">
                       {replacePricingTokens("[PRICE:Bundle]")}
                     </p>
                   </div>
                 </div>
                 <p className="text-green-700 font-medium mt-2">
                   {funnelState.cart.length > 0 
                     ? `Save $${funnelState.cart.reduce((total, item) => {
                         const product = getProduct(item as any)
                         return total + product.price
                       }, 0) - PRICING_TOKENS.Bundle} by upgrading to the bundle!`
                     : "Save $50 instantly!"
                   }
                 </p>
               </div>
             </div>

            {/* Call to Action */}
                         <div className="bg-[#92278F]/5 p-6 rounded-lg border border-[#92278F]/20">
               <p className="text-lg text-gray-900 font-medium text-center mb-4">
                 {funnelState.cart.length > 0 
                   ? "💰 Upgrade to the bundle and save money while getting everything you need!"
                   : "💰 Get the complete influence system at our best price. Perfect for serious professionals."
                 }
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
            Yes — Add the Bundle
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <Button
            onClick={handleNo}
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 text-lg font-semibold flex-1 sm:flex-none"
          >
            No — Continue to Checkout
          </Button>
        </div>

        {/* Price Display */}
        <div className="text-center mt-8">
          <div className="inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm border">
            <span className="text-sm text-gray-600">Bundle price:</span>
            <span className="text-2xl font-bold text-[#92278F]">
              {replacePricingTokens("[PRICE:Bundle]")}
            </span>
            <span className="text-sm text-gray-500 line-through">
              {replacePricingTokens("[PRICE:Bundle_Standard]")}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

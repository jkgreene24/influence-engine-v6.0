"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PostQuizFunnelState } from "@/lib/utils/post-quiz-funnel-state"
import { getInfluenceIcon } from "@/lib/utils/influence-icons"

interface CheckoutProps {
  funnelState: PostQuizFunnelState
  onUpdateState: (newState: Partial<PostQuizFunnelState>) => void
}

export default function Checkout({ funnelState, onUpdateState }: CheckoutProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const getSelectedProducts = () => {
    const products = []
    
    // Add individual products
    if (funnelState.products.toolkit.selected) {
      products.push({
        name: "Influence Style Toolkit",
        description: `${funnelState.influenceStyle.charAt(0).toUpperCase() + funnelState.influenceStyle.slice(1)} Style Toolkit`,
        price: 79,
        image: "toolkit",
        type: "toolkit"
      })
    }
    
    if (funnelState.products.engine.selected) {
      products.push({
        name: "The Influence Engine™",
        description: "AI-powered influence coaching platform",
        price: 499,
        image: "engine",
        type: "engine"
      })
    }
    
    if (funnelState.products.book.selected) {
      products.push({
        name: "Influence First Book",
        description: "Why Your Deals Are Dying (And How to Fix It)",
        price: 19,
        image: "book",
        type: "book"
      })
    }
    
    // Add bundle if selected (replaces individual items)
    if (funnelState.products.bundle.selected) {
      const bundleType = funnelState.products.engine.selected ? 'engine' : 'mastery'
      products.push({
        name: bundleType === 'engine' ? "Influence Engine™ Bundle" : "Influence Mastery Bundle",
        description: bundleType === 'engine' 
          ? "Complete package: Engine + Toolkit + Book" 
          : "Mastery package: Toolkit + Book",
        price: bundleType === 'engine' ? 547 : 347,
        image: "bundle",
        type: "bundle"
      })
    }
    
    return products
  }

  const getTotalPrice = () => {
    return funnelState.cart.reduce((sum, item) => sum + item.price, 0)
  }

  const getProductImage = (product: any) => {
    switch (product.type) {
      case 'toolkit':
        return (
          <div className="w-16 h-16 rounded-lg shadow-lg overflow-hidden">
            <img 
              src="/assets/funnel/toolkit-covers/Toolkit Cover Generic.png" 
              alt="Toolkit Cover"
              className="w-full h-full object-cover"
            />
          </div>
        )
      case 'engine':
        return (
          <div className="w-16 h-16 rounded-lg shadow-lg overflow-hidden">
            <img 
              src="/assets/funnel/product-images/influence-engine-screenshot.png" 
              alt="Influence Engine"
              className="w-full h-full object-cover"
            />
          </div>
        )
      case 'book':
        return (
          <div className="w-16 h-16 rounded-lg shadow-lg overflow-hidden">
            <img 
              src="/assets/funnel/product-images/book-cover.png" 
              alt="Book Cover"
              className="w-full h-full object-cover"
            />
          </div>
        )
      case 'bundle':
        const bundleType = funnelState.products.engine.selected ? 'engine' : 'mastery'
        const bundleImage = bundleType === 'engine' 
          ? '/assets/funnel/product-images/bundle-engine-graphic.png'
          : '/assets/funnel/product-images/bundle-mastery-graphic.png'
        return (
          <div className="w-16 h-16 rounded-lg shadow-lg overflow-hidden">
            <img 
              src={bundleImage}
              alt={`${bundleType} Bundle`}
              className="w-full h-full object-cover"
            />
          </div>
        )
      default:
        return (
          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
            <div className="text-gray-500">📦</div>
          </div>
        )
    }
  }

  const handleCheckout = async () => {
    setIsSubmitting(true)
    
    try {
      // Create checkout session
      const response = await fetch("/api/create-post-quiz-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userEmail: funnelState.userEmail,
          userName: "Customer", // Will be collected in Stripe
          cart: funnelState.cart,
          sourceTracking: funnelState.sourceTracking,
          ndaSigned: funnelState.ndaAgreement.signed,
          userId: funnelState.userId,
        }),
      })

      if (response.ok) {
        const { sessionUrl } = await response.json()
        window.location.href = sessionUrl
      } else {
        console.error("Failed to create checkout session")
      }
    } catch (error) {
      console.error("Error during checkout:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedProducts = getSelectedProducts()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-[#92278F] to-[#a83399] text-white py-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img src="/logo.png" alt="Logo" className="w-12 h-12 rounded-full" />
            <span className="text-2xl font-bold tracking-tight">The Influence Engine™</span>
          </div>
          <h1 className="text-4xl font-bold mb-2">✅ Complete Your Order</h1>
          <p className="text-xl text-white/90">
            Here's what you've selected — confirm below to lock in your special pricing.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 text-center">Your Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Order Items */}
            <div className="space-y-4">
              {selectedProducts.map((product, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  {getProductImage(product)}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-600">{product.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">${product.price}</div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Total */}
            <div className="border-t-2 border-gray-200 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-gray-900">Total:</span>
                <span className="text-2xl font-bold text-[#92278F]">${getTotalPrice()}</span>
              </div>
            </div>

            {/* Special Notes */}
            {funnelState.products.engine.selected && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                      🔒
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-900 mb-2">Member Access Agreement Required</h3>
                      <p className="text-blue-800 text-sm">
                        Influence Engine™ buyers must sign the Member Access Agreement before payment can process.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Checkout Button */}
            <Button
              onClick={handleCheckout}
              disabled={isSubmitting || selectedProducts.length === 0}
              className="w-full bg-[#92278F] hover:bg-[#7a1f78] text-white py-4 text-lg font-semibold"
            >
              {isSubmitting ? "Processing..." : `Proceed to Checkout - $${getTotalPrice()}`}
            </Button>

            <p className="text-center text-sm text-gray-500">
              You'll be redirected to Stripe to complete your payment securely.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

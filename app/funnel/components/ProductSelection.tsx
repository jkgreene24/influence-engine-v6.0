"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, ArrowRight, Package, Zap, Target, Shield, FileText, Users, Crown, BookOpen, ShoppingCart } from "lucide-react"
import { type FunnelState } from "@/lib/utils/funnel-state"
import { getProduct, replacePricingTokens, PRICING_TOKENS } from "@/lib/utils/pricing"
import { automationHelpers } from "@/lib/utils/mock-automation"

interface ProductSelectionProps {
  funnelState: FunnelState
  updateFunnelState: (newState: Partial<FunnelState>) => void
  updateFunnelStateAndGoToNext: (newState: Partial<FunnelState>) => void
  goToNextStep: () => void
}

export default function ProductSelection({ funnelState, updateFunnelState, updateFunnelStateAndGoToNext, goToNextStep }: ProductSelectionProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>(funnelState.cart || [])
  const [loading, setLoading] = useState(false)

  const products = [
    { key: 'Book', icon: BookOpen, color: 'bg-blue-500' },
    { key: 'Toolkit', icon: FileText, color: 'bg-green-500' },
    { key: 'IE_Annual', icon: Crown, color: 'bg-purple-500' },
    { key: 'Bundle', icon: Package, color: 'bg-[#92278F]' }
  ]

  const handleItemToggle = (productKey: string) => {
    if (productKey === 'Bundle') {
      // If bundle is selected, clear other selections and select bundle
      setSelectedItems(['Bundle'])
    } else {
      // If individual item is selected, remove bundle if present
      setSelectedItems(prev => {
        const withoutBundle = prev.filter(item => item !== 'Bundle')
        if (prev.includes(productKey)) {
          return withoutBundle.filter(item => item !== productKey)
        } else {
          return [...withoutBundle, productKey]
        }
      })
    }
  }

  const calculateTotal = () => {
    return selectedItems.reduce((total, item) => {
      const product = getProduct(item as any)
      return total + product.price
    }, 0)
  }

  const calculateSavings = () => {
    if (selectedItems.includes('Bundle')) return 0
    
    const individualTotal = selectedItems.reduce((total, item) => {
      const product = getProduct(item as any)
      return total + product.price
    }, 0)
    
    return Math.max(0, individualTotal - PRICING_TOKENS.Bundle)
  }

  const handleContinue = () => {
    setLoading(true)
    
    // Update funnel state with selected items
    const wantsBundle = selectedItems.includes('Bundle')
    const wantsToolkit = selectedItems.includes('Toolkit') || wantsBundle
    const wantsBook = selectedItems.includes('Book') || wantsBundle
    const wantsIE = selectedItems.includes('IE_Annual') || wantsBundle
    
    // Tag selections in automation
    try {
      if (funnelState.userData?.email) {
        selectedItems.forEach(item => {
          automationHelpers.tagProductSelection(funnelState.userData!.email, item, 'want')
        })
      }
    } catch (error) {
      console.error('Failed to tag product selections:', error)
    }

    updateFunnelStateAndGoToNext({
      cart: selectedItems,
      wantsBundle,
      wantsToolkit,
      wantsBook,
      wantsIE,
      declinedToolkit: !wantsToolkit,
      declinedBook: !wantsBook,
      declinedIE: !wantsIE
    })
  }

  const total = calculateTotal()
  const savings = calculateSavings()
  const hasSelections = selectedItems.length > 0

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

      {/* Product Selection Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Influence Package
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Select the products that best fit your needs. Mix and match or get everything with our bundle.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Product Selection */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Available Products</h2>
            
            {products.map(({ key, icon: Icon, color }) => {
              const product = getProduct(key as any)
              const isSelected = selectedItems.includes(key)
              const isBundle = key === 'Bundle'
              
              return (
                <Card 
                  key={key}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    isSelected ? 'ring-2 ring-[#92278F] bg-[#92278F]/5' : 'hover:ring-1 hover:ring-gray-300'
                  }`}
                  onClick={() => handleItemToggle(key)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 ${color} rounded-full flex items-center justify-center text-white flex-shrink-0`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                          <div className="flex items-center space-x-2">
                            {isSelected && (
                              <CheckCircle className="w-5 h-5 text-[#92278F]" />
                            )}
                            <span className="text-xl font-bold text-[#92278F]">
                              {replacePricingTokens(`[PRICE:${key}]`)}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 mb-3">{product.description}</p>
                        
                        {isBundle && (
                          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                            <p className="text-sm text-green-800 font-medium">Bundle includes:</p>
                            <ul className="text-sm text-green-700 mt-1 space-y-1">
                              <li>• The Book</li>
                              <li>• The Full Toolkit</li>
                              <li>• The Influence Engine™ Annual</li>
                            </ul>
                            <p className="text-sm font-medium text-green-800 mt-2">Save $50 vs. buying individually!</p>
                          </div>
                        )}
                        
                        {!isBundle && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-700">Includes:</p>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {product.features.slice(0, 3).map((feature, index) => (
                                <li key={index}>• {feature}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Order Summary</h2>
            
            <Card>
              <CardContent className="p-6">
                {hasSelections ? (
                  <div className="space-y-4">
                    {selectedItems.map((item) => {
                      const product = getProduct(item as any)
                      return (
                        <div key={item} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-[#92278F] rounded-full flex items-center justify-center text-white">
                              {item === 'Book' && <BookOpen className="w-4 h-4" />}
                              {item === 'Toolkit' && <FileText className="w-4 h-4" />}
                              {item === 'IE_Annual' && <Crown className="w-4 h-4" />}
                              {item === 'Bundle' && <Package className="w-4 h-4" />}
                            </div>
                            <span className="font-medium text-gray-900">{product.name}</span>
                          </div>
                          <span className="font-semibold text-gray-900">
                            {replacePricingTokens(`[PRICE:${item}]`)}
                          </span>
                        </div>
                      )
                    })}
                    
                    {savings > 0 && (
                      <div className="border-t pt-4">
                        <div className="flex items-center justify-between text-green-600">
                          <span className="font-medium">Potential Bundle Savings</span>
                          <span className="font-semibold">-${savings}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Switch to bundle to save money!
                        </p>
                      </div>
                    )}
                    
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-gray-900">Total</span>
                        <span className="text-2xl font-bold text-[#92278F]">${total}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Select products to see your order summary</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Button
                onClick={handleContinue}
                disabled={!hasSelections || loading}
                className="w-full bg-[#92278F] hover:bg-[#7a1f78] text-white py-4 text-lg font-semibold"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>Continue to Checkout</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </Button>
              
              <Button
                onClick={goToNextStep}
                variant="outline"
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-3"
              >
                Skip for Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PostQuizFunnelState } from "@/lib/utils/post-quiz-funnel-state"

interface FinalReviewPageProps {
  funnelState: PostQuizFunnelState
  onAddProduct: (productType: 'toolkit' | 'engine' | 'mastery' | 'book') => void
  onCompleteOrder: () => void
}

export default function FinalReviewPage({ funnelState, onAddProduct, onCompleteOrder }: FinalReviewPageProps) {
  // Determine what products are already selected
  const selectedProducts = funnelState.cart.map(item => item.type)
  
  // Determine what products are missing
  const allProducts: ('toolkit' | 'engine' | 'mastery' | 'book')[] = ['toolkit', 'engine', 'mastery', 'book']
  const missingProducts = allProducts.filter(product => !selectedProducts.includes(product))
  
  // Calculate total
  const total = funnelState.cart.reduce((sum, item) => sum + (item.price || 0), 0)
  
  const getProductInfo = (productType: string) => {
    const productInfo = {
      toolkit: { name: 'Full Toolkit', price: 79, icon: '🧰' },
      engine: { name: 'Influence Engine™', price: 499, icon: '🤖' },
      mastery: { name: 'Mastery Class', price: 297, icon: '🎓' },
      book: { name: 'Book', price: 19, icon: '📚' }
    }
    return productInfo[productType as keyof typeof productInfo] || { name: productType, price: 0, icon: '📦' }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-[#92278F] to-[#a83399] text-white py-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img src="/logo.png" alt="Logo" className="w-12 h-12 rounded-full" />
            <span className="text-2xl font-bold tracking-tight">The Influence Engine™</span>
          </div>
          <h1 className="text-4xl font-bold mb-2">🛒 Review Your Order</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 text-center">You've unlocked:</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedProducts.length > 0 ? (
              <div className="space-y-3">
                {selectedProducts.map(productType => {
                  const info = getProductInfo(productType)
                  return (
                    <div key={productType} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{info.icon}</span>
                        <span className="font-semibold text-gray-900">{info.name}</span>
                      </div>
                      <span className="font-bold text-green-600">${info.price}</span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-8">No products selected yet.</p>
            )}
          </CardContent>
        </Card>

        {missingProducts.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900 text-center">Add before checkout:</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {missingProducts.map(productType => {
                  const info = getProductInfo(productType)
                  return (
                    <div key={productType} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{info.icon}</span>
                        <span className="font-semibold text-gray-900">{info.name}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="font-bold text-gray-900">${info.price}</span>
                        <Button
                          onClick={() => onAddProduct(productType as 'toolkit' | 'engine' | 'mastery' | 'book')}
                          size="sm"
                          className="bg-[#92278F] hover:bg-[#7a1f78] text-white"
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-8 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                Total: ${total}
              </div>
              <p className="text-gray-600">Ready to complete your order</p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button
            onClick={onCompleteOrder}
            className="bg-[#92278F] hover:bg-[#7a1f78] text-white px-12 py-4 text-xl font-semibold"
          >
            🔓 Complete My Order
          </Button>
        </div>
      </div>
    </div>
  )
}

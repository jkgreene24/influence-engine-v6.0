"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PostQuizFunnelState } from "@/lib/utils/post-quiz-funnel-state"

interface BookOfferProps {
  funnelState: PostQuizFunnelState
  onSelect: () => void
  onDecline: () => void
  onNext: () => void
}

export default function BookOffer({ funnelState, onSelect, onDecline, onNext }: BookOfferProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-[#92278F] to-[#a83399] text-white py-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img src="/logo.png" alt="Logo" className="w-12 h-12 rounded-full" />
            <span className="text-2xl font-bold tracking-tight">The Influence Engine™</span>
          </div>
          <h1 className="text-4xl font-bold mb-2">📘 Book Add-On</h1>
          <p className="text-xl text-white/90">
            Influence First: Why Your Deals Are Dying (And How to Fix It)
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <Card className="border-2 border-[#92278F]/20 bg-gradient-to-r from-[#92278F]/5 to-purple-50 mb-8">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
                             <div className="w-48 h-64 mx-auto flex items-center justify-center">
                  <div className="w-48 h-48 rounded-lg shadow-lg overflow-hidden">
                    <img 
                      src="/assets/funnel/product-images/book-cover.png" 
                      alt="Book Cover"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Influence First: Why Your Deals Are Dying (And How to Fix It)
                </h2>
                <p className="text-lg text-gray-700">
                  Normally $29 → Today just $19 (save $10)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 text-center">This isn't theory — it's the field guide for mastering deals and influence.</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                ❌
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Why deals stall and fall apart</h3>
                <p className="text-gray-600">Understanding the hidden dynamics that kill deals</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                🔑
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">How to adjust your influence style mid-deal</h3>
                <p className="text-gray-600">Flexible strategies for different situations</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                🛠️
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Practical exercises to sharpen your conversations</h3>
                <p className="text-gray-600">Actionable techniques you can use immediately</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                📈
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Stories from the field — what worked, what didn't</h3>
                <p className="text-gray-600">Real-world examples and lessons learned</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8 bg-yellow-50 border-yellow-200">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-lg text-yellow-900 mb-4">
                ✨ This page will not reappear — grab your copy now.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => {
                onSelect()
                onNext()
              }}
              className="bg-[#92278F] hover:bg-[#7a1f78] text-white px-8 py-3 text-lg font-semibold"
            >
              Yes, add the book →
            </Button>
            <Button
              onClick={() => {
                onDecline()
                onNext()
              }}
              variant="outline"
              className="px-8 py-3 text-lg font-semibold"
            >
              No thanks
            </Button>
          </div>
          <p className="text-sm text-gray-500">Next: Bundle Offers</p>
        </div>
      </div>
    </div>
  )
}

"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PostQuizFunnelState } from "@/lib/utils/post-quiz-funnel-state"

interface MasteryClassOfferProps {
  funnelState: PostQuizFunnelState
  onSelect: () => void
  onDecline: () => void
  onNext: () => void
}

export default function MasteryClassOffer({ funnelState, onSelect, onDecline, onNext }: MasteryClassOfferProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-[#92278F] to-[#a83399] text-white py-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img src="/logo.png" alt="Logo" className="w-12 h-12 rounded-full" />
            <span className="text-2xl font-bold tracking-tight">The Influence Engine™</span>
          </div>
          <h1 className="text-4xl font-bold mb-2">🎥 Upgrade Your Influence Skills with the Mastery Class</h1>
          <p className="text-xl text-white/90">
            💵 Normally $499 → Today only $299 (Save $200)
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <Card className="border-2 border-[#92278F]/20 bg-gradient-to-r from-[#92278F]/5 to-purple-50 mb-8">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div className="w-48 h-64 mx-auto flex items-center justify-center">
                <div className="w-48 h-48 rounded-lg shadow-lg overflow-hidden bg-white">
                  <img 
                    src="/assets/funnel/product-images/bundle-mastery-graphic.png" 
                    alt="Mastery Class"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <p className="text-lg text-gray-700 leading-relaxed">
                  Not ready for the full Influence Engine™ yet?
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  The Influence Mastery Class is your next step. It gives you the tools and training to sharpen your influence today — and prepares you for the Engine when you're ready.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 text-center">🌟 What's Inside the Mastery Class</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                🎬
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Exclusive Masterclass Training</h3>
                <p className="text-gray-600">A pre-recorded deep-dive workshop on how to apply your Influence Style in real-world real estate conversations.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                📓
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Quick-Start Workbook</h3>
                <p className="text-gray-600">Exercises and prompts to put your style into action immediately.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                🗣️
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Conversation Templates</h3>
                <p className="text-gray-600">Plug-and-play phrasing you can use in seller calls, probate appointments, JV partnerships, attorney meetings, and contractor negotiations.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                💡
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Future Upgrade Credit</h3>
                <p className="text-gray-600">When you're ready to step into the full Influence Engine™, you'll receive $100 off your purchase.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8 bg-gradient-to-r from-[#92278F]/5 to-purple-50 border-[#92278F]/20">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">🚀 Why Upgrade Now?</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    🔑
                  </div>
                  <span className="text-gray-700">Sharpen your influence in the conversations that make or break real estate deals.</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    💪
                  </div>
                  <span className="text-gray-700">Learn at your own pace — stop, rewind, and practice anytime.</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    🏆
                  </div>
                  <span className="text-gray-700">Get practical tools you can use today, while preparing for The Influence Engine™ later.</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">🎁 Special Offer</h2>
              <div className="space-y-4">
                <div className="text-3xl font-bold text-[#92278F]">
                  💵 Normally $499
                </div>
                <div className="text-4xl font-bold text-green-600">
                  ✨ Today only: $299
                </div>
              </div>
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
              🔓 Yes — Add the Mastery Class for $299
            </Button>
            <Button
              onClick={() => {
                onDecline()
                onNext()
              }}
              variant="outline"
              className="px-8 py-3 text-lg font-semibold"
            >
              ❌ No thanks, I'll pass on mastering my influence
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

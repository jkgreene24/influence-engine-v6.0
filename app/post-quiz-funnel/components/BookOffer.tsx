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
          <h1 className="text-4xl font-bold mb-2">📚 Influence First: Why Your Deals Are Dying (And How to Fix It)</h1>
          <p className="text-xl text-white/90">
            💵 Normally $29 → Today only $19 (Save $10)
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
                    src="/assets/funnel/product-images/book-cover.png" 
                    alt="Book Cover"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <p className="text-lg text-gray-700 leading-relaxed">
                  Your deals aren't dying because of your strategy.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  They're dying because of your conversations.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  This isn't another theory book — it's a field guide written from the trenches of real estate deals, probate negotiations, and high-pressure conversations.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 text-center">🌟 Inside This Book, You'll Discover</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                ❌
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Why Deals Stall (and Quietly Die)</h3>
                <p className="text-gray-600">The hidden dynamics that kill closings — and the mistakes you don't even realize you're making.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                🔑
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">The Five Influence Styles</h3>
                <p className="text-gray-600">How Navigators, Catalysts, Anchors, Diplomats, and Connectors naturally show up — and what happens when your style misfires.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                🛠️
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">How to Shift in the Moment</h3>
                <p className="text-gray-600">Practical strategies to adjust your tone, timing, and delivery when a seller, attorney, or partner throws you off balance.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                📈
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Stories from the Field</h3>
                <p className="text-gray-600">Real-world probate meetings, attorney showdowns, and student missteps — with the fixes that turned losses into signed deals.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                🧠
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Exercises to Sharpen Your Voice</h3>
                <p className="text-gray-600">Short, no-fluff drills that help you translate insight into action, so you never freeze again.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Why This Book Matters Section */}
        <Card className="mb-8 bg-gradient-to-r from-[#92278F]/5 to-purple-50 border-[#92278F]/20">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">🚀 Why This Book Matters</h2>
              <div className="space-y-4 text-lg text-gray-700">
                <p>Most sales books focus on the other person.</p>
                <p className="font-semibold">This one shows you how to sharpen your influence — so your words land, your tone builds trust, and your deals move forward instead of falling apart.</p>
                <p>It's the foundation of The Influence Engine™ — and the missing link between good strategies and great results.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Special Offer Section */}
        <Card className="mb-8 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">🎁 Special Offer</h2>
              <div className="space-y-4">
                <div className="text-3xl font-bold text-[#92278F]">
                  💵 Normally $29
                </div>
                <div className="text-4xl font-bold text-green-600">
                  ✨ Today only: $19
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
              🔓 Yes — Add "Influence First" to My Order for $19
            </Button>
            <Button
              onClick={() => {
                onDecline()
                onNext()
              }}
              variant="outline"
              className="px-8 py-3 text-lg font-semibold"
            >
              ❌ No thanks, I'll pass on saving $10 today
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

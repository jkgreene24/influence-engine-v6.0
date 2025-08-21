"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PostQuizFunnelState } from "@/lib/utils/post-quiz-funnel-state"
import { getInfluenceIcon } from "@/lib/utils/influence-icons"

interface ToolkitOfferProps {
  funnelState: PostQuizFunnelState
  onSelect: () => void
  onDecline: () => void
  onNext: () => void
}

export default function ToolkitOffer({ funnelState, onSelect, onDecline, onNext }: ToolkitOfferProps) {
  const getStyleDisplayName = (style: string) => {
    const styleNames: Record<string, string> = {
      catalyst: "Catalyst",
      diplomat: "Diplomat", 
      anchor: "Anchor",
      navigator: "Navigator",
      connector: "Connector"
    }
    return styleNames[style] || style
  }

  const getToolkitTitle = () => {
    if (funnelState.isBlend && funnelState.secondaryStyle) {
      const primaryStyle = getStyleDisplayName(funnelState.influenceStyle)
      const secondaryStyle = getStyleDisplayName(funnelState.secondaryStyle)
      return `${primaryStyle} + ${secondaryStyle} Blend Toolkit`
    }
    return `${getStyleDisplayName(funnelState.influenceStyle)} Toolkit`
  }

  const getToolkitDescription = () => {
    if (funnelState.isBlend && funnelState.secondaryStyle) {
      const primaryStyle = getStyleDisplayName(funnelState.influenceStyle)
      const secondaryStyle = getStyleDisplayName(funnelState.secondaryStyle)
      return `You've seen your snapshot. Now unlock the complete playbook for your unique ${primaryStyle} + ${secondaryStyle} blend so you never leave influence (or deals) to chance.`
    }
    return "You've seen your snapshot. Now unlock the full playbook for your style so you never leave influence (or deals) to chance."
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-[#92278F] to-[#a83399] text-white py-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img src="/logo.png" alt="Logo" className="w-12 h-12 rounded-full" />
            <span className="text-2xl font-bold tracking-tight">The Influence Engine™</span>
          </div>
          <h1 className="text-4xl font-bold mb-2">🧰 Your Complete Influence Style Toolkit</h1>
          <p className="text-xl text-white/90">
            Normally $119 → Today just $79 (save $40)
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
                      src="/assets/funnel/toolkit-covers/Toolkit Cover Generic.png" 
                      alt="Toolkit Cover"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {getToolkitTitle()}
                </h2>
                <p className="text-lg text-gray-700">
                  {getToolkitDescription()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 text-center">What's inside your Toolkit:</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                🎯
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Core Identity & Blind Spots</h3>
                <p className="text-gray-600">What drives your influence & what holds you back</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                🔑
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Reset Strategies</h3>
                <p className="text-gray-600">How to reset when a conversation derails</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                💬
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Power Phrases & Scripts</h3>
                <p className="text-gray-600">Words that instantly land with others</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                🃏
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Quick-Win Cards</h3>
                <p className="text-gray-600">Printable cheat sheets for real-time use</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8 bg-yellow-50 border-yellow-200">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-lg text-yellow-900 mb-4">
                ✨ This is tied to your exact Influence Style. You won't see this page again.
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
              Unlock My Full Toolkit →
            </Button>
            <Button
              onClick={() => {
                onDecline()
                onNext()
              }}
              variant="outline"
              className="px-8 py-3 text-lg font-semibold"
            >
              No thanks, continue
            </Button>
          </div>
          <p className="text-sm text-gray-500">Next: The Influence Engine™</p>
        </div>
      </div>
    </div>
  )
}

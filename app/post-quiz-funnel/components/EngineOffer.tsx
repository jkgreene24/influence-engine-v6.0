"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PostQuizFunnelState } from "@/lib/utils/post-quiz-funnel-state"

interface EngineOfferProps {
  funnelState: PostQuizFunnelState
  onSelect: () => void
  onDecline: () => void
  onNext: () => void
  onDemoProgress: (percentage: number) => void
  onMemberAgreement: () => void
}

export default function EngineOffer({ 
  funnelState, 
  onSelect, 
  onDecline, 
  onNext, 
  onDemoProgress, 
  onMemberAgreement 
}: EngineOfferProps) {
  const progressTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastReportedProgress = useRef<number>(0)

  const debouncedProgressHandler = useCallback((percentage: number) => {
    // Enhanced validation before processing
    if (typeof percentage !== 'number' || 
        !isFinite(percentage) || 
        percentage < 0 || 
        percentage > 100) {
      console.warn("Invalid percentage in debouncedProgressHandler:", percentage)
      return
    }
    
    // Only report progress if it's significantly different (more than 5% change)
    if (Math.abs(percentage - lastReportedProgress.current) >= 5) {
      // Clear any existing timeout
      if (progressTimeoutRef.current) {
        clearTimeout(progressTimeoutRef.current)
      }
      
      // Set a new timeout to report progress after 1 second of no changes
      progressTimeoutRef.current = setTimeout(() => {
        console.log("Reporting progress after debounce:", percentage.toFixed(1) + "%")
        onDemoProgress(percentage)
        lastReportedProgress.current = percentage
      }, 1000)
    }
  }, [onDemoProgress])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (progressTimeoutRef.current) {
        clearTimeout(progressTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-[#92278F] to-[#a83399] text-white py-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img src="/logo.png" alt="Logo" className="w-12 h-12 rounded-full" />
            <span className="text-2xl font-bold tracking-tight">The Influence Engine™</span>
          </div>
          <h1 className="text-4xl font-bold mb-2">🔓 Unlock The Full Influence Engine™</h1>
          <p className="text-xl text-white/90">
            The First AI Tool That Coaches Real Estate Investors in Their Own Influence Style
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Main Value Proposition */}
        <Card className="border-2 border-[#92278F]/20 bg-gradient-to-r from-[#92278F]/5 to-purple-50 mb-8">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div className="w-48 h-64 mx-auto flex items-center justify-center">
                <div className="w-48 h-48 rounded-lg shadow-lg overflow-hidden bg-white">
                  <img 
                    src="/assets/funnel/product-images/influence-engine-screenshot.png" 
                    alt="Influence Engine"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <p className="text-lg text-gray-700 leading-relaxed">
                  Forget chatbots and generic scripts — The Influence Engine™ roleplays sellers, attorneys, and partners with you, sharpening your influence in real conversations.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Your Influence Style Snapshot showed you how you naturally influence.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Now it's time to put it into action with The Influence Engine™ — an AI-powered coaching tool that prepares you for the conversations that make or break a deal.
                </p>
                <div className="space-y-2 text-lg text-gray-700">
                  <p>It's not here to replace you.</p>
                  <p>It's not here to hand you somebody else's script.</p>
                  <p className="font-semibold">It's here to coach you in your voice, so you can handle objections, build trust, and close deals with confidence.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What You'll Get Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 text-center">🌟 What You'll Get With The Influence Engine™</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                🎭
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Live Roleplay Mode</h3>
                <p className="text-gray-600">Practice tough conversations with sellers, attorneys, or partners before the real thing.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                💬
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Objection Handling On Demand</h3>
                <p className="text-gray-600">Flip pushbacks instantly, with phrasing tailored to your Influence Style.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                🧠
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Power Phrases & Reset Tools</h3>
                <p className="text-gray-600">Quick resets so you never freeze under pressure.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                ✍️
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Marketing Rewrite Engine</h3>
                <p className="text-gray-600">Rewrite texts, emails, and letters so they sound natural — not canned.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                📊
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Full Influence Style Integration</h3>
                <p className="text-gray-600">Every tool, phrase, and strategy calibrated to your unique style.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                🤝
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Private Slack Community</h3>
                <p className="text-gray-600">Connect with other users, swap strategies, and get support.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                📚
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Notion Resource Hub</h3>
                <p className="text-gray-600">Your Snapshot Profile and shared resources to guide you (toolkits available as a paid upgrade).</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Why Upgrade Section */}
        <Card className="mb-8 bg-gradient-to-r from-[#92278F]/5 to-purple-50 border-[#92278F]/20">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">🚀 Why Upgrade?</h2>
              <div className="space-y-4 text-lg text-gray-700">
                <p>The quiz told you who you are as an influencer.</p>
                <p className="font-semibold">The Influence Engine™ shows you how to win conversations with it.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    🔑
                  </div>
                  <span className="text-gray-700">Sharper conversations when the stakes are high</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    💪
                  </div>
                  <span className="text-gray-700">Confidence when sellers, attorneys, or partners push back</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    🏆
                  </div>
                  <span className="text-gray-700">More closings, fewer missed opportunities</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    🌐
                  </div>
                  <span className="text-gray-700">Real community + resources to keep you growing</span>
                </div>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                This is the missing link between learning and doing.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Demo Section */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">🎬 Quick Demo</h2>
              <p className="text-lg text-gray-700">
                You'll see a short demo today — just a taste of what's possible.
              </p>
              <p className="text-lg text-gray-700">
                After you unlock access, I'll send you a longer demo by email showing how the Engine works in:
              </p>
              <div className="space-y-2 text-gray-700">
                <p>• Probate seller conversations</p>
                <p>• Attorney meetings</p>
                <p>• Family or partner negotiations</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Section */}
        <Card className="mb-8 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">🎁 Founder's Access Special</h2>
              <div className="space-y-4">
                <div className="text-3xl font-bold text-[#92278F]">
                  💵 Normally $997
                </div>
                <div className="text-4xl font-bold text-green-600">
                  ✨ Today only: $499
                </div>
                <div className="space-y-2 text-lg text-gray-700">
                  <p>👉 One-time payment. 12 months of full access.</p>
                  <p>✅ 14-day money-back guarantee — use it, test it, feel the results, or get your money back.</p>
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
              🔓 Yes — Unlock The Full Influence Engine™ Now
            </Button>
            <Button
              onClick={() => {
                onDecline()
                onNext()
              }}
              variant="outline"
              className="px-8 py-3 text-lg font-semibold"
            >
              ❌ No thanks, I'll pass on sharper conversations and more deals
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

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
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-[#92278F] to-[#a83399] text-white py-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img src="/logo.png" alt="Logo" className="w-12 h-12 rounded-full" />
            <span className="text-2xl font-bold tracking-tight">The Influence Engine™</span>
          </div>
          <h1 className="text-4xl font-bold mb-2">⚙️ Step Into Real-Time Influence Coaching</h1>
          <p className="text-xl text-white/90">
            Normally $997 → Today just $499 (save $498)
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
                      src="/assets/funnel/product-images/influence-engine-screenshot.png" 
                      alt="Influence Engine"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  The Influence Engine™
                </h2>
                <p className="text-lg text-gray-700">
                  Your AI-powered coach, ready 24/7 to help you master influence and close more deals.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 text-center">What you get:</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                🤝
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Roleplay Difficult Conversations</h3>
                <p className="text-gray-600">Practice with sellers, buyers, attorneys</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                📝
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Rewrite Marketing & Presentations</h3>
                <p className="text-gray-600">Tailored in your voice, instantly polished</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                🚧
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Overcome Objections</h3>
                <p className="text-gray-600">Sharpen responses before you're in the hot seat</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                🎤
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Pitch with Confidence</h3>
                <p className="text-gray-600">Influence investors, partners, or audiences</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                🌐
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Join the Community</h3>
                <p className="text-gray-600">Exclusive Slack + Notion access with tools, peers, and Jen's insider notes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 text-center">See it in Action</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-w-2xl mx-auto">
              <video 
                className="w-full rounded-lg shadow-lg"
                controls
                onTimeUpdate={(e) => {
                  const video = e.target as HTMLVideoElement
                  const percentage = (video.currentTime / video.duration) * 100
                  onDemoProgress(percentage)
                }}
              >
                <source src="/assets/funnel/videos/influence-engine-demo.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <p className="text-sm text-gray-500 text-center mt-2">
                Watch the demo to see how The Influence Engine™ works (optional)
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-lg text-blue-900 mb-4">
                💡 This is your one chance at this price. After today, access increases.
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
              Yes, add the Influence Engine™ →
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
          <p className="text-sm text-gray-500">Next: Book Add-On</p>
        </div>
      </div>
    </div>
  )
}

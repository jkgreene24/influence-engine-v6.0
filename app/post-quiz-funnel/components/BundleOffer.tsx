"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PostQuizFunnelState } from "@/lib/utils/post-quiz-funnel-state"

interface BundleOfferProps {
  funnelState: PostQuizFunnelState
  onSelect: (bundleType: 'engine' | 'mastery') => void
  onDecline: () => void
  onNext: () => void
}

export default function BundleOffer({ funnelState, onSelect, onDecline, onNext }: BundleOfferProps) {
  // Check if Engine was selected to determine bundle type
  const engineSelected = funnelState.products.engine.selected
  const bundleType = engineSelected ? 'engine' : 'mastery'
  
  const getBundleInfo = () => {
    if (engineSelected) {
      return {
        title: "Influence Engine™ Bundle",
        description: "Complete package: Engine + Toolkit + Book",
        items: [
          "⚙️ Influence Engine™ ($499)",
          "🧰 Toolkit ($79)", 
          "📘 Book ($19)"
        ],
        originalPrice: 597,
        discountedPrice: 547,
        savings: 50,
        subtitle: "If you said YES to Engine, you see the Engine Bundle:"
      }
    } else {
      return {
        title: "Influence Mastery Bundle",
        description: "Mastery package: Toolkit + Book",
        items: [
          "🎥 Influence Mastery Package ($299, reg $399)",
          "🧰 Toolkit ($79)",
          "📘 Book ($19)"
        ],
        originalPrice: 397,
        discountedPrice: 347,
        savings: 50,
        subtitle: "If you said NO to Engine, you see the Mastery Bundle:"
      }
    }
  }

  const bundleInfo = getBundleInfo()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-[#92278F] to-[#a83399] text-white py-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img src="/logo.png" alt="Logo" className="w-12 h-12 rounded-full" />
            <span className="text-2xl font-bold tracking-tight">The Influence Engine™</span>
          </div>
          <h1 className="text-4xl font-bold mb-2">🎁 Bundle and Save ${bundleInfo.savings}</h1>
          <p className="text-xl text-white/90">
            Final chance — you won't see this bundle again.
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
                      src={bundleType === 'engine' 
                        ? '/assets/funnel/product-images/bundle-engine-graphic.png'
                        : '/assets/funnel/product-images/bundle-mastery-graphic.png'
                      }
                      alt={`${bundleType} Bundle`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {bundleInfo.title}
                </h2>
                <p className="text-lg text-gray-700 mb-4">
                  {bundleInfo.subtitle}
                </p>
                <p className="text-lg text-gray-700">
                  {bundleInfo.description}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 text-center">What's included:</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {bundleInfo.items.map((item, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  ✓
                </div>
                <span className="text-gray-900 font-medium">{item}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="mb-8 bg-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-4 mb-4">
                <span className="text-3xl line-through text-gray-500">${bundleInfo.originalPrice}</span>
                <span className="text-4xl font-bold text-green-600">${bundleInfo.discountedPrice}</span>
              </div>
              <p className="text-lg text-green-900 font-semibold">
                Save ${bundleInfo.savings} today!
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8 bg-yellow-50 border-yellow-200">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-lg text-yellow-900 mb-4">
                ✨ Final chance — you won't see this bundle again.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => {
                onSelect(bundleType)
              }}
              className="bg-[#92278F] hover:bg-[#7a1f78] text-white px-8 py-3 text-lg font-semibold"
            >
              Yes, add the bundle →
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
        </div>
      </div>
    </div>
  )
}

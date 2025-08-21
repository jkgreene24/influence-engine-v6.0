"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PostQuizFunnelState } from "@/lib/utils/post-quiz-funnel-state"

interface SuccessProps {
  funnelState: PostQuizFunnelState
}

export default function Success({ funnelState }: SuccessProps) {
  const getSelectedProducts = () => {
    const products = []
    if (funnelState.products.toolkit.selected) products.push("Toolkit")
    if (funnelState.products.engine.selected) products.push("Influence Engine™")
    if (funnelState.products.book.selected) products.push("Book")
    if (funnelState.products.bundle.selected) products.push("Bundle")
    return products
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-[#92278F] to-[#a83399] text-white py-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img src="/logo.png" alt="Logo" className="w-12 h-12 rounded-full" />
            <span className="text-2xl font-bold tracking-tight">The Influence Engine™</span>
          </div>
          <h1 className="text-4xl font-bold mb-2">🎉 Order Confirmed!</h1>
          <p className="text-xl text-white/90">
            Thank you for your purchase. Your influence journey starts now.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 mb-8">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-white mx-auto">
                <span className="text-3xl">✓</span>
              </div>
              
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome to The Influence Engine™
                </h2>
                <p className="text-lg text-gray-700">
                  Your order has been successfully processed and you'll receive access details shortly.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 text-center">What you purchased:</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {getSelectedProducts().map((product, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  ✓
                </div>
                <span className="text-gray-900 font-medium">{product}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 text-center">What happens next:</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                1
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Check your email</h3>
                <p className="text-gray-600">You'll receive access instructions within the next 5 minutes</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                2
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Access your products</h3>
                <p className="text-gray-600">Follow the links in your email to get started immediately</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                3
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Join the community</h3>
                <p className="text-gray-600">Connect with other influence practitioners and get support</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-lg text-blue-900 mb-4">
                💡 Questions? Need help getting started? Reach out to our support team.
              </p>
              <Button
                onClick={() => window.open('mailto:support@influenceengine.com', '_blank')}
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center space-y-4">
          <Button
            onClick={() => window.location.href = '/'}
            className="bg-[#92278F] hover:bg-[#7a1f78] text-white px-8 py-3 text-lg font-semibold"
          >
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  )
}

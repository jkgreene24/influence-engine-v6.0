"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, ArrowRight, Mail, Download, Users, Crown } from "lucide-react"
import { type FunnelState } from "@/lib/utils/funnel-state"
import { getProduct } from "@/lib/utils/pricing"

interface SuccessProps {
  funnelState: FunnelState
  updateFunnelState: (newState: Partial<FunnelState>) => void
}

export default function Success({ funnelState }: SuccessProps) {
  const cartItems = funnelState.cart.map(item => getProduct(item as any))
  const hasIE = funnelState.cart.includes('IE_Annual')

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

      {/* Success Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to The Influence Engine™!
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your purchase is complete and you're now ready to unlock your influence potential.
          </p>
        </div>

        {/* What's Next */}
        <Card className="mb-8 border-2 border-green-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 text-center">
              What Happens Next
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <Mail className="w-6 h-6 text-[#92278F] mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Check Your Email</h4>
                  <p className="text-sm text-gray-600">
                    You'll receive a confirmation email with your purchase details and next steps.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Download className="w-6 h-6 text-[#92278F] mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Access Your Materials</h4>
                  <p className="text-sm text-gray-600">
                    Download links and access instructions will be sent within the next 10 minutes.
                  </p>
                </div>
              </div>

              {hasIE && (
                <>
                  <div className="flex items-start space-x-3">
                    <Users className="w-6 h-6 text-[#92278F] mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Join the Community</h4>
                      <p className="text-sm text-gray-600">
                        You'll receive an invitation to join our exclusive Slack community.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Crown className="w-6 h-6 text-[#92278F] mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Activate Your Membership</h4>
                      <p className="text-sm text-gray-600">
                        Set up your Influence Engine™ account and start your coaching journey.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Purchase Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Purchase Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {cartItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-[#92278F] rounded-full flex items-center justify-center text-white">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${item.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <div className="text-center space-y-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Get Started?
            </h3>
            <p className="text-lg text-gray-600 mb-6">
              Your influence journey begins now. Here are some quick next steps:
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2"
              onClick={() => window.open('mailto:support@influenceengine.com')}
            >
              <Mail className="w-6 h-6" />
              <span>Contact Support</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2"
              onClick={() => window.open('/dashboard', '_blank')}
            >
              <Download className="w-6 h-6" />
              <span>Access Dashboard</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2"
              onClick={() => window.open('/resources', '_blank')}
            >
              <Crown className="w-6 h-6" />
              <span>View Resources</span>
            </Button>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">Need Help?</h4>
            <p className="text-blue-700 text-sm">
              Our support team is here to help you get the most out of your purchase. 
              Don't hesitate to reach out if you have any questions.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

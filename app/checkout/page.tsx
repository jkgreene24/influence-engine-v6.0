"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { getProduct } from "@/lib/utils/pricing"

export default function CheckoutPage() {
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Load user data from localStorage
    const storedUser = localStorage.getItem("current_influence_user")
    if (storedUser) {
      const user = JSON.parse(storedUser)
      setUserData(user)
      
      // Redirect if no cart items
      if (!user.cart || user.cart.length === 0) {
        router.push("/cart")
      }
    } else {
      // Redirect to quiz if no user data
      router.push("/quick-quiz")
    }
  }, [router])

  const handleCheckout = async () => {
    if (!userData || !userData.cart || userData.cart.length === 0) return

    setLoading(true)

    try {
      // Create checkout session
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userData.id,
          cart: userData.cart,
          userData: {
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            phone: userData.phone,
            company: userData.company,
            role: userData.role,
            source: userData.source,
            reiaName: userData.reiaName,
            socialPlatform: userData.socialPlatform,
            referrerName: userData.referrerName,
            wordOfMouth: userData.wordOfMouth,
            otherSource: userData.otherSource,
            utmSource: userData.utmSource,
            utmMedium: userData.utmMedium,
            utmCampaign: userData.utmCampaign,
            srcBook: userData.srcBook,
            influenceStyle: userData.influenceStyle,
            agreedToTerms: userData.agreedToTerms,
            signature: userData.signature
          }
        })
      })

      if (response.ok) {
        const { url } = await response.json()
        // Redirect to Stripe checkout
        window.location.href = url
      } else {
        console.error("Failed to create checkout session")
        setLoading(false)
      }
    } catch (error) {
      console.error("Error creating checkout session:", error)
      setLoading(false)
    }
  }

  const calculateTotal = () => {
    if (!userData?.cart) return 0
    return userData.cart.reduce((total: number, item: string) => {
      const product = getProduct(item as "Book" | "Toolkit" | "IE_Annual" | "Bundle")
      return total + (product?.price || 0)
    }, 0)
  }

  const calculateSavings = () => {
    if (!userData?.cart) return 0
    const individualTotal = userData.cart.reduce((total: number, item: string) => {
      if (item === 'Bundle') return total
      const product = getProduct(item as "Book" | "Toolkit" | "IE_Annual" | "Bundle")
      return total + (product?.price || 0)
    }, 0)
    
    const bundlePrice = getProduct('Bundle')?.price || 0
    return Math.max(0, individualTotal - bundlePrice)
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#92278F] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const total = calculateTotal()
  const savings = calculateSavings()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <img src="/logo.png" alt="Logo" className="w-10 h-10 rounded-full" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">The Influence Engine™</h1>
                <p className="text-sm text-gray-600">Secure Checkout</p>
              </div>
            </div>
            <Badge variant="outline" className="text-sm">
              Step 5 of 6
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Complete Your Purchase
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            You're just one step away from unlocking your personalized influence coaching experience.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {userData.cart?.map((item: string) => {
                  const product = getProduct(item as "Book" | "Toolkit" | "IE_Annual" | "Bundle")
                  return (
                    <div key={item} className="flex justify-between items-center">
                      <div>
                        <span className="font-semibold text-gray-900">{product?.name}</span>
                        <p className="text-sm text-gray-600">{product?.description}</p>
                      </div>
                      <span className="font-semibold text-lg">${product?.price}</span>
                    </div>
                  )
                })}
                
                {savings > 0 && (
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center text-green-600">
                      <span className="font-semibold">Bundle Savings</span>
                      <span className="font-semibold">-${savings}</span>
                    </div>
                  </div>
                )}
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-xl font-bold">
                    <span>Total</span>
                    <span>${total}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600">Name</span>
                  <p className="font-semibold">{userData.firstName} {userData.lastName}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Email</span>
                  <p className="font-semibold">{userData.email}</p>
                </div>
                {userData.phone && (
                  <div>
                    <span className="text-sm text-gray-600">Phone</span>
                    <p className="font-semibold">{userData.phone}</p>
                  </div>
                )}
                {userData.company && (
                  <div>
                    <span className="text-sm text-gray-600">Company</span>
                    <p className="font-semibold">{userData.company}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Checkout Actions */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment & Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="font-semibold text-green-800">Secure Payment</span>
                  </div>
                  <p className="text-sm text-green-700">
                    Your payment information is encrypted and secure. We use Stripe for all transactions.
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="font-semibold text-blue-800">Instant Access</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    Get immediate access to your products after payment confirmation.
                  </p>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="font-semibold text-purple-800">Money-Back Guarantee</span>
                  </div>
                  <p className="text-sm text-purple-700">
                    30-day money-back guarantee. If you're not satisfied, we'll refund your purchase.
                  </p>
                </div>

                <Button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full bg-[#92278F] hover:bg-[#7a1f78] text-white py-4 text-lg font-semibold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Pay $${total}`
                  )}
                </Button>

                <div className="text-center">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/cart")}
                    className="text-sm"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Cart
                  </Button>
                </div>

                <div className="text-xs text-gray-500 text-center">
                  By completing your purchase, you agree to our Terms of Service and Privacy Policy.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

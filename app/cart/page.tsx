"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, ArrowLeft, BookOpen, Wrench, Zap, Package, Check } from "lucide-react"
import { useRouter } from "next/navigation"
import { getProduct } from "@/lib/utils/pricing"

interface CartState {
  selectedItems: string[]
  agreedToTerms: boolean
  signature: string
  isSigning: boolean
}

export default function CartPage() {
  const [cartState, setCartState] = useState<CartState>({
    selectedItems: [],
    agreedToTerms: false,
    signature: "",
    isSigning: false
  })
  const [userData, setUserData] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    // Load user data from localStorage
    const storedUser = localStorage.getItem("current_influence_user")
    if (storedUser) {
      setUserData(JSON.parse(storedUser))
    } else {
      // Redirect to quiz if no user data
      router.push("/quick-quiz")
    }
  }, [router])

  const products = [
    { key: 'Book', icon: BookOpen, color: 'bg-blue-500', name: 'Influence First Book' },
    { key: 'Toolkit', icon: Wrench, color: 'bg-green-500', name: 'Complete Toolkit' },
    { key: 'IE_Annual', icon: Zap, color: 'bg-purple-500', name: 'Influence Engine Annual' },
    { key: 'Bundle', icon: Package, color: 'bg-orange-500', name: 'Complete Bundle' }
  ]

  const handleItemToggle = (productKey: string) => {
    if (productKey === 'Bundle') {
      // If selecting bundle, clear other selections
      setCartState(prev => ({ ...prev, selectedItems: ['Bundle'] }))
    } else {
      // If selecting individual item, remove bundle if present
      setCartState(prev => {
        const withoutBundle = prev.selectedItems.filter(item => item !== 'Bundle')
        if (withoutBundle.includes(productKey)) {
          return { ...prev, selectedItems: withoutBundle.filter(item => item !== productKey) }
        } else {
          return { ...prev, selectedItems: [...withoutBundle, productKey] }
        }
      })
    }
  }

  const calculateTotal = () => {
    return cartState.selectedItems.reduce((total, item) => {
      const product = getProduct(item as "Book" | "Toolkit" | "IE_Annual" | "Bundle")
      return total + (product?.price || 0)
    }, 0)
  }

  const calculateSavings = () => {
    const individualTotal = cartState.selectedItems.reduce((total, item) => {
      if (item === 'Bundle') return total
      const product = getProduct(item as "Book" | "Toolkit" | "IE_Annual" | "Bundle")
      return total + (product?.price || 0)
    }, 0)
    
    const bundlePrice = getProduct('Bundle')?.price || 0
    return Math.max(0, individualTotal - bundlePrice)
  }

  const handleContinue = async () => {
    if (!cartState.agreedToTerms || !cartState.signature.trim() || cartState.selectedItems.length === 0) return

    // Prepare cart items for database storage
    const cartItems = cartState.selectedItems.includes('Bundle') ? ['Bundle'] : cartState.selectedItems

    // Update user data with cart information
    const updatedUser = {
      id: userData.id,
      ndaSigned: cartState.agreedToTerms,
      ndaDigitalSignature: cartState.signature,
      paidFor: cartItems.join(','), // Store as comma-separated string
      cart: cartItems, // Keep for API processing
    }

    // Save to localStorage for immediate use
    const localStorageUser = {
      ...userData,
      cart: cartItems,
      ndaSigned: cartState.agreedToTerms,
      ndaDigitalSignature: cartState.signature,
      cartCompletedAt: new Date().toISOString()
    }
    localStorage.setItem("current_influence_user", JSON.stringify(localStorageUser))

    // Update database
    try {
      const response = await fetch("/api/update-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser)
      })

      if (response.ok) {
        console.log("Cart data saved successfully")
        // Navigate to checkout
        router.push("/checkout")
      } else {
        console.error("Failed to save cart data")
        // Still continue to checkout
        router.push("/checkout")
      }
    } catch (error) {
      console.error("Error saving cart data:", error)
      // Continue to checkout even if API fails
      router.push("/checkout")
    }
  }

  const total = calculateTotal()
  const savings = calculateSavings()

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Choose Your Products & Complete Registration
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Select the products that will help you master your {userData.influenceStyle || "Connector"} influence style and complete your registration.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Product Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Cards */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Select Your Products</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {products.map((product) => {
                  const productData = getProduct(product.key as "Book" | "Toolkit" | "IE_Annual" | "Bundle")
                  const isSelected = cartState.selectedItems.includes(product.key)
                  const IconComponent = product.icon
                  
                  return (
                    <div
                      key={product.key}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'border-[#92278F] bg-[#92278F]/5'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => handleItemToggle(product.key)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 ${product.color} rounded-lg flex items-center justify-center text-white`}>
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{productData?.name}</h3>
                          <p className="text-sm text-gray-600">{productData?.description}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className="text-lg font-bold text-[#92278F]">${productData?.price}</span>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {isSelected && <Check className="w-6 h-6 text-[#92278F]" />}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Membership Agreement */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Membership Agreement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto text-sm text-gray-700 mb-4">
                  <h4 className="font-semibold mb-2">The Influence Engine™ Membership Agreement</h4>
                  <p className="mb-2">
                    By signing this agreement, you agree to the following terms and conditions:
                  </p>
                  <ul className="list-disc list-inside space-y-1 mb-4">
                    <li>You will receive access to The Influence Engine™ platform and its features</li>
                    <li>Your membership includes personalized coaching and AI-powered insights</li>
                    <li>You agree to use the platform responsibly and ethically</li>
                    <li>Your data will be protected according to our privacy policy</li>
                    <li>You can cancel your membership at any time</li>
                  </ul>
                  <p>
                    By proceeding, you acknowledge that you have read, understood, and agree to these terms.
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={cartState.agreedToTerms}
                    onCheckedChange={(checked) => setCartState(prev => ({ ...prev, agreedToTerms: checked as boolean }))}
                  />
                  <label htmlFor="terms" className="text-sm text-gray-700">
                    I have read and agree to the Membership Agreement
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Digital Signature */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Digital Signature</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Please provide your digital signature to complete your registration:
                  </p>
                  
                  <div className="border-2 border-gray-200 rounded-lg p-4 min-h-[100px] bg-white">
                    {cartState.isSigning ? (
                      <input
                        type="text"
                        value={cartState.signature}
                        onChange={(e) => setCartState(prev => ({ ...prev, signature: e.target.value }))}
                        placeholder="Type your full name here..."
                        className="w-full h-full border-none outline-none text-lg font-semibold"
                        autoFocus
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center cursor-pointer text-gray-400 hover:text-gray-600"
                        onClick={() => setCartState(prev => ({ ...prev, isSigning: true }))}
                      >
                        {cartState.signature || "Click here to sign"}
                      </div>
                    )}
                  </div>
                  
                  {cartState.signature && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCartState(prev => ({ ...prev, signature: "", isSigning: false }))}
                    >
                      Clear Signature
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartState.selectedItems.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No products selected</p>
                ) : (
                  <>
                    {cartState.selectedItems.map((item) => {
                      const product = getProduct(item as "Book" | "Toolkit" | "IE_Annual" | "Bundle")
                      return (
                        <div key={item} className="flex justify-between items-center">
                          <span className="text-sm">{product?.name}</span>
                          <span className="font-semibold">${product?.price}</span>
                        </div>
                      )
                    })}
                    

                    
                    <div className="border-t pt-2">
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>Total</span>
                        <span>${total}</span>
                      </div>
                    </div>
                  </>
                )}

                <Button
                  onClick={handleContinue}
                  disabled={!cartState.agreedToTerms || !cartState.signature.trim() || cartState.selectedItems.length === 0}
                  className="w-full bg-[#92278F] hover:bg-[#7a1f78] text-white py-4 text-lg font-semibold"
                >
                  Continue to Checkout
                </Button>

                <div className="text-center">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/influence-demo")}
                    className="text-sm"
                  >
                    Back to Demo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

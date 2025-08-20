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

  const shouldShowBundleSavings = () => {
    // Don't show if bundle is already selected
    if (cartState.selectedItems.includes('Bundle')) return false
    
    // Don't show if no items selected
    if (cartState.selectedItems.length === 0) return false
    
    const individualTotal = cartState.selectedItems.reduce((total, item) => {
      const product = getProduct(item as "Book" | "Toolkit" | "IE_Annual" | "Bundle")
      return total + (product?.price || 0)
    }, 0)
    
    const bundlePrice = getProduct('Bundle')?.price || 0
    return individualTotal > bundlePrice
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
      cart: cartItems, // Keep cart items for checkout processing
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
      } else {
        console.error("Failed to save cart data")
      }
    } catch (error) {
      console.error("Error saving cart data:", error)
    }

    // Create Stripe checkout session directly
    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userEmail: userData.email,
          userName: `${userData.first_name} ${userData.last_name}`,
          influenceStyle: userData.influenceStyle,
          cart: cartItems,
          metadata: {
            userId: userData.id,
            userEmail: userData.email,
            userName: `${userData.first_name} ${userData.last_name}`,
            influenceStyle: userData.influenceStyle,
            ndaDigitalSignature: cartState.signature,
          }
        })
      })

      if (!response.ok) {
        throw new Error("Failed to create checkout session")
      }

      const { sessionUrl } = await response.json()
      
      if (!sessionUrl) {
        throw new Error("No checkout URL received")
      }

      // Redirect directly to Stripe checkout
      window.location.href = sessionUrl
    } catch (error) {
      console.error("Checkout error:", error)
      // Fallback: show error message or redirect to checkout page
      alert("Failed to create checkout session. Please try again.")
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

            {/* Member Access Agreement */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Member Access Agreement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto text-sm text-gray-700 mb-4">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">The Influence Engine™ Member Access Agreement</h4>
                    
                    <p><strong>1. Access and Use</strong></p>
                    <p>By purchasing access to The Influence Engine™, you agree to use the materials, tools, and resources provided solely for your personal and professional development. You may not share, distribute, or resell any content without explicit written permission.</p>
                    
                    <p><strong>2. Intellectual Property</strong></p>
                    <p>All content, materials, and intellectual property within The Influence Engine™ remain the exclusive property of The Influence Engine™ and its creators. You are granted a limited, non-exclusive license to use these materials for your personal development.</p>
                    
                    <p><strong>3. Professional Use</strong></p>
                    <p>You may use the techniques and strategies learned through The Influence Engine™ in your professional practice, but you may not teach, train, or coach others using our proprietary methods without proper licensing or certification.</p>
                    
                    <p><strong>4. Confidentiality</strong></p>
                    <p>You agree to maintain the confidentiality of proprietary information shared within The Influence Engine™ community and not to disclose specific techniques or strategies to non-members.</p>
                    
                    <p><strong>5. Results Disclaimer</strong></p>
                    <p>While The Influence Engine™ provides proven strategies and techniques, individual results may vary. We do not guarantee specific outcomes or financial results from the use of our materials.</p>
                    
                    <p><strong>6. Community Guidelines</strong></p>
                    <p>As a member, you agree to maintain professional and respectful behavior in all community interactions, including Slack channels and other communication platforms.</p>
                    
                    <p><strong>7. Termination</strong></p>
                    <p>Access to The Influence Engine™ may be terminated for violation of this agreement or community guidelines. No refunds will be provided for violations resulting in termination.</p>
                    
                    <p><strong>8. Updates and Changes</strong></p>
                    <p>This agreement may be updated from time to time. Continued use of The Influence Engine™ constitutes acceptance of any changes.</p>
                    
                    <p className="text-xs text-gray-500 mt-4">
                      By checking the box below and providing your digital signature, you acknowledge that you have read, understood, and agree to be bound by this Member Access Agreement.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="terms"
                    checked={cartState.agreedToTerms}
                    onCheckedChange={(checked) => setCartState(prev => ({ ...prev, agreedToTerms: checked as boolean }))}
                  />
                  <label htmlFor="terms" className="text-sm text-gray-700 leading-relaxed">
                    I have read, understood, and agree to the Member Access Agreement above.
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
                     
                     {/* Bundle Savings Notification - right above total */}
                     {shouldShowBundleSavings() && (
                       <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                         <div className="flex items-center space-x-2">
                           <Check className="w-4 h-4 text-green-600" />
                           <span className="text-sm font-medium text-green-800">
                             Save ${calculateSavings()} with the Bundle!
                           </span>
                         </div>
                       </div>
                     )}
                     
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
                   Pay ${total}
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

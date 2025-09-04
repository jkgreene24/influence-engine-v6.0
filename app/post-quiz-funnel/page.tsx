"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { 
  PostQuizFunnelState, 
  createInitialFunnelState
} from "@/lib/utils/post-quiz-funnel-state"
import SnapshotDelivery from "@/app/post-quiz-funnel/components/SnapshotDelivery"
import ToolkitOffer from "@/app/post-quiz-funnel/components/ToolkitOffer"
import EngineOffer from "@/app/post-quiz-funnel/components/EngineOffer"
import BookOffer from "@/app/post-quiz-funnel/components/BookOffer"
import BundleOffer from "@/app/post-quiz-funnel/components/BundleOffer"
import Checkout from "@/app/post-quiz-funnel/components/Checkout"
import Success from "@/app/post-quiz-funnel/components/Success"

export default function PostQuizFunnelPage() {
  const [funnelState, setFunnelState] = useState<PostQuizFunnelState | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Use ref to always get the current state (prevents closure issues)
  const currentStateRef = useRef<PostQuizFunnelState | null>(null)

  useEffect(() => {
    initializeFunnel()
  }, [])

  const initializeFunnel = async () => {
    try {
      console.log("=== FUNNEL INITIALIZATION START ===")
      
      // Get user data from URL parameters or create default state
      const userId = searchParams.get('userId') || '0'
      const userEmail = searchParams.get('email') || ''
      const influenceStyle = searchParams.get('style') || ''
      const secondaryStyle = searchParams.get('secondaryStyle') || ''
      const isBlend = searchParams.get('isBlend') === 'true'
      
      console.log("URL params received:", { userId, userEmail, influenceStyle, secondaryStyle, isBlend })
      console.log("Raw URL params:", {
        userId: searchParams.get('userId'),
        email: searchParams.get('email'),
        style: searchParams.get('style'),
        secondaryStyle: searchParams.get('secondaryStyle'),
        isBlend: searchParams.get('isBlend')
      })
      
      if (!userEmail || !influenceStyle) {
        console.log("Missing required user data, redirecting to quiz")
        router.push("/quick-quiz")
        return
      }
      
      console.log("Creating initial funnel state...")
      
      // Create initial funnel state
      const newState = createInitialFunnelState(
        parseInt(userId) || 0,
        userEmail,
        influenceStyle,
        secondaryStyle || undefined
      )
      
      // Ensure isBlend is set correctly
      if (isBlend && !newState.isBlend) {
        newState.isBlend = true
      }
      
      console.log("Created initial funnel state:", newState)
      console.log("Funnel state details:", {
        influenceStyle: newState.influenceStyle,
        secondaryStyle: newState.secondaryStyle,
        isBlend: newState.isBlend
      })
      
             setFunnelState(newState)
       currentStateRef.current = newState
       setLoading(false)
       console.log("=== FUNNEL INITIALIZATION COMPLETE ===")
    } catch (error) {
      console.error("Error initializing funnel:", error)
      router.push("/quick-quiz")
    }
  }

  const updateFunnelState = async (newState: Partial<PostQuizFunnelState>) => {
    if (!funnelState) return

    const updatedState = { ...funnelState, ...newState }
    setFunnelState(updatedState)
    currentStateRef.current = updatedState

    // Sync with database
    try {
      await fetch("/api/post-quiz-funnel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "update_state",
          data: newState,
        }),
      })
    } catch (error) {
      console.error("Error syncing funnel state:", error)
    }
  }

  const handleProductSelection = async (productType: keyof PostQuizFunnelState['products']) => {
    if (!funnelState) return

    console.log("Selecting product:", productType)
    console.log("Current funnel state before update:", {
      userId: funnelState.userId,
      userEmail: funnelState.userEmail,
      influenceStyle: funnelState.influenceStyle,
      secondaryStyle: funnelState.secondaryStyle,
      isBlend: funnelState.isBlend
    })

    // Handle product selection locally - ensure we preserve ALL existing state
    const updatedState = {
      ...funnelState,
      products: {
        ...funnelState.products,
        [productType]: {
          ...funnelState.products[productType],
          selected: true,
          declined: false,
          selectedAt: new Date().toISOString(),
        }
      },
      cart: [...funnelState.cart], // Deep clone the cart array
      tags: [...funnelState.tags],
      lastUpdatedAt: new Date().toISOString()
    }
    
    console.log("Cart before adding item:", updatedState.cart)
    
    // Add to cart with proper Stripe configuration
    const cartItem = {
      type: productType as any,
      stripeSku: productType === 'toolkit' ? 'IE_TOOLKIT' : 
                 productType === 'engine' ? 'INFLUENCE_ENGINE_1YR' :
                 productType === 'book' ? 'BOOK_INFLUENCE_FIRST' : 'BUNDLE_ENGINE',
      price: productType === 'toolkit' ? 79 : 
             productType === 'engine' ? 499 :
             productType === 'book' ? 19 : 547,
      stripePriceId: productType === 'toolkit' ? process.env.STRIPE_TOOLKIT_PRICE_ID :
                    productType === 'engine' ? process.env.STRIPE_ENGINE_PRICE_ID :
                    productType === 'book' ? process.env.STRIPE_BOOK_PRICE_ID : process.env.STRIPE_BUNDLE_ENGINE_PRICE_ID,
      metadata: {
        productType: productType,
        influenceStyle: updatedState.influenceStyle,
        isBlend: updatedState.isBlend,
        secondaryStyle: updatedState.secondaryStyle
      }
    }
    
    console.log("Adding cart item:", cartItem)
    updatedState.cart.push(cartItem)
    console.log("Cart after adding item:", updatedState.cart)
    
    // Add tag
    updatedState.tags.push(`PROD_${productType.toUpperCase()}`)
    
    // Remove decline tag if it exists
    updatedState.tags = updatedState.tags.filter(tag => tag !== `NO_${productType.toUpperCase()}`)
    
    console.log("Updated state after product selection:", updatedState)
    console.log("State integrity check:", {
      userId: updatedState.userId,
      userEmail: updatedState.userEmail,
      influenceStyle: updatedState.influenceStyle,
      secondaryStyle: updatedState.secondaryStyle,
      isBlend: updatedState.isBlend
    })
    setFunnelState(updatedState)
    currentStateRef.current = updatedState

    // Try to sync with database in background
    try {
      const response = await fetch("/api/post-quiz-funnel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "select_product",
          data: { productType },
          userId: updatedState.userId,
          userEmail: updatedState.userEmail,
          influenceStyle: updatedState.influenceStyle,
          secondaryStyle: updatedState.secondaryStyle,
        }),
      })

      if (!response.ok) {
        console.warn("Failed to sync product selection with database, but continuing with local state")
      }
    } catch (error) {
      console.warn("Database sync failed for product selection, but continuing with local state:", error)
    }
  }

  const handleProductDecline = async (productType: keyof PostQuizFunnelState['products']) => {
    if (!funnelState) return

    console.log("Declining product:", productType)

    // Handle product decline locally - ensure we preserve ALL existing state
    const updatedState = {
      ...funnelState,
      products: {
        ...funnelState.products,
        [productType]: {
          ...funnelState.products[productType],
          selected: false,
          declined: true,
          declinedAt: new Date().toISOString(),
        }
      },
      cart: [...funnelState.cart],
      tags: [...funnelState.tags],
      lastUpdatedAt: new Date().toISOString()
    }
    
    // Remove from cart
    updatedState.cart = updatedState.cart.filter(item => 
      !item.type.includes(productType)
    )
    
    // Add decline tag
    updatedState.tags.push(`NO_${productType.toUpperCase()}`)
    
    // Remove selection tag if it exists
    updatedState.tags = updatedState.tags.filter(tag => tag !== `PROD_${productType.toUpperCase()}`)
    
    console.log("Updated state after product decline:", updatedState)
    setFunnelState(updatedState)
    currentStateRef.current = updatedState

    // Try to sync with database in background
    try {
      const response = await fetch("/api/post-quiz-funnel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "decline_product",
          data: { productType },
          userId: updatedState.userId,
          userEmail: updatedState.userEmail,
          influenceStyle: updatedState.influenceStyle,
          secondaryStyle: updatedState.secondaryStyle,
        }),
      })

      if (!response.ok) {
        console.warn("Failed to sync product decline with database, but continuing with local state")
      }
    } catch (error) {
      console.warn("Database sync failed for product decline, but continuing with local state:", error)
    }
  }

  const handleNextStep = async () => {
    if (!funnelState) return

    console.log("Moving to next step from:", funnelState.currentStep)
    console.log("Current cart before step transition:", funnelState.cart)
    
    // Use functional state update to ensure we have the latest state
    setFunnelState(currentState => {
      if (!currentState) return currentState
      
      console.log("Functional update - current cart:", currentState.cart)
      
      // For now, handle step transitions locally to avoid database issues
      let nextStep: string
      switch (currentState.currentStep) {
        case 'snapshot':
          nextStep = 'toolkit'
          // Add style tag when moving from snapshot to toolkit
          break
        case 'toolkit':
          nextStep = 'engine'
          break
        case 'engine':
          nextStep = 'book'
          break
        case 'book':
          nextStep = 'bundle'
          break
        case 'bundle':
          nextStep = 'checkout'
          break
        case 'checkout':
          nextStep = 'success'
          break
        default:
          nextStep = 'snapshot'
      }
      console.log("Next step should be:", nextStep)
      
      const updatedState = {
        ...currentState,
        currentStep: nextStep as any,
        products: {
          ...currentState.products,
          toolkit: {
            ...currentState.products.toolkit,
            offered: nextStep === 'toolkit' ? true : currentState.products.toolkit.offered
          },
          engine: {
            ...currentState.products.engine,
            offered: nextStep === 'engine' ? true : currentState.products.engine.offered
          },
          book: {
            ...currentState.products.book,
            offered: nextStep === 'book' ? true : currentState.products.book.offered
          },
          bundle: {
            ...currentState.products.bundle,
            offered: nextStep === 'bundle' ? true : currentState.products.bundle.offered
          }
        },
        cart: [...currentState.cart], // Ensure cart is preserved
        tags: [...currentState.tags],
        lastUpdatedAt: new Date().toISOString(),
      }
      
      console.log("Cart contents in functional update:", updatedState.cart)
      console.log("Cart length in updatedState:", updatedState.cart.length)
      
      // Mark current step as completed and next step as started
      updatedState.tags.push(`${currentState.currentStep.toUpperCase()}_COMPLETED`)
      updatedState.tags.push(`${nextStep.toUpperCase()}_STARTED`)
      
      // Add style tag when moving from snapshot to toolkit
      if (currentState.currentStep === 'snapshot' && nextStep === 'toolkit') {
        updatedState.tags.push(`STYLE_${updatedState.influenceStyle.toUpperCase()}`)
      }
      
      console.log("Updated funnel state to:", updatedState.currentStep)
      console.log("Current tags:", updatedState.tags)
      console.log("Cart contents:", updatedState.cart)
      console.log("Cart length before setState:", updatedState.cart.length)
      console.log("State integrity check:", {
        userId: updatedState.userId,
        userEmail: updatedState.userEmail,
        influenceStyle: updatedState.influenceStyle,
        secondaryStyle: updatedState.secondaryStyle,
        isBlend: updatedState.isBlend
      })
      
      // Sync with database in background (don't block UI)
      syncStepTransitionWithDatabase(updatedState)
      
      // Update the ref with the new state
      currentStateRef.current = updatedState
      
      return updatedState
    })
  }
  
  const syncStepTransitionWithDatabase = async (updatedState: PostQuizFunnelState) => {
    try {
      const response = await fetch("/api/post-quiz-funnel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "move_to_next_step",
          data: {},
          userId: updatedState.userId,
          userEmail: updatedState.userEmail,
          influenceStyle: updatedState.influenceStyle,
          secondaryStyle: updatedState.secondaryStyle,
        }),
      })

      if (!response.ok) {
        console.warn("Failed to sync with database, but continuing with local state")
      }
    } catch (error) {
      console.warn("Database sync failed, but continuing with local state:", error)
    }
  }



  const handleDemoProgress = async (watchPercentage: number) => {
    // Get current state from ref to avoid closure issues
    const currentState = currentStateRef.current
    if (!currentState) {
      console.warn("No current state available, skipping demo progress update")
      return
    }

    // Add comprehensive validation before making the API call
    if (typeof watchPercentage !== 'number' || 
        !isFinite(watchPercentage) || 
        watchPercentage < 0 || 
        watchPercentage > 100) {
      console.warn("Invalid watch percentage:", watchPercentage, "Skipping API call")
      return
    }

    // Check if currentState has valid user data (prevent corruption issues)
    if (!currentState.userId || 
        !currentState.userEmail || 
        !currentState.influenceStyle) {
      console.warn("Funnel state corrupted, skipping demo progress update:", {
        userId: currentState.userId,
        userEmail: currentState.userEmail,
        influenceStyle: currentState.influenceStyle
      })
      console.warn("Current ref state:", currentStateRef.current)
      console.warn("Current funnelState:", funnelState)
      return
    }

    // Only log significant progress changes to reduce noise
    console.log("Updating demo progress:", watchPercentage.toFixed(1) + "%")

    // Make API call in background (don't block UI)
    fetch("/api/post-quiz-funnel", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "update_demo_progress",
        data: { watchPercentage },
        userId: currentState.userId,
        userEmail: currentState.userEmail,
        influenceStyle: currentState.influenceStyle,
        secondaryStyle: currentState.secondaryStyle,
      }),
    })
    .then(response => {
      if (response.ok) {
        return response.json()
      } else if (response.status === 400) {
        // Log the response body to see what the API is rejecting
        return response.text().then(errorBody => {
          console.warn("Demo progress update rejected (400):", errorBody)
          throw new Error("400 Bad Request")
        })
      } else {
        console.error("Error updating demo progress:", response.status, response.statusText)
        throw new Error(`HTTP ${response.status}`)
      }
    })
    .then(data => {
      if (data.funnelState) {
        console.log("API returned funnel state:", data.funnelState)
        console.log("State integrity check before update:", {
          userId: data.funnelState.userId,
          userEmail: data.funnelState.userEmail,
          influenceStyle: data.funnelState.influenceStyle
        })
        setFunnelState(data.funnelState)
        currentStateRef.current = data.funnelState
        console.log("Ref updated with new state")
      }
    })
    .catch(error => {
      console.error("Error updating demo progress:", error)
    })
  }

  const handleMemberAgreement = async () => {
    if (!funnelState) return

    try {
      const response = await fetch("/api/post-quiz-funnel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "sign_member_agreement",
          data: {},
          userId: funnelState.userId,
          userEmail: funnelState.userEmail,
          influenceStyle: funnelState.influenceStyle,
          secondaryStyle: funnelState.secondaryStyle,
        }),
      })

      if (response.ok) {
        const { funnelState: updatedState } = await response.json()
        setFunnelState(updatedState)
        currentStateRef.current = updatedState
      }
    } catch (error) {
      console.error("Error signing member agreement:", error)
    }
  }

  const handleBundleSelection = async (bundleType: 'engine' | 'mastery') => {
    if (!funnelState) return

    console.log("Selecting bundle:", bundleType)

    // Handle bundle selection locally first
    const updatedState = { ...funnelState }
    
    // Update bundle state
    updatedState.products.bundle.selected = true
    updatedState.products.bundle.selectedAt = new Date().toISOString()
    updatedState.products.bundle.declined = false
    
    // Clear individual products and replace with bundle
    updatedState.products.toolkit.selected = false
    updatedState.products.engine.selected = false
    updatedState.products.book.selected = false
    
    // Clear cart and add bundle
    updatedState.cart = []
    console.log("Cart cleared, adding bundle...")
    
    // Add bundle to cart based on type
    if (bundleType === 'engine') {
      updatedState.cart.push({
        type: 'bundle_engine',
        stripeSku: 'BUNDLE_ENGINE',
        price: 547,
        stripePriceId: process.env.STRIPE_BUNDLE_ENGINE_PRICE_ID,
        metadata: {
          bundleType: 'engine',
          replacesIndividualItems: true,
          replacesItems: ['toolkit', 'engine', 'book']
        }
      })
      console.log("Added engine bundle to cart")
    } else {
      updatedState.cart.push({
        type: 'bundle_mastery',
        stripeSku: 'BUNDLE_MASTERY',
        price: 347,
        stripePriceId: process.env.STRIPE_BUNDLE_MASTERY_PRICE_ID,
        metadata: {
          bundleType: 'mastery',
          replacesIndividualItems: true,
          replacesItems: ['toolkit', 'book']
        }
      })
      console.log("Added mastery bundle to cart")
    }
    
    console.log("Final cart after bundle selection:", updatedState.cart)
    
    // Add tags
    updatedState.tags.push(`PROD_BUNDLE_${bundleType.toUpperCase()}`)
    updatedState.tags.push('BUNDLE_REPLACES_INDIVIDUAL_ITEMS')
    
    // Remove individual product tags
    updatedState.tags = updatedState.tags.filter(tag => 
      !tag.startsWith('PROD_TOOLKIT') && 
      !tag.startsWith('PROD_ENGINE') && 
      !tag.startsWith('PROD_BOOK')
    )
    
    updatedState.lastUpdatedAt = new Date().toISOString()
    
    console.log("Updated state after bundle selection:", updatedState)
    setFunnelState(updatedState)
    currentStateRef.current = updatedState

    // Also move to next step (checkout) to preserve cart changes
    const finalState = {
      ...updatedState,
      currentStep: 'checkout' as any,
      lastUpdatedAt: new Date().toISOString(),
    }
    
    // Mark bundle step as completed and checkout as started
    finalState.tags.push('BUNDLE_COMPLETED')
    finalState.tags.push('CHECKOUT_STARTED')
    
    console.log("Moving directly to checkout with bundle cart:", finalState.cart)
    setFunnelState(finalState)
    currentStateRef.current = finalState
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#92278F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your personalized funnel...</p>
        </div>
      </div>
    )
  }

  if (!funnelState) {
    return null
  }

  // Render the appropriate step component
  switch (funnelState.currentStep) {
    case 'snapshot':
      return (
        <SnapshotDelivery
          funnelState={funnelState}
          onNext={handleNextStep}
        />
      )
    case 'toolkit':
      return (
        <ToolkitOffer
          funnelState={funnelState}
          onSelect={() => handleProductSelection('toolkit')}
          onDecline={() => handleProductDecline('toolkit')}
          onNext={handleNextStep}
        />
      )
    case 'engine':
      return (
        <EngineOffer
          funnelState={funnelState}
          onSelect={() => handleProductSelection('engine')}
          onDecline={() => handleProductDecline('engine')}
          onNext={handleNextStep}
          onDemoProgress={handleDemoProgress}
          onMemberAgreement={handleMemberAgreement}
        />
      )
    case 'book':
      return (
        <BookOffer
          funnelState={funnelState}
          onSelect={() => handleProductSelection('book')}
          onDecline={() => handleProductDecline('book')}
          onNext={handleNextStep}
        />
      )
    case 'bundle':
      return (
        <BundleOffer
          funnelState={funnelState}
          onSelect={handleBundleSelection}
          onDecline={() => handleProductDecline('bundle')}
          onNext={handleNextStep}
        />
      )
    case 'checkout':
      return (
        <Checkout
          funnelState={funnelState}
          onUpdateState={updateFunnelState}
        />
      )
    case 'success':
      return (
        <Success
          funnelState={funnelState}
        />
      )
    default:
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Step</h1>
            <p className="text-gray-600">Something went wrong. Please try again.</p>
          </div>
        </div>
      )
  }
}

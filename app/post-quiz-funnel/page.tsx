"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  PostQuizFunnelState, 
  loadFunnelState, 
  saveFunnelState,
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

  useEffect(() => {
    initializeFunnel()
  }, [])

  const initializeFunnel = async () => {
    try {
      console.log("=== FUNNEL INITIALIZATION START ===")
      
      // Load funnel state from localStorage
      let savedState = loadFunnelState()
      console.log("Loaded saved state:", savedState)
      
      if (!savedState) {
        console.log("No saved funnel state found, creating new one...")
        
        // Check if user has completed quiz and get their data
        const currentUser = JSON.parse(localStorage.getItem("current_influence_user") || "null")
        console.log("Current user from localStorage:", currentUser)
        
        if (!currentUser || !currentUser.quizCompleted) {
          console.log("No user or quiz not completed, redirecting to quiz")
          // Redirect to quiz if not completed
          router.push("/quick-quiz")
          return
        }
        
        console.log("User data found, creating initial funnel state...")
        console.log("User ID:", currentUser.id)
        console.log("User Email:", currentUser.email)
        console.log("Influence Style:", currentUser.influenceStyle || currentUser.primaryInfluenceStyle)
        console.log("Secondary Style:", currentUser.secondaryInfluenceStyle)
        
        // Create initial funnel state
        savedState = createInitialFunnelState(
          currentUser.id || 0, // Use 0 as fallback if no ID
          currentUser.email,
          currentUser.influenceStyle || currentUser.primaryInfluenceStyle,
          currentUser.secondaryInfluenceStyle
        )
        console.log("Created initial funnel state:", savedState)
        
        saveFunnelState(savedState)
        console.log("Saved funnel state to localStorage")
      }
      
      console.log("Setting funnel state:", savedState)
      setFunnelState(savedState)
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
    saveFunnelState(updatedState)

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

    // Handle product selection locally
    const updatedState = { ...funnelState }
    
    // Update product state
    updatedState.products[productType] = {
      ...updatedState.products[productType],
      selected: true,
      declined: false,
      selectedAt: new Date().toISOString(),
    }
    
    // Add to cart (simplified for now)
    const cartItem = {
      type: productType as any,
      stripeSku: productType === 'toolkit' ? 'IE_TOOLKIT' : 
                 productType === 'engine' ? 'INFLUENCE_ENGINE_1YR' :
                 productType === 'book' ? 'BOOK_INFLUENCE_FIRST' : 'BUNDLE_ENGINE',
      price: productType === 'toolkit' ? 79 : 
             productType === 'engine' ? 499 :
             productType === 'book' ? 19 : 547,
    }
    updatedState.cart.push(cartItem)
    
    // Add tag
    updatedState.tags.push(`PROD_${productType.toUpperCase()}`)
    
    // Remove decline tag if it exists
    updatedState.tags = updatedState.tags.filter(tag => tag !== `NO_${productType.toUpperCase()}`)
    
    updatedState.lastUpdatedAt = new Date().toISOString()
    
    console.log("Updated state after product selection:", updatedState)
    setFunnelState(updatedState)
    saveFunnelState(updatedState)

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
          userId: funnelState.userId,
          userEmail: funnelState.userEmail,
          influenceStyle: funnelState.influenceStyle,
          secondaryStyle: funnelState.secondaryStyle,
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

    // Handle product decline locally
    const updatedState = { ...funnelState }
    
    // Update product state
    updatedState.products[productType] = {
      ...updatedState.products[productType],
      selected: false,
      declined: true,
      declinedAt: new Date().toISOString(),
    }
    
    // Remove from cart
    updatedState.cart = updatedState.cart.filter(item => 
      !item.type.includes(productType)
    )
    
    // Add decline tag
    updatedState.tags.push(`NO_${productType.toUpperCase()}`)
    
    // Remove selection tag if it exists
    updatedState.tags = updatedState.tags.filter(tag => tag !== `PROD_${productType.toUpperCase()}`)
    
    updatedState.lastUpdatedAt = new Date().toISOString()
    
    console.log("Updated state after product decline:", updatedState)
    setFunnelState(updatedState)
    saveFunnelState(updatedState)

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
          userId: funnelState.userId,
          userEmail: funnelState.userEmail,
          influenceStyle: funnelState.influenceStyle,
          secondaryStyle: funnelState.secondaryStyle,
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

    // For now, handle step transitions locally to avoid database issues
    let nextStep: string
    switch (funnelState.currentStep) {
      case 'snapshot':
        nextStep = 'toolkit'
        // Add style tag when moving from snapshot to toolkit
        funnelState.tags.push(`STYLE_${funnelState.influenceStyle.toUpperCase()}`)
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
      ...funnelState,
      currentStep: nextStep as any,
      lastUpdatedAt: new Date().toISOString(),
    }
    
    // Mark current step as completed and next step as started
    updatedState.tags.push(`${funnelState.currentStep.toUpperCase()}_COMPLETED`)
    updatedState.tags.push(`${nextStep.toUpperCase()}_STARTED`)
    
    // Mark products as offered when reaching their step
    switch (nextStep) {
      case 'toolkit':
        updatedState.products.toolkit.offered = true
        break
      case 'engine':
        updatedState.products.engine.offered = true
        break
      case 'book':
        updatedState.products.book.offered = true
        break
      case 'bundle':
        updatedState.products.bundle.offered = true
        break
    }
    
    console.log("Updated funnel state to:", updatedState.currentStep)
    console.log("Current tags:", updatedState.tags)
    setFunnelState(updatedState)
    saveFunnelState(updatedState)

    // Try to sync with database in background (don't block UI)
    try {
      const response = await fetch("/api/post-quiz-funnel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "move_to_next_step",
          data: {},
          userId: funnelState.userId,
          userEmail: funnelState.userEmail,
          influenceStyle: funnelState.influenceStyle,
          secondaryStyle: funnelState.secondaryStyle,
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
    if (!funnelState) return

    try {
      const response = await fetch("/api/post-quiz-funnel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "update_demo_progress",
          data: { watchPercentage },
          userId: funnelState.userId,
          userEmail: funnelState.userEmail,
          influenceStyle: funnelState.influenceStyle,
          secondaryStyle: funnelState.secondaryStyle,
        }),
      })

      if (response.ok) {
        const { funnelState: updatedState } = await response.json()
        setFunnelState(updatedState)
        saveFunnelState(updatedState)
      }
    } catch (error) {
      console.error("Error updating demo progress:", error)
    }
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
        saveFunnelState(updatedState)
      }
    } catch (error) {
      console.error("Error signing member agreement:", error)
    }
  }

  const handleBundleSelection = async (bundleType: 'engine' | 'mastery') => {
    if (!funnelState) return

    try {
      const response = await fetch("/api/post-quiz-funnel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "select_bundle",
          data: { bundleType },
          userId: funnelState.userId,
          userEmail: funnelState.userEmail,
          influenceStyle: funnelState.influenceStyle,
          secondaryStyle: funnelState.secondaryStyle,
        }),
      })

      if (response.ok) {
        const { funnelState: updatedState } = await response.json()
        setFunnelState(updatedState)
        saveFunnelState(updatedState)
      }
    } catch (error) {
      console.error("Error selecting bundle:", error)
    }
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

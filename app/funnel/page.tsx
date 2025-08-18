"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { loadFunnelState, saveFunnelState, type FunnelState } from "@/lib/utils/funnel-state"
import { getProduct, PRICING_TOKENS } from "@/lib/utils/pricing"
import QuizEntry from "./components/QuizEntry"
import QuizResults from "./components/QuizResults"
import ToolkitOffer from "./components/ToolkitOffer"
import BookOffer from "./components/BookOffer"
import IEOffer from "./components/IEOffer"
import BundleOffer from "./components/BundleOffer"
import Checkout from "./components/Checkout"
import Success from "./components/Success"

export default function FunnelPage() {
  const [funnelState, setFunnelState] = useState<FunnelState | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Load funnel state from localStorage
    const savedState = loadFunnelState()
    console.log('Loaded funnel state:', savedState)
    
    if (!savedState) {
      // If no funnel state, redirect to entry
      console.log('No funnel state found, redirecting to entry')
      router.push("/")
      return
    }
    
    // Check for URL parameters to override step
    const urlParams = new URLSearchParams(window.location.search)
    const stepParam = urlParams.get('step')
    
    if (stepParam && savedState.step !== stepParam) {
      savedState.step = stepParam as any
      saveFunnelState(savedState)
    }
    
    console.log('Setting funnel state:', savedState)
    setFunnelState(savedState)
    setLoading(false)
  }, [router])

  const updateFunnelState = (newState: Partial<FunnelState>) => {
    if (funnelState) {
      const updatedState = { ...funnelState, ...newState }
      console.log('Updating funnel state:', { 
        oldState: funnelState, 
        newState, 
        updatedState,
        cartChange: {
          oldCart: funnelState.cart,
          newCart: updatedState.cart,
          cartChanged: funnelState.cart.length !== updatedState.cart.length
        }
      })
      setFunnelState(updatedState)
      saveFunnelState(updatedState)
    }
  }

  const updateFunnelStateAndGoToNext = (newState: Partial<FunnelState>) => {
    if (funnelState) {
      const updatedState = { ...funnelState, ...newState }
      const nextStep = getNextStep(updatedState)
      const finalState = { ...updatedState, step: nextStep }
      
      console.log('Updating funnel state and going to next step:', { 
        oldState: funnelState, 
        newState, 
        updatedState,
        nextStep,
        finalState,
        cartChange: {
          oldCart: funnelState.cart,
          newCart: finalState.cart,
          cartChanged: funnelState.cart.length !== finalState.cart.length
        }
      })
      
      setFunnelState(finalState)
      saveFunnelState(finalState)
    }
  }

  const goToNextStep = () => {
    if (!funnelState) return
    
    const nextStep = getNextStep(funnelState)
    // Only update the step, preserve all other state including cart
    updateFunnelState({ 
      step: nextStep
    })
  }

  const getNextStep = (state: FunnelState): FunnelState['step'] => {
    switch (state.step) {
      case 'entry':
        return 'quiz'
      case 'quiz':
        return 'results'
      case 'results':
        return 'toolkit-offer'
      case 'toolkit-offer':
        // Always go to book offer next (unless SRC_BOOK is true)
        return shouldShowBookOffer(state) ? 'book-offer' : 'ie-offer'
      case 'book-offer':
        return 'ie-offer'
      case 'ie-offer':
        // Always show bundle offer after IE offer (if bundle not selected)
        return shouldShowBundleOffer(state) ? 'bundle-offer' : 'checkout'
      case 'bundle-offer':
        return 'checkout'
      case 'checkout':
        return 'success'
      default:
        return 'entry'
    }
  }

  const shouldShowBookOffer = (state: FunnelState): boolean => {
    // Skip book offer if SRC_BOOK is true
    return !state.sourceTracking.srcBook
  }

  const shouldShowBundleOffer = (state: FunnelState): boolean => {
    // Always show bundle offer if:
    // 1. Bundle hasn't been selected yet
    // 
    // Note: Per Jen Greene's feedback, bundle should always be offered
    // regardless of what individual packages the user has selected
    return !state.wantsBundle
  }

  const shouldAutoUpgradeToBundle = (state: FunnelState): boolean => {
    // Auto-upgrade to bundle if user has selected combinations that cost more than bundle
    if (state.wantsBundle || state.cart.length === 0) return false
    
    const cartTotal = state.cart.reduce((total, item) => {
      const product = getProduct(item as any)
      return total + product.price
    }, 0)
    
    const shouldUpgrade = cartTotal >= PRICING_TOKENS.Bundle
    
    console.log('Auto-upgrade check:', {
      cart: state.cart,
      cartTotal,
      bundlePrice: PRICING_TOKENS.Bundle,
      shouldUpgrade
    })
    
    // Auto-upgrade if cart total is >= bundle price ($547)
    return shouldUpgrade
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#92278F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your assessment...</p>
        </div>
      </div>
    )
  }

  if (!funnelState) {
    return null
  }

  // Check for auto-upgrade to bundle before rendering
  if (funnelState.step === 'ie-offer' && shouldAutoUpgradeToBundle(funnelState)) {
    console.log('🚀 Auto-upgrading to bundle!')
    
    // Auto-upgrade to bundle and go to checkout
    const updatedState: FunnelState = {
      ...funnelState,
      wantsBundle: true,
      wantsToolkit: true,
      wantsBook: true,
      wantsIE: true,
      declinedToolkit: false,
      declinedBook: false,
      declinedIE: false,
      cart: ['Bundle'],
      step: 'checkout' as const
    }
    
    // Tag auto-upgrade in automation
    try {
      if (funnelState.userData?.email) {
        import("@/lib/utils/mock-automation").then(({ automationHelpers }) => {
          automationHelpers.tagProductSelection(funnelState.userData!.email, 'Bundle', 'want')
        })
      }
    } catch (error) {
      console.error('Failed to tag auto-upgrade:', error)
    }
    
    setFunnelState(updatedState)
    saveFunnelState(updatedState)
    return <Checkout funnelState={updatedState} updateFunnelState={updateFunnelState} goToNextStep={goToNextStep} />
  }

  // Render the appropriate step component
  switch (funnelState.step) {
    case 'entry':
      return <QuizEntry funnelState={funnelState} updateFunnelState={updateFunnelState} goToNextStep={goToNextStep} />
    case 'quiz':
      return <QuizResults funnelState={funnelState} updateFunnelState={updateFunnelState} goToNextStep={goToNextStep} />
    case 'results':
      return <QuizResults funnelState={funnelState} updateFunnelState={updateFunnelState} goToNextStep={goToNextStep} />
    case 'toolkit-offer':
      return <ToolkitOffer funnelState={funnelState} updateFunnelState={updateFunnelState} updateFunnelStateAndGoToNext={updateFunnelStateAndGoToNext} goToNextStep={goToNextStep} />
    case 'book-offer':
      return <BookOffer funnelState={funnelState} updateFunnelState={updateFunnelState} updateFunnelStateAndGoToNext={updateFunnelStateAndGoToNext} goToNextStep={goToNextStep} />
    case 'ie-offer':
      return <IEOffer funnelState={funnelState} updateFunnelState={updateFunnelState} updateFunnelStateAndGoToNext={updateFunnelStateAndGoToNext} goToNextStep={goToNextStep} />
    case 'bundle-offer':
      return <BundleOffer funnelState={funnelState} updateFunnelState={updateFunnelState} updateFunnelStateAndGoToNext={updateFunnelStateAndGoToNext} goToNextStep={goToNextStep} />
    case 'checkout':
      return <Checkout funnelState={funnelState} updateFunnelState={updateFunnelState} goToNextStep={goToNextStep} />
    case 'success':
      return <Success funnelState={funnelState} updateFunnelState={updateFunnelState} />
    default:
      return <QuizEntry funnelState={funnelState} updateFunnelState={updateFunnelState} goToNextStep={goToNextStep} />
  }
}

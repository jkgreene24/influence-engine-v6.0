"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { loadFunnelState, saveFunnelState, type FunnelState } from "@/lib/utils/funnel-state"
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
        if (state.wantsIE) {
          return 'checkout'
        } else {
          return shouldShowBundleOffer(state) ? 'bundle-offer' : 'checkout'
        }
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
    // Show bundle offer if:
    // 1. IE is not wanted (user declined IE)
    // 2. 2+ items have been declined (Toolkit, Book, or IE)
    // 3. Bundle hasn't been selected yet
    const declinedCount = [state.declinedToolkit, state.declinedBook, state.declinedIE].filter(Boolean).length
    return declinedCount >= 2 && !state.wantsIE && !state.wantsBundle
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

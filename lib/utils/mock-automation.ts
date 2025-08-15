// Mock automation service for testing third-party API communications

export interface AutomationEvent {
  event: string
  userId?: string
  userEmail: string
  tags: string[]
  metadata?: Record<string, any>
  timestamp: string
}

export interface AutomationResponse {
  success: boolean
  message: string
  eventId?: string
}

class MockAutomationService {
  private events: AutomationEvent[] = []
  private isEnabled = true

  // Simulate API call to automation service (e.g., ActiveCampaign, ConvertKit, etc.)
  async trackEvent(event: Omit<AutomationEvent, 'timestamp'>): Promise<AutomationResponse> {
    if (!this.isEnabled) {
      return {
        success: false,
        message: 'Automation service is disabled'
      }
    }

    const fullEvent: AutomationEvent = {
      ...event,
      timestamp: new Date().toISOString()
    }

    this.events.push(fullEvent)

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100))

    console.log('🤖 Automation Event:', {
      event: fullEvent.event,
      userEmail: fullEvent.userEmail,
      tags: fullEvent.tags,
      metadata: fullEvent.metadata
    })

    return {
      success: true,
      message: 'Event tracked successfully',
      eventId: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
  }

  // Simulate tagging a user
  async addTags(userEmail: string, tags: string[]): Promise<AutomationResponse> {
    return this.trackEvent({
      event: 'TAG_ADDED',
      userEmail,
      tags,
      metadata: { action: 'add_tags', tags }
    })
  }

  // Simulate removing tags
  async removeTags(userEmail: string, tags: string[]): Promise<AutomationResponse> {
    return this.trackEvent({
      event: 'TAG_REMOVED',
      userEmail,
      tags,
      metadata: { action: 'remove_tags', tags }
    })
  }

  // Simulate starting a nurture sequence
  async startNurture(userEmail: string, sequenceName: string): Promise<AutomationResponse> {
    return this.trackEvent({
      event: 'NURTURE_STARTED',
      userEmail,
      tags: [`NURTURE_${sequenceName.toUpperCase()}`],
      metadata: { sequence: sequenceName }
    })
  }

  // Simulate purchase event
  async trackPurchase(userEmail: string, products: string[], amount: number): Promise<AutomationResponse> {
    const tags = products.map(product => `PROD_${product.toUpperCase()}`)
    
    return this.trackEvent({
      event: 'PURCHASE_COMPLETED',
      userEmail,
      tags,
      metadata: { 
        products,
        amount,
        currency: 'USD'
      }
    })
  }

  // Get all tracked events (for debugging)
  getEvents(): AutomationEvent[] {
    return [...this.events]
  }

  // Clear events (for testing)
  clearEvents(): void {
    this.events = []
  }

  // Enable/disable the service
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled
  }
}

// Export singleton instance
export const automationService = new MockAutomationService()

// Helper functions for common automation tasks
export const automationHelpers = {
  // Tag lead source
  async tagLeadSource(userEmail: string, sourceTracking: any): Promise<void> {
    const tags: string[] = []
    
    if (sourceTracking.source === 'REIA Event' && sourceTracking.reiaName) {
      tags.push(`SRC_REIA_${sourceTracking.reiaName.replace(/\s+/g, '_')}`)
    }
    
    if (sourceTracking.source === 'Social Media' && sourceTracking.socialPlatform) {
      tags.push(`SRC_SOCIAL_${sourceTracking.socialPlatform.toUpperCase()}`)
    }
    
    if (sourceTracking.source === 'Referral' && sourceTracking.referrerName) {
      tags.push(`SRC_REFERRAL_${sourceTracking.referrerName.replace(/\s+/g, '_')}`)
    }
    
    if (sourceTracking.source === 'Word of Mouth') {
      tags.push('SRC_WORDMOUTH')
    }
    
    if (sourceTracking.source === 'Other') {
      tags.push('SRC_OTHER')
    }
    
    if (sourceTracking.srcBook) {
      tags.push('SRC_BOOK')
    }
    
    if (tags.length > 0) {
      await automationService.addTags(userEmail, tags)
    }
  },

  // Tag quiz events
  async tagQuizEvents(userEmail: string, influenceStyle?: string): Promise<void> {
    await automationService.trackEvent({
      event: 'QUIZ_STARTED',
      userEmail,
      tags: ['QUIZ_STARTED']
    })
    
    if (influenceStyle) {
      await automationService.addTags(userEmail, [`STYLE_${influenceStyle.toUpperCase()}`])
    }
  },

  // Tag quiz completion
  async tagQuizCompletion(userEmail: string): Promise<void> {
    await automationService.trackEvent({
      event: 'QUIZ_COMPLETED',
      userEmail,
      tags: ['QUIZ_COMPLETED']
    })
  },

  // Tag product selections
  async tagProductSelection(userEmail: string, product: string, action: 'want' | 'decline'): Promise<void> {
    const event = action === 'want' ? 'PRODUCT_SELECTED' : 'PRODUCT_DECLINED'
    const tag = action === 'want' ? `WANT_${product.toUpperCase()}` : `NO_${product.toUpperCase()}`
    
    await automationService.trackEvent({
      event,
      userEmail,
      tags: [tag],
      metadata: { product, action }
    })
  },

  // Tag purchase
  async tagPurchase(userEmail: string, products: string[], amount: number): Promise<void> {
    await automationService.trackPurchase(userEmail, products, amount)
    
    // Remove decline tags for purchased products
    const declineTags = products.map(product => `NO_${product.toUpperCase()}`)
    await automationService.removeTags(userEmail, declineTags)
  },

  // Start nurture sequences
  async startNurtureSequences(userEmail: string, declinedProducts: string[]): Promise<void> {
    for (const product of declinedProducts) {
      await automationService.startNurture(userEmail, `${product.toLowerCase()}_nurture`)
    }
  }
}

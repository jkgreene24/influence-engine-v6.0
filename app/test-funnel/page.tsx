"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { automationService } from "@/lib/utils/mock-automation"
import { clearFunnelState, INITIAL_FUNNEL_STATE, saveFunnelState } from "@/lib/utils/funnel-state"

export default function TestFunnelPage() {
  const [events, setEvents] = useState<any[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const runTestFunnel = async () => {
    setIsRunning(true)
    
    // Clear previous events
    automationService.clearEvents()
    
    // Create test user data
    const testUserData = {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "5551234567",
      company: "Test Company",
      role: "Manager"
    }

    // Create test funnel state
    const testFunnelState = {
      ...INITIAL_FUNNEL_STATE,
      userData: testUserData,
      sourceTracking: {
        source: "Social Media",
        socialPlatform: "LinkedIn",
        utmSource: "linkedin",
        utmMedium: "social",
        utmCampaign: "influence_test"
      }
    }

    // Save to localStorage
    saveFunnelState(testFunnelState)

    console.log("🧪 Starting test funnel...")
    
    // Simulate the complete funnel flow
    const steps = [
      { name: "Lead Capture", delay: 1000 },
      { name: "Quiz Start", delay: 2000 },
      { name: "Quiz Complete", delay: 1500 },
      { name: "Toolkit Offer", delay: 2000 },
      { name: "Toolkit Decline", delay: 1000 },
      { name: "Book Offer", delay: 2000 },
      { name: "Book Accept", delay: 1000 },
      { name: "IE Offer", delay: 2000 },
      { name: "IE Decline", delay: 1000 },
      { name: "Bundle Offer", delay: 2000 },
      { name: "Bundle Accept", delay: 1000 },
      { name: "Checkout", delay: 2000 },
      { name: "Purchase Complete", delay: 1000 }
    ]

    for (const step of steps) {
      console.log(`🧪 Step: ${step.name}`)
      await new Promise(resolve => setTimeout(resolve, step.delay))
      
      // Update events display
      setEvents([...automationService.getEvents()])
    }

    console.log("🧪 Test funnel completed!")
    setIsRunning(false)
  }

  const clearTest = () => {
    automationService.clearEvents()
    clearFunnelState()
    setEvents([])
  }

  const getEventIcon = (event: string) => {
    switch (event) {
      case 'TAG_ADDED':
        return '🏷️'
      case 'QUIZ_STARTED':
        return '📝'
      case 'QUIZ_COMPLETED':
        return '✅'
      case 'PRODUCT_SELECTED':
        return '🛒'
      case 'PRODUCT_DECLINED':
        return '❌'
      case 'PURCHASE_COMPLETED':
        return '💰'
      default:
        return '📊'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Influence Engine™ Funnel Test
          </h1>
          <p className="text-xl text-gray-600">
            Test the complete funnel flow with mock automation tracking
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Test Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Test Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={runTestFunnel}
                disabled={isRunning}
                className="w-full bg-[#92278F] hover:bg-[#7a1f78] text-white"
              >
                {isRunning ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Running Test...</span>
                  </div>
                ) : (
                  <span>Run Complete Funnel Test</span>
                )}
              </Button>
              
              <Button
                onClick={clearTest}
                variant="outline"
                className="w-full"
              >
                Clear Test Data
              </Button>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Test Scenario</h4>
                <p className="text-sm text-blue-700">
                  This test simulates a user who:
                </p>
                <ul className="text-sm text-blue-700 mt-2 space-y-1">
                  <li>• Comes from LinkedIn (Social Media)</li>
                  <li>• Completes the quiz (gets Catalyst style)</li>
                  <li>• Declines the Toolkit</li>
                  <li>• Accepts the Book</li>
                  <li>• Declines the Influence Engine</li>
                  <li>• Accepts the Bundle</li>
                  <li>• Completes purchase</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Automation Events */}
          <Card>
            <CardHeader>
              <CardTitle>Automation Events</CardTitle>
              <p className="text-sm text-gray-600">
                Real-time tracking of automation events
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {events.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No events yet. Run the test to see automation tracking in action.
                  </p>
                ) : (
                  events.map((event, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg border"
                    >
                      <span className="text-lg">{getEventIcon(event.event)}</span>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900">
                            {event.event}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {new Date(event.timestamp).toLocaleTimeString()}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          {event.userEmail}
                        </p>
                        {event.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {event.tags.map((tag: string, tagIndex: number) => (
                              <Badge key={tagIndex} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {event.metadata && (
                          <p className="text-xs text-gray-500 mt-1">
                            {JSON.stringify(event.metadata)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Funnel Flow Diagram */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Funnel Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center space-x-4 overflow-x-auto py-4">
              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  1
                </div>
                <span className="text-sm font-medium">Lead Capture</span>
              </div>
              <div className="text-gray-400">→</div>
              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                  2
                </div>
                <span className="text-sm font-medium">Quiz</span>
              </div>
              <div className="text-gray-400">→</div>
              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  3
                </div>
                <span className="text-sm font-medium">Results</span>
              </div>
              <div className="text-gray-400">→</div>
              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                  4
                </div>
                <span className="text-sm font-medium">Toolkit</span>
              </div>
              <div className="text-gray-400">→</div>
              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">
                  5
                </div>
                <span className="text-sm font-medium">Book</span>
              </div>
              <div className="text-gray-400">→</div>
              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                  6
                </div>
                <span className="text-sm font-medium">IE</span>
              </div>
              <div className="text-gray-400">→</div>
              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                  7
                </div>
                <span className="text-sm font-medium">Bundle</span>
              </div>
              <div className="text-gray-400">→</div>
              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold">
                  8
                </div>
                <span className="text-sm font-medium">Checkout</span>
              </div>
              <div className="text-gray-400">→</div>
              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                  9
                </div>
                <span className="text-sm font-medium">Success</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

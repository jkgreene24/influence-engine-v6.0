"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, ArrowRight, FileText, Shield, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"

export default function InfluenceNDAPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [agreed, setAgreed] = useState(false)
  const [signing, setSigning] = useState(false)
  const [signed, setSigned] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("current_influence_user") || "null")
    if (!currentUser) {
      router.push("/contact")
      return
    }

    if (!currentUser.quizCompleted) {
      router.push("/influence-quiz")
      return
    }

    if (!currentUser.demoWatched) {
      router.push("/influence-demo")
      return
    }

    // Check if already signed
    if (currentUser.ndaSigned) {
      setSigned(true)
    }

    setUser(currentUser)
    setLoading(false)
  }, [router])

  const handleSignNDA = async () => {
    if (!agreed) return

    setSigning(true)

    try {
      // Update user data
      const updatedUser = {
        ...user,
        ndaSigned: true,
        ndaSignedAt: new Date().toISOString(),
      }

      localStorage.setItem("current_influence_user", JSON.stringify(updatedUser))

      // Update users array
      const users = JSON.parse(localStorage.getItem("influence_users") || "[]")
      const userIndex = users.findIndex((u: any) => u.id === user.id)
      if (userIndex !== -1) {
        users[userIndex] = updatedUser
        localStorage.setItem("influence_users", JSON.stringify(users))
      }

      setUser(updatedUser)
      setSigned(true)
    } catch (error) {
      console.error("Error signing NDA:", error)
    } finally {
      setSigning(false)
    }
  }

  const handleContinue = () => {
    // For now, show completion message
    // Later this will redirect to payment/toolkit access
    alert("Congratulations! You've completed the assessment process. Your toolkit access will be provided shortly.")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#92278F]"></div>
      </div>
    )
  }

  if (signed) {
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
                  <p className="text-sm text-gray-600">NDA Completed</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-6 py-8">
          <Card className="border-2 border-green-200 bg-green-50">
            <CardContent className="text-center py-12">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">🎉 NDA Successfully Signed!</h1>
              <p className="text-xl text-gray-600 mb-6">
                Thank you {user.firstName} for signing the Non-Disclosure Agreement. You've completed all the required
                steps for your influence style assessment.
              </p>
              <div className="bg-white rounded-lg p-6 mb-8 border">
                <h3 className="font-bold text-gray-900 mb-4">What's Next:</h3>
                <div className="text-left space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Assessment completed ✓</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Demo video watched ✓</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Snapshot profile generated ✓</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">NDA signed ✓</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                Your complete {user.primaryInfluenceStyle}
                {user.secondaryInfluenceStyle && ` → ${user.secondaryInfluenceStyle}`} toolkit will be available
                shortly. We'll be in touch with next steps.
              </p>
              <Button
                onClick={handleContinue}
                size="lg"
                className="bg-[#92278F] hover:bg-[#7a1f78] text-white px-8 py-4 text-lg font-semibold"
              >
                Complete Process
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

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
                <p className="text-sm text-gray-600">Non-Disclosure Agreement</p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={() => router.push("/influence-profile")}
              className="text-gray-600 hover:text-[#92278F]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Profile
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#92278F] rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Protect Our Proprietary Methods</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Hi {user.firstName}! Before accessing your complete {user.primaryInfluenceStyle} influence toolkit, please
            review and sign this Non-Disclosure Agreement to protect our proprietary coaching methodologies.
          </p>
        </div>

        {/* NDA Content */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Non-Disclosure Agreement</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <div className="bg-gray-50 p-6 rounded-lg text-sm text-gray-700 max-h-96 overflow-y-auto">
              <h3 className="font-bold text-gray-900 mb-4">THE INFLUENCE ENGINE™ NON-DISCLOSURE AGREEMENT</h3>

              <p className="mb-4">
                This Non-Disclosure Agreement ("Agreement") is entered into between {user.firstName} {user.lastName}{" "}
                ("Recipient") and The Influence Engine™ ("Company") regarding access to proprietary influence coaching
                methodologies, assessments, and related materials.
              </p>

              <h4 className="font-semibold text-gray-900 mb-2">1. CONFIDENTIAL INFORMATION</h4>
              <p className="mb-4">
                "Confidential Information" includes but is not limited to: proprietary coaching methodologies, influence
                style frameworks, assessment algorithms, coaching scripts, training materials, and any other non-public
                information related to The Influence Engine™ system.
              </p>

              <h4 className="font-semibold text-gray-900 mb-2">2. NON-DISCLOSURE OBLIGATIONS</h4>
              <p className="mb-4">Recipient agrees to:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Keep all Confidential Information strictly confidential</li>
                <li>Not disclose, reproduce, or distribute any Confidential Information</li>
                <li>Not reverse engineer or attempt to recreate proprietary methodologies</li>
                <li>Use Confidential Information solely for personal leadership development</li>
              </ul>

              <h4 className="font-semibold text-gray-900 mb-2">3. PERMITTED USE</h4>
              <p className="mb-4">
                Recipient may use the provided materials and methodologies for personal leadership development and may
                discuss general concepts learned through the program, but may not share specific proprietary frameworks,
                assessments, or detailed methodologies.
              </p>

              <h4 className="font-semibold text-gray-900 mb-2">4. TERM</h4>
              <p className="mb-4">
                This Agreement remains in effect for 5 years from the date of signing or until the Confidential
                Information becomes publicly available through no breach of this Agreement.
              </p>

              <h4 className="font-semibold text-gray-900 mb-2">5. REMEDIES</h4>
              <p className="mb-4">
                Recipient acknowledges that breach of this Agreement would cause irreparable harm to Company and agrees
                that Company may seek injunctive relief and monetary damages for any breach.
              </p>

              <h4 className="font-semibold text-gray-900 mb-2">6. GOVERNING LAW</h4>
              <p className="mb-4">
                This Agreement shall be governed by the laws of [State/Country] without regard to conflict of law
                principles.
              </p>

              <p className="text-xs text-gray-500 mt-6">Last updated: {new Date().toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>

        {/* Agreement Section */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="nda-agreement"
                checked={agreed}
                onCheckedChange={(checked) => setAgreed(checked as boolean)}
                className="mt-1"
              />
              <label htmlFor="nda-agreement" className="text-gray-700 leading-relaxed cursor-pointer">
                I, {user.firstName} {user.lastName}, have read, understood, and agree to be bound by the terms of this
                Non-Disclosure Agreement. I understand that I am gaining access to proprietary methodologies and agree
                to keep all Confidential Information strictly confidential.
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Sign Button */}
        <div className="text-center">
          <Button
            onClick={handleSignNDA}
            disabled={!agreed || signing}
            size="lg"
            className="bg-[#92278F] hover:bg-[#7a1f78] text-white px-8 py-4 text-lg font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {signing ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Signing Agreement...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Sign NDA & Complete Process</span>
              </div>
            )}
          </Button>

          {!agreed && (
            <p className="text-sm text-gray-500 mt-4">Please read and agree to the terms above to continue</p>
          )}
        </div>
      </div>
    </div>
  )
}

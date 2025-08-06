"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, ArrowRight, FileText, Shield, CheckCircle, RotateCcw, Pen } from "lucide-react"
import { useRouter } from "next/navigation"

export default function InfluenceNDAPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [agreed, setAgreed] = useState(false)
  const [signing, setSigning] = useState(false)
  const [signed, setSigned] = useState(false)
  const [signatureData, setSignatureData] = useState<string>("")
  const [isDrawing, setIsDrawing] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const router = useRouter()

  useEffect(() => {
    // For demo purposes, create a mock user if none exists
    let currentUser = JSON.parse(localStorage.getItem("current_influence_user") || "null")

    if (!currentUser) {
      currentUser = {
        id: Date.now().toString(),
        firstName: "Demo",
        lastName: "User",
        email: "demo@example.com",
        primaryInfluenceStyle: "Catalyst",
        secondaryInfluenceStyle: "Connector",
        quizCompleted: true,
        demoWatched: true,
        ndaSigned: false,
      }
      localStorage.setItem("current_influence_user", JSON.stringify(currentUser))
    }

    // Check if already signed
    if (currentUser.ndaSigned) {
      setSigned(true)
      if (currentUser.signatureData) {
        setSignatureData(currentUser.signatureData)
      }
    }

    setUser(currentUser)
    setLoading(false)
  }, [router])

  // Signature pad functions
// Add this function to get accurate coordinates
const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
  const canvas = canvasRef.current
  if (!canvas) return { x: 0, y: 0 }

  const rect = canvas.getBoundingClientRect()
  const scaleX = canvas.width / rect.width
  const scaleY = canvas.height / rect.height

  let clientX, clientY
  if ("touches" in e) {
    clientX = e.touches[0].clientX
    clientY = e.touches[0].clientY
  } else {
    clientX = e.clientX
    clientY = e.clientY
  }

  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY
  }
}

const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
  setIsDrawing(true)
  const canvas = canvasRef.current
  if (!canvas) return

  const ctx = canvas.getContext("2d")
  if (!ctx) return

  ctx.strokeStyle = "#000000"
  ctx.lineWidth = 1
  ctx.lineCap = "round"
  ctx.lineJoin = "round"

  const { x, y } = getCanvasCoordinates(e)
  ctx.beginPath()
  ctx.moveTo(x, y)
}

const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
  if (!isDrawing) return

  const canvas = canvasRef.current
  if (!canvas) return

  const ctx = canvas.getContext("2d")
  if (!ctx) return

  if ("touches" in e) {
    e.preventDefault() // Prevent scrolling on touch
  }

  const { x, y } = getCanvasCoordinates(e)
  ctx.lineTo(x, y)
  ctx.stroke()
}

  const stopDrawing = () => {
    if (!isDrawing) return
    setIsDrawing(false)

    const canvas = canvasRef.current
    if (!canvas) return

    // Save signature data
    const dataURL = canvas.toDataURL("image/png")
    setSignatureData(dataURL)
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setSignatureData("")
  }

  const handleSignNDA = async () => {
    if (!agreed || !signatureData) return

    setSigning(true)

    try {
      // Update user data
      const updatedUser = {
        ...user,
        ndaSigned: true,
        signatureData: signatureData,
      }

      console.log("Updating user with NDA signature:", updatedUser)

      const response = await fetch("/api/update-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedUser),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Update user error:", errorData)
        throw new Error(`Failed to update user: ${errorData.error || 'Unknown error'}`)
      }

      const result = await response.json()
      console.log("User updated successfully:", result)

      // Update localStorage
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
      alert("Failed to sign NDA. Please try again.")
    } finally {
      setSigning(false)
    }
  }

  const handleContinue = () => {
    router.push("/purchase-toolkit")
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
                  <p className="text-sm text-gray-600">Agreement Completed</p>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-4">🎉 Agreement Successfully Signed!</h1>
              <p className="text-xl text-gray-600 mb-6">
                Thank you {user.firstName} for signing The Influence Engine™ Use & Confidentiality Agreement. You've
                completed all the required steps for your influence style assessment.
              </p>

              {/* Show signature */}
              {signatureData && (
                <div className="mb-8">
                  <p className="text-sm text-gray-600 mb-2">Your Digital Signature:</p>
                  <div className="inline-block border-2 border-gray-300 rounded-lg p-4 bg-white">
                    <img
                      src={signatureData || "/placeholder.svg"}
                      alt="Digital Signature"
                      className="max-w-xs h-16 object-contain"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Signed on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                  </p>
                </div>
              )}

              <div className="bg-white rounded-lg p-6 mb-8 border">
                <h3 className="font-bold text-gray-900 mb-4">What's Next:</h3>
                <div className="text-left space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Quick assessment completed ✓</span>
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
                    <span className="text-gray-700">Use & Confidentiality Agreement signed ✓</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                Your complete {user.primaryInfluenceStyle}
                {user.secondaryInfluenceStyle && ` + ${user.secondaryInfluenceStyle}`} toolkit will be available
                shortly. We'll be in touch with next steps for accessing The Influence Engine™.
              </p>
              <Button
                onClick={handleContinue}
                size="lg"
                className="bg-[#92278F] hover:bg-[#7a1f78] text-white px-8 py-4 text-lg font-semibold"
              >
                Purchase Full Style Toolkit
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
                <p className="text-sm text-gray-600">Use & Confidentiality Agreement</p>
              </div>
            </div>
            <div className="flex gap-2">
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
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#92278F] rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Use & Confidentiality Agreement</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Hi {user.firstName}! Before accessing your complete {user.primaryInfluenceStyle + (user.secondaryInfluenceStyle ? ` + ${user.secondaryInfluenceStyle}` : '')} influence toolkit, please
            review and sign this Use & Confidentiality Agreement to protect our proprietary AI-powered system.
          </p>
        </div>

        {/* Agreement Content */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>The Influence Engine™ – Use & Confidentiality Agreement</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <div className="bg-gray-50 p-6 rounded-lg text-sm text-gray-700 max-h-96 overflow-y-auto">
              <p className="mb-4 font-medium text-gray-900">
                Thank you for purchasing The Influence Engine™ — a proprietary AI-powered tool designed to elevate how
                you communicate, lead, negotiate, and build trust. This system is built on years of strategy, coaching
                experience, and intellectual property. To protect its integrity — and your experience — the following
                terms apply:
              </p>

              <h4 className="font-semibold text-gray-900 mb-2 mt-6">Private Use Only</h4>
              <p className="mb-4">
                Access is for your personal use only. Please do not share your login credentials, access link, or screen
                content with others. Group coaching, shared sessions, or screen-sharing is not permitted without written
                permission.
              </p>

              <h4 className="font-semibold text-gray-900 mb-2">No Screenshots, Recordings, or Transcripts</h4>
              <p className="mb-4">
                You may not post or share screenshots, video recordings, transcripts, or audio of The Influence
                Engine™'s responses, logic, or interface. This ensures the system cannot be misused, copied, or taken
                out of context.
              </p>

              <h4 className="font-semibold text-gray-900 mb-2">Talk About It — Just Don't Leak It</h4>
              <p className="mb-2">
                We encourage you to share your experience and results — feel free to post reactions, takeaways, or how
                the tool has helped you. But do not share:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Your access link or login credentials</li>
                <li>Full conversations, transcripts, or screenshots</li>
                <li>The system's backend logic or structure</li>
              </ul>
              <p className="mb-4 font-medium">Keep the experience public. Keep the engine protected.</p>

              <h4 className="font-semibold text-gray-900 mb-2">No Reverse Engineering</h4>
              <p className="mb-4">
                You agree not to replicate, reverse-engineer, extract, or mimic the tool's structure, phrasing, logic,
                or decision-making flow in any way.
              </p>

              <h4 className="font-semibold text-gray-900 mb-2">You're Accessing Proprietary IP</h4>
              <p className="mb-4">
                Your purchase grants a 1-year license to use The Influence Engine™. All toolkits, logic, and frameworks
                remain the intellectual property of the creator. Access does not imply ownership or permission to reuse
                elements elsewhere.
              </p>

              <h4 className="font-semibold text-gray-900 mb-2">Respect for Proprietary Use</h4>
              <p className="mb-4">
                You're welcome to be inspired by your experience with The Influence Engine™, but we ask that you refrain
                from directly copying or recreating its unique language, frameworks, or interaction style in other AI or
                coaching tools. We simply ask that you respect the time, originality, and intellectual effort behind
                this product.
              </p>

              <h4 className="font-semibold text-gray-900 mb-2">Access Duration & Future Terms</h4>
              <p className="mb-4">
                Your license is valid for 1 year from your purchase date. After one year, access may be renewed based on
                the terms and pricing available at that time. You will be notified of any changes in advance.
              </p>

              <h4 className="font-semibold text-gray-900 mb-2">Refund Policy</h4>
              <p className="mb-2">
                You may request a full refund within 14 days of purchase, but only if you've actively used the tool —
                including:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Completing the Influence Style Quiz</li>
                <li>Applying the Engine in at least one real conversation</li>
              </ul>
              <p className="mb-4">No refunds will be issued for non-use, curiosity access, or "just looking around."</p>

              <h4 className="font-semibold text-gray-900 mb-2">User Conduct</h4>
              <p className="mb-4">
                You agree not to use the Engine to manipulate, impersonate, or harm others — and not to apply the
                content in unethical, harassing, or illegal ways. This tool is built to support ethical influence,
                leadership, and communication.
              </p>

              <h4 className="font-semibold text-gray-900 mb-2">System Monitoring & Data Use</h4>
              <p className="mb-4">
                We may track general usage patterns to improve performance, identify bugs, and protect system health. No
                personal conversations are reviewed unless submitted for support.
              </p>

              <h4 className="font-semibold text-gray-900 mb-2">Support & Technical Issues</h4>
              <p className="mb-4">
                If you encounter technical problems, please reach out to [support@email.com]. Access time will not be
                paused or extended except in the case of verified, prolonged downtime caused by us.
              </p>

              <h4 className="font-semibold text-gray-900 mb-2">Community Access & Guidelines (Slack + Notion)</h4>
              <p className="mb-2">
                Your license may include access to our private Notion resource hub and Slack community. These spaces are
                designed to support your growth, answer questions, and connect with others. To maintain a respectful
                environment:
              </p>
              <p className="mb-2 font-medium text-green-700">✅ Allowed:</p>
              <ul className="list-disc pl-6 mb-2">
                <li>Asking questions, sharing wins, giving feedback</li>
                <li>Participating in group threads and resource discussions</li>
                <li>Using materials for your own influence journey</li>
              </ul>
              <p className="mb-2 font-medium text-red-700">🚫 Not Allowed:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Sharing login info or reposting content outside the group</li>
                <li>Pitching or DMing members without consent</li>
                <li>Posting aggressive, rude, or off-topic content</li>
                <li>Using the space to criticize or undermine the tool, creator, or other users</li>
              </ul>
              <p className="mb-4">Violation may result in removal from the community without refund.</p>

              <h4 className="font-semibold text-gray-900 mb-2">Non-Transferable Access</h4>
              <p className="mb-4">
                Your access cannot be transferred, loaned, or resold. Each user must purchase their own access to The
                Influence Engine™.
              </p>

              <h4 className="font-semibold text-gray-900 mb-2">Disclaimer</h4>
              <p className="mb-4">
                The Influence Engine™ offers strategic guidance for communication, negotiation, and leadership. It is
                not a substitute for legal, medical, or financial advice. You are responsible for how you apply its
                recommendations.
              </p>

              <p className="text-xs text-gray-500 mt-6">Last updated: {new Date().toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>

        {/* Agreement Section */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3 mb-6">
              <Checkbox
                id="agreement-checkbox"
                checked={agreed}
                onCheckedChange={(checked) => setAgreed(checked as boolean)}
                className="mt-1"
              />
              <label htmlFor="agreement-checkbox" className="text-gray-700 leading-relaxed cursor-pointer">
                I, {user.firstName} {user.lastName}, have read, understood, and agree to be bound by the terms of The
                Influence Engine™ Use & Confidentiality Agreement. I understand that I am gaining access to proprietary
                AI-powered methodologies and agree to keep all confidential information strictly confidential and use
                the system only for my personal development.
              </label>
            </div>

            {/* Digital Signature Section */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center space-x-2 mb-4">
                <Pen className="w-5 h-5 text-[#92278F]" />
                <h3 className="text-lg font-semibold text-gray-900">Digital Signature Required</h3>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Please provide your digital signature below to complete the agreement. You can sign using your mouse or
                finger on touch devices.
              </p>

              {/* Signature Canvas */}
              <div className="relative border-2 border-gray-300 rounded-lg bg-white mb-4">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={200}
                  className="w-full h-48 cursor-crosshair touch-none"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
                {!signatureData && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <p className="text-gray-400 text-lg">Sign here</p>
                  </div>
                )}
              </div>

              {/* Signature Controls */}
              <div className="flex justify-between items-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={clearSignature}
                  className="flex items-center space-x-2 bg-transparent"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Clear Signature</span>
                </Button>

                {signatureData && (
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Signature captured</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sign Button */}
        <div className="text-center">
          <Button
            onClick={handleSignNDA}
            disabled={!agreed || !signatureData || signing}
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
                <span>Complete Agreement Signing</span>
              </div>
            )}
          </Button>

          {(!agreed || !signatureData) && (
            <p className="text-sm text-gray-500 mt-4">
              {!agreed && !signatureData && "Please read and agree to the terms, then provide your signature"}
              {agreed && !signatureData && "Please provide your digital signature above"}
              {!agreed && signatureData && "Please check the agreement checkbox above"}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

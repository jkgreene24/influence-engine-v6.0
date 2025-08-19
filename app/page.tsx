"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Mail, Phone, User, CheckCircle, Star, Zap, Users, Target, Navigation, Anchor, Link } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { INITIAL_FUNNEL_STATE, saveFunnelState, type SourceTracking } from "@/lib/utils/funnel-state"
import { automationHelpers } from "@/lib/utils/mock-automation"

export default function ContactPage() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [company, setCompany] = useState("")
  const [role, setRole] = useState("")
  const [source, setSource] = useState("")
  const [reiaName, setReiaName] = useState("")
  const [socialPlatform, setSocialPlatform] = useState("")
  const [referrerName, setReferrerName] = useState("")
  const [wordOfMouth, setWordOfMouth] = useState("")
  const [otherSource, setOtherSource] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Initialize funnel state and capture URL parameters
  useEffect(() => {
    const funnelState = { ...INITIAL_FUNNEL_STATE }
    
    // Capture UTM parameters
    const utmSource = searchParams.get('utm_source')
    const utmMedium = searchParams.get('utm_medium')
    const utmCampaign = searchParams.get('utm_campaign')
    const src = searchParams.get('src')
    
    // Set source tracking
    const sourceTracking: SourceTracking = {
      utmSource: utmSource || undefined,
      utmMedium: utmMedium || undefined,
      utmCampaign: utmCampaign || undefined,
      srcBook: src === 'book',
    }
    
    funnelState.sourceTracking = sourceTracking
    saveFunnelState(funnelState)
  }, [searchParams])

  const formatPhoneNumber = (value: string) => {
    const phoneNumber = value.replace(/\D/g, "")
    if (phoneNumber.length >= 6) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`
    } else if (phoneNumber.length >= 3) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`
    } else {
      return phoneNumber
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setPhone(formatted)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validation
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim() || !source) {
      setError("Please fill in all required fields")
      setLoading(false)
      return
    }

    // Validate conditional required fields
    if (source === 'REIA Event' && !reiaName.trim()) {
      setError("Please enter the REIA name")
      setLoading(false)
      return
    }

    if (source === 'Social Media' && !socialPlatform) {
      setError("Please select a social media platform")
      setLoading(false)
      return
    }

    if (source === 'Referral' && !referrerName.trim()) {
      setError("Please enter the referrer name")
      setLoading(false)
      return
    }

    const phoneDigits = phone.replace(/\D/g, "")
    if (phoneDigits.length !== 10) {
      setError("Please enter a valid 10-digit phone number")
      setLoading(false)
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address")
      setLoading(false)
      return
    }

    try {
      // Update funnel state with user data and source tracking
      const funnelState = { ...INITIAL_FUNNEL_STATE }
      funnelState.userData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phoneDigits,
        company: company.trim(),
        role: role.trim(),
      }
      
      // Add source tracking data
      funnelState.sourceTracking = {
        ...funnelState.sourceTracking,
        source,
        reiaName: source === 'REIA Event' ? reiaName : undefined,
        socialPlatform: source === 'Social Media' ? socialPlatform : undefined,
        referrerName: source === 'Referral' ? referrerName : undefined,
        wordOfMouth: source === 'Word of Mouth' ? wordOfMouth : undefined,
        otherSource: source === 'Other' ? otherSource : undefined,
      }
      
      saveFunnelState(funnelState)

             // Save user data
       const userData = {
         firstName: firstName.trim(),
         lastName: lastName.trim(),
         email: email.trim(),
         phone: phoneDigits,
         company: company.trim(),
         role: role.trim(),
         createdAt: new Date().toISOString(),
         emailVerified: false,
         quizCompleted: false,
         demoWatched: false,
         ndaSigned: false,
         // Source tracking data as single object
         sourceTracking: {
           source: funnelState.sourceTracking.source,
           reiaName: funnelState.sourceTracking.reiaName,
           socialPlatform: funnelState.sourceTracking.socialPlatform,
           referrerName: funnelState.sourceTracking.referrerName,
           wordOfMouth: funnelState.sourceTracking.wordOfMouth,
           otherSource: funnelState.sourceTracking.otherSource,
           utmSource: funnelState.sourceTracking.utmSource,
           utmMedium: funnelState.sourceTracking.utmMedium,
           utmCampaign: funnelState.sourceTracking.utmCampaign,
           srcBook: funnelState.sourceTracking.srcBook,
         },
       }

      console.log("Inserting new user:", userData)
      const insertResponse = await fetch("/api/insert-user", {
        method: "POST",
        body: JSON.stringify(userData),
      })
      
      if (insertResponse.ok) {
        const result = await insertResponse.json()
        console.log("User inserted successfully:", result)
        
        // Get the Supabase-generated ID
        const newUserWithId = {
          ...userData,
          id: result.data?.id || Date.now().toString()
        }
        
        // Store only the current user in localStorage
        localStorage.setItem("current_influence_user", JSON.stringify(newUserWithId))
      } else {
        console.error("Failed to insert user")
        throw new Error("Failed to insert user")
      }

      // Tag lead source in automation
      try {
        await automationHelpers.tagLeadSource(email.trim(), funnelState.sourceTracking)
      } catch (error) {
        console.error('Failed to tag lead source:', error)
      }

      // Go to quick-quiz
      router.push("/quick-quiz")
    } catch (err) {
      console.error("Submission error:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
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
                <p className="text-sm text-gray-600">AI-Powered Leadership Coaching</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#92278F] to-[#a83399] text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-6 leading-tight">
            Discover Your Unique
            <br />
            <span className="text-purple-200">Influence Style</span>
          </h1>
          <p className="text-xl mb-8 text-purple-100 max-w-2xl mx-auto">
            Get personalized insights into how you naturally influence others and unlock your leadership potential with
            AI-powered coaching tailored to your style.
          </p>
          <div className="flex justify-center space-x-8 mb-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <User className="w-6 h-6" />
              </div>
              <p className="text-sm">5-Min Assessment</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <Star className="w-6 h-6" />
              </div>
              <p className="text-sm">Personalized Results</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <Zap className="w-6 h-6" />
              </div>
              <p className="text-sm">AI-Powered Coaching</p>
            </div>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Start Your Leadership Journey</h2>
            <p className="text-xl text-gray-600">
              Enter your information below to begin your personalized influence style assessment.
            </p>
          </div>

          <Card className="border-2 border-gray-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-center text-2xl font-semibold text-gray-900">
                Get Your Influence Style Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        id="firstName"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First name"
                        className="pl-10 h-12 border-gray-300 focus:border-[#92278F] focus:ring-[#92278F]"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        id="lastName"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Last name"
                        className="pl-10 h-12 border-gray-300 focus:border-[#92278F] focus:ring-[#92278F]"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@company.com"
                      className="pl-10 h-12 border-gray-300 focus:border-[#92278F] focus:ring-[#92278F]"
                      required
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={handlePhoneChange}
                      placeholder="(555) 123-4567"
                      className="pl-10 h-12 border-gray-300 focus:border-[#92278F] focus:ring-[#92278F]"
                      maxLength={14}
                      required
                    />
                  </div>
                </div>

                {/* Company */}
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                    Company/Organization
                  </label>
                  <Input
                    id="company"
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Your company name"
                    className="h-12 border-gray-300 focus:border-[#92278F] focus:ring-[#92278F]"
                  />
                </div>

                {/* Role */}
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Role/Title
                  </label>
                  <Input
                    id="role"
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g., Team Lead, Manager, Director"
                    className="h-12 border-gray-300 focus:border-[#92278F] focus:ring-[#92278F]"
                  />
                </div>

                {/* Source Tracking */}
                <div>
                  <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-2">
                    How did you hear about us? <span className="text-red-500">*</span>
                  </label>
                  <Select value={source} onValueChange={setSource} required>
                    <SelectTrigger className="h-12 border-gray-300 focus:border-[#92278F] focus:ring-[#92278F]">
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="REIA Event">REIA Event</SelectItem>
                      <SelectItem value="Social Media">Social Media</SelectItem>
                      <SelectItem value="Referral">Referral</SelectItem>
                      <SelectItem value="Word of Mouth">Word of Mouth</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Conditional source fields */}
                {source === 'REIA Event' && (
                  <div>
                    <label htmlFor="reiaName" className="block text-sm font-medium text-gray-700 mb-2">
                      REIA Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="reiaName"
                      type="text"
                      value={reiaName}
                      onChange={(e) => setReiaName(e.target.value)}
                      placeholder="Enter REIA name"
                      className="h-12 border-gray-300 focus:border-[#92278F] focus:ring-[#92278F]"
                      required
                    />
                  </div>
                )}

                {source === 'Social Media' && (
                  <div>
                    <label htmlFor="socialPlatform" className="block text-sm font-medium text-gray-700 mb-2">
                      Platform <span className="text-red-500">*</span>
                    </label>
                    <Select value={socialPlatform} onValueChange={setSocialPlatform} required>
                      <SelectTrigger className="h-12 border-gray-300 focus:border-[#92278F] focus:ring-[#92278F]">
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Facebook">Facebook</SelectItem>
                        <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                        <SelectItem value="Instagram">Instagram</SelectItem>
                        <SelectItem value="TikTok">TikTok</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {source === 'Referral' && (
                  <div>
                    <label htmlFor="referrerName" className="block text-sm font-medium text-gray-700 mb-2">
                      Referrer Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="referrerName"
                      type="text"
                      value={referrerName}
                      onChange={(e) => setReferrerName(e.target.value)}
                      placeholder="Who referred you?"
                      className="h-12 border-gray-300 focus:border-[#92278F] focus:ring-[#92278F]"
                      required
                    />
                  </div>
                )}

                {source === 'Word of Mouth' && (
                  <div>
                    <label htmlFor="wordOfMouth" className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Details (Optional)
                    </label>
                    <Input
                      id="wordOfMouth"
                      type="text"
                      value={wordOfMouth}
                      onChange={(e) => setWordOfMouth(e.target.value)}
                      placeholder="How did you hear about us?"
                      className="h-12 border-gray-300 focus:border-[#92278F] focus:ring-[#92278F]"
                    />
                  </div>
                )}

                {source === 'Other' && (
                  <div>
                    <label htmlFor="otherSource" className="block text-sm font-medium text-gray-700 mb-2">
                      Please Specify (Optional)
                    </label>
                    <Input
                      id="otherSource"
                      type="text"
                      value={otherSource}
                      onChange={(e) => setOtherSource(e.target.value)}
                      placeholder="How did you hear about us?"
                      className="h-12 border-gray-300 focus:border-[#92278F] focus:ring-[#92278F]"
                    />
                  </div>
                )}

                {/* Privacy Notice */}
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <p className="text-sm text-gray-600">
                    <strong>Privacy Notice:</strong> Your information will be used solely for providing your
                    personalized influence assessment and coaching recommendations. We will send you a verification
                    email to confirm your address before proceeding.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#92278F] hover:bg-[#7a1f78] text-white h-12 font-semibold text-lg"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <span>Start My Assessment</span>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Influence Styles Preview */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">The 5 Influence Styles</h2>
            <p className="text-xl text-gray-600">
              Discover which of these natural influence patterns best describes how you lead and communicate.
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-6">
            {[
              {
                name: "Catalyst",
                icon: <Zap className="w-8 h-8" />,
                color: "bg-orange-500",
                description: "Drives action and creates momentum through energy and urgency",
              },
              {
                name: "Navigator",
                icon: <Navigation className="w-8 h-8" />,
                color: "bg-blue-500",
                description: "Guides with strategic vision and long-term thinking",
              },
              {
                name: "Diplomat",
                icon: <Users className="w-8 h-8" />,
                color: "bg-pink-500",
                description: "Builds trust through empathy and emotional intelligence",
              },
              {
                name: "Anchor",
                icon: <Anchor className="w-8 h-8" />,
                color: "bg-green-500",
                description: "Provides stability and reliable structure in chaos",
              },
              {
                name: "Connector",
                icon: <Link className="w-8 h-8" />,
                color: "bg-purple-500",
                description: "Unifies people and creates alignment across differences",
              },
            ].map((style, index) => (
              <Card
                key={index}
                className="text-center border-2 border-gray-100 hover:border-[#92278F]/20 transition-colors"
              >
                <CardContent className="p-6">
                  <div
                    className={`w-16 h-16 ${style.color} rounded-full flex items-center justify-center mx-auto mb-4 text-white`}
                  >
                    {style.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{style.name}</h3>
                  <p className="text-sm text-gray-600">{style.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-full" />
            <span className="text-lg font-bold">The Influence Engine™</span>
          </div>
          <p className="text-gray-400">AI-powered leadership coaching that adapts to your unique influence style.</p>
          <p className="text-gray-500 text-sm mt-4">&copy; 2025 The Influence Engine™. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

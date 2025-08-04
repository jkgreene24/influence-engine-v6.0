"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Mail, Phone, User, CheckCircle, Star, Zap, Users, Target, Navigation, Anchor, Link } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ContactPage() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [company, setCompany] = useState("")
  const [role, setRole] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

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
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim()) {
      setError("Please fill in all required fields")
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
      // Simulate API call - check for existing users
      const response = await fetch("/api/get-users")
      const data = await response.json()

      localStorage.setItem("influence_users", JSON.stringify(data))
      const existingUsers = data
      console.log(existingUsers)

      const existingEmail = existingUsers.find((user: any) => user.email.toLowerCase() === email.toLowerCase())
      if (existingEmail) {
        setError("This email address has already been used. Please use a different email.")
        setLoading(false)
        return
      }

      const existingPhone = existingUsers.find((user: any) => user.phone === phoneDigits)
      if (existingPhone) {
        setError("This phone number has already been used. Please use a different phone number.")
        setLoading(false)
        return
      }

      // Save user data
      const userData = {
        id: Date.now().toString(),
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
        profileGenerated: false,
        ndaSigned: false,
      }

      existingUsers.push(userData)
      console.log(userData)
      const insertResponse = await fetch("/api/insert-user", {
        method: "POST",
        body: JSON.stringify(userData),
      })
      console.log(insertResponse)
      if (insertResponse.ok) {
        console.log("User inserted successfully")
        localStorage.setItem("influence_users", JSON.stringify(existingUsers))
      }
      localStorage.setItem("current_influence_user", JSON.stringify(userData))

      setSuccess(true)
    } catch (err) {
      console.error("Submission error:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleContinue = () => {
    router.push("/quick-quiz")
  }

  if (success) {
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

        <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <Card className="border-2 border-green-200 bg-green-50">
              <CardContent className="text-center py-8">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank you for your interest!</h2>
                <p className="text-gray-600 mb-6">
                  We've received your information. Please check your email at <strong>{email}</strong> for a
                  verification link to continue with your influence style assessment.
                </p>
                <div className="mb-6 p-4 bg-white rounded-lg border">
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Next Steps:</strong>
                  </p>
                  <ol className="text-sm text-gray-600 text-left space-y-1">
                    <li>1. Verify your email address</li>
                    <li>2. Complete your influence style quiz</li>
                    <li>3. Watch our exclusive demo video</li>
                    <li>4. Get your personalized snapshot profile</li>
                  </ol>
                </div>
                <Button onClick={handleContinue} className="bg-[#92278F] hover:bg-[#7a1f78] w-full">
                  Continue to Quiz
                </Button>
              </CardContent>
            </Card>
          </div>
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
          <p className="text-gray-500 text-sm mt-4">&copy; 2024 The Influence Engine™. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

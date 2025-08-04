"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, Play, CheckCircle, Clock, Zap, Users, Target, Navigation, Anchor, Link, Pause } from "lucide-react"
import { useRouter } from "next/navigation"

export default function InfluenceDemoPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [videoWatched, setVideoWatched] = useState(false)
  const [watchTime, setWatchTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [videoDuration, setVideoDuration] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const router = useRouter()

  // Demo video URL - replace with your actual video URL
  const videoUrl = process.env.NEXT_PUBLIC_DEMO_VIDEO_URL || ""

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("current_influence_user") || "null")
    if (!currentUser) {
      router.push("/")
      return
    }

    if (!currentUser.quizCompleted) {
      router.push("/quick-quiz")
      return
    }

    // Check if user has already watched the demo
    if (currentUser.demoWatched) {
      setVideoWatched(true)
    }

    setUser(currentUser)
    setLoading(false)
  }, [router])

  // Test video URL accessibility
  useEffect(() => {
    console.log("Testing video URL:", videoUrl)
    fetch(videoUrl, { method: 'HEAD' })
      .then(response => {
        console.log("Video URL status:", response.status, response.ok)
      })
      .catch(error => {
        console.error("Video URL error:", error)
      })
  }, [videoUrl])

  const handleVideoEnd = async () => {
    console.log("handleVideoEnd called - setting videoWatched to true")
    setVideoWatched(true)

    // Update user data
    const updatedUser = {
      ...user,
      demoWatched: true,
    }

    console.log("Updated user data:", updatedUser)
    localStorage.setItem("current_influence_user", JSON.stringify(updatedUser))

    // Update users array
    const users = JSON.parse(localStorage.getItem("influence_users") || "[]")
    const userIndex = users.findIndex((u: any) => u.id === user.id)
    if (userIndex !== -1) {
      users[userIndex] = updatedUser
      localStorage.setItem("influence_users", JSON.stringify(users))
      console.log("Updated users array with demoWatched status")
    }

    setUser(updatedUser)
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      if (video.duration) {
        const progress = (video.currentTime / video.duration) * 100
        setWatchTime(Math.round(progress))
        
        // Check if video is near the end (within 1 second)
        if (video.currentTime >= video.duration - 1) {
          console.log("Video near end - marking as watched")
          handleVideoEnd()
        }
      }
    }

    const handleLoadedMetadata = () => {
      console.log("Video metadata loaded - duration:", video.duration)
      setVideoDuration(video.duration)
    }

    const handleEnded = () => {
      console.log("Video ended event fired - marking as watched")
      setIsPlaying(false)
      handleVideoEnd()
    }

    const handleError = (e: Event) => {
      console.error("Video error:", e)
    }

    const handleCanPlay = () => {
      console.log("Video can play")
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('ended', handleEnded)
    video.addEventListener('error', handleError)
    video.addEventListener('canplay', handleCanPlay)

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('ended', handleEnded)
      video.removeEventListener('error', handleError)
      video.removeEventListener('canplay', handleCanPlay)
    }
  }, [])

  const togglePlayPause = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
      setIsPlaying(false)
    } else {
      video.play()
      setIsPlaying(true)
    }
  }

  const getStyleIcon = (style: string) => {
    switch (style?.toLowerCase()) {
      case "catalyst":
        return <Zap className="w-6 h-6" />
      case "diplomat":
        return <Users className="w-6 h-6" />
      case "anchor":
        return <Anchor className="w-6 h-6" />
      case "navigator":
        return <Navigation className="w-6 h-6" />
      case "connector":
        return <Link className="w-6 h-6" />
      default:
        return <Users className="w-6 h-6" />
    }
  }

  const getStyleColor = (style: string) => {
    switch (style?.toLowerCase()) {
      case "catalyst":
        return "bg-orange-500"
      case "diplomat":
        return "bg-pink-500"
      case "anchor":
        return "bg-green-500"
      case "navigator":
        return "bg-blue-500"
      case "connector":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  const simulateVideoWatch = () => {
    // Simulate watching the video for demo purposes
    setWatchTime(100)
    setVideoWatched(true)
    handleVideoEnd()
  }

  const handleContinue = () => {
    router.push("/influence-profile")
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#92278F]"></div>
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
                <p className="text-sm text-gray-600">Demo Video</p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={() => router.push("/quick-quiz")}
              className="text-gray-600 hover:text-[#92278F]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Quiz
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">See The Influence Engine™ in Action</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
            Hi {user.firstName}! Watch this 5-minute demo to see how personalized AI coaching can transform your
            leadership approach.
          </p>

          {/* User's Style Display */}
          {user.primaryInfluenceStyle && (
            <div className="flex justify-center items-center space-x-4 mb-8">
              <div
                className={`w-16 h-16 ${getStyleColor(user.primaryInfluenceStyle)} rounded-full flex items-center justify-center text-white`}
              >
                {getStyleIcon(user.primaryInfluenceStyle)}
              </div>
              {user.secondaryInfluenceStyle && (
                <>
                  <div className="text-2xl font-bold text-[#92278F]">+</div>
                  <div
                    className={`w-16 h-16 ${getStyleColor(user.secondaryInfluenceStyle)} rounded-full flex items-center justify-center text-white`}
                  >
                    {getStyleIcon(user.secondaryInfluenceStyle)}
                  </div>
                </>
              )}
            </div>
          )}

          <div className="bg-[#92278F]/10 rounded-lg p-4 mb-8">
            <p className="text-[#92278F] font-semibold">
              Your Style: {user.primaryInfluenceStyle}
              {user.secondaryInfluenceStyle && ` + ${user.secondaryInfluenceStyle}`}
            </p>
          </div>
        </div>

        {/* Video Section */}
        <Card className="mb-8">
          <CardContent className="p-0">
            <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ aspectRatio: "16/9" }}>
              {/* Actual Video Player */}
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                controls={false}
                preload="metadata"
                onLoadStart={() => console.log("Video load started")}
                onLoadedData={() => console.log("Video data loaded")}
                onCanPlay={() => console.log("Video can play")}
                onPlay={() => console.log("Video started playing")}
                onPause={() => console.log("Video paused")}
                onEnded={() =>{ console.log("Video ended"), handleVideoEnd()}}
                onError={(e) => console.error("Video error:", e)}
              >
                <source src={videoUrl} type="video/mp4" />
                <source src={videoUrl} type="video/webm" />
                <source src={videoUrl} type="video/ogg" />
                Your browser does not support the video tag.
              </video>

              {/* Custom Video Controls Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                {!isPlaying && (
                  <div className="text-center">
                    <Button 
                      onClick={togglePlayPause}
                      size="lg"
                      className="bg-[#92278F] hover:bg-[#7a1f78] text-white px-8 py-4 rounded-full shadow-lg mb-4"
                    >
                      <Play className="w-8 h-8 mr-2" />
                      Play Demo Video
                    </Button>
                    
                    {/* Debug button for testing */}
                    <div className="mt-2">
                      <Button 
                        onClick={simulateVideoWatch}
                        size="sm"
                        variant="outline"
                        className="text-white border-white hover:bg-white/20"
                      >
                        Test: Mark as Watched
                      </Button>
                      
                      {/* Test video play */}
                      <Button 
                        onClick={() => {
                          const video = videoRef.current
                          if (video) {
                            console.log("Manual play attempt")
                            video.play().then(() => {
                              console.log("Video play successful")
                              setIsPlaying(true)
                            }).catch(error => {
                              console.error("Video play failed:", error)
                            })
                          }
                        }}
                        size="sm"
                        variant="outline"
                        className="text-white border-white hover:bg-white/20 ml-2"
                      >
                        Test: Play Video
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Video Progress Bar */}
              {isPlaying && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-4">
                  <div className="flex items-center space-x-3 text-white text-sm">
                    <Button
                      onClick={togglePlayPause}
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <div className="flex-1 bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-[#92278F] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${watchTime}%` }}
                      ></div>
                    </div>
                    <span>{watchTime}%</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* What You'll Learn */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">
              What You'll Learn About {user.primaryInfluenceStyle} Leadership
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Personalized AI Coaching</h4>
                    <p className="text-gray-600 text-sm">How AI adapts to your {user.primaryInfluenceStyle} style</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Real-World Scenarios</h4>
                    <p className="text-gray-600 text-sm">Practice leadership challenges specific to your style</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Instant Feedback</h4>
                    <p className="text-gray-600 text-sm">
                      Get guidance tailored to your natural communication approach
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Style-Specific Strategies</h4>
                    <p className="text-gray-600 text-sm">
                      Learn techniques that work with your {user.primaryInfluenceStyle} approach
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Measurable Results</h4>
                    <p className="text-gray-600 text-sm">Track your leadership impact and growth over time</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Advanced Techniques</h4>
                    <p className="text-gray-600 text-sm">Master advanced influence strategies for your style</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        {videoWatched ? (
          <Card className="border-2 border-green-200 bg-green-50">
            <CardContent className="text-center py-8">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Excellent! You've watched the demo</h2>
              <p className="text-gray-600 mb-6">
                Now let's show you your personalized {user.primaryInfluenceStyle} influence style snapshot based on your
                assessment results.
              </p>
              <Button
                onClick={handleContinue}
                size="lg"
                className="bg-[#92278F] hover:bg-[#7a1f78] text-white px-8 py-4"
              >
                View Your Snapshot Profile
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-2 border-[#92278F]/20 bg-[#92278F]/5">
            <CardContent className="text-center py-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready to see your personalized results?</h2>
              <p className="text-gray-600 mb-6">
                Watch the demo video above to unlock your {user.primaryInfluenceStyle} influence style snapshot.
              </p>
              <Button disabled size="lg" className="bg-gray-400 text-white px-8 py-4 cursor-not-allowed">
                Watch Demo First
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

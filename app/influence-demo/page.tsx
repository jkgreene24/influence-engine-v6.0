"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, Play, CheckCircle, Zap, Users, Navigation, Anchor, Link, Pause } from "lucide-react"
import CustomVideoPlayer from "./components/CustomVideoPlayer"
import { useRouter } from "next/navigation"

export default function InfluenceDemoPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [videoWatched, setVideoWatched] = useState(false)
  const [watchTime, setWatchTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [wasPlayingBeforeDrag, setWasPlayingBeforeDrag] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Demo video URL - replace with your actual video URL
  // Using a known-good fallback MP4 URL for reliability
  const videoUrl = process.env.NEXT_PUBLIC_DEMO_VIDEO_URL || "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"

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
    console.log("Current duration:", duration)
    console.log("Current watchTime:", watchTime)
    console.log("Current isPlaying:", isPlaying)
    
    fetch(videoUrl, { method: 'HEAD' })
      .then(response => {
        console.log("Video URL status:", response.status, response.ok)
      })
      .catch(error => {
        console.error("Video URL error:", error)
      })
  }, [videoUrl, duration, watchTime, isPlaying])

  const handleVideoEnd = async () => {
    console.log("handleVideoEnd called - setting videoWatched to true")
    setVideoWatched(true)
    setIsPlaying(false)
    
    // Reset video to beginning
    if (videoRef.current) {
      videoRef.current.currentTime = 0
      setCurrentTime(0)
      setWatchTime(0)
    }

    // Update user data
    const updatedUser = {
      ...user,
      demoWatched: true,
    }

    console.log("Updated user data:", updatedUser)
    localStorage.setItem("current_influence_user", JSON.stringify(updatedUser))

    // Update database with demo watched status
    try {
      const response = await fetch("/api/update-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: updatedUser.id,
          demoWatched: true,
        })
      })

      if (response.ok) {
        console.log("Demo watched status updated in database successfully")
      } else {
        console.error("Failed to update demo watched status in database")
      }
    } catch (error) {
      console.error("Error updating demo watched status in database:", error)
    }

    console.log("Demo watched status saved successfully")
    setUser(updatedUser)
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      if (video.duration && !isDragging) {
        const progress = (video.currentTime / video.duration) * 100
        setWatchTime(Math.round(progress))
        setCurrentTime(video.currentTime)
        
        // Check if video is near the end (within 1 second)
        if (video.currentTime >= video.duration - 1) {
          console.log("Video near end - marking as watched")
          handleVideoEnd()
        }
      }
    }

    const handleLoadedMetadata = () => {
      console.log("Video metadata loaded - duration:", video.duration)
      setDuration(video.duration)
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

    const handlePlay = () => {
      setIsPlaying(true)
    }

    const handlePause = () => {
      setIsPlaying(false)
    }

    const handleSeeking = () => {
      console.log("Video seeking event fired")
    }

    const handleSeeked = () => {
      console.log("Video seeked event fired, currentTime:", video.currentTime)
      setCurrentTime(video.currentTime)
      const progress = (video.currentTime / video.duration) * 100
      setWatchTime(Math.round(progress))
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('ended', handleEnded)
    video.addEventListener('error', handleError)
    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('seeking', handleSeeking)
    video.addEventListener('seeked', handleSeeked)

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('ended', handleEnded)
      video.removeEventListener('error', handleError)
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('seeking', handleSeeking)
      video.removeEventListener('seeked', handleSeeked)
    }
  }, [isDragging])

  // Global mouse event listeners for dragging
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      
      const video = videoRef.current
      const progressBar = progressRef.current
      if (!video || !progressBar || !duration) return
      // Allow seeking regardless of readyState when duration exists

      const rect = progressBar.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const progressWidth = rect.width
      const clickPercent = Math.max(0, Math.min(1, mouseX / progressWidth))
      const newTime = clickPercent * duration

      video.currentTime = newTime
      setCurrentTime(newTime)
      const progress = (newTime / duration) * 100
      setWatchTime(Math.round(progress))
    }

    const handleGlobalMouseUp = () => {
      setIsDragging(false)
      // Resume playback if it was playing before dragging
      const video = videoRef.current
      if (video && wasPlayingBeforeDrag) {
        video.play().catch(() => {})
      }
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove)
      document.addEventListener('mouseup', handleGlobalMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [isDragging, duration])

  const togglePlayPause = async () => {
    const video = videoRef.current
    if (!video) return

    try {
      if (isPlaying) {
        video.pause()
      } else {
        await video.play()
      }
    } catch (error) {
      console.error("Error toggling video play/pause:", error)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const video = videoRef.current
    const progressBar = progressRef.current
    if (!video || !progressBar || !duration) {
      console.log("Cannot seek: video=", !!video, "progressBar=", !!progressBar, "duration=", duration)
      return
    }

    const rect = progressBar.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const progressWidth = rect.width
    const clickPercent = Math.max(0, Math.min(1, clickX / progressWidth))
    const newTime = clickPercent * duration

    console.log("Seeking to:", newTime, "seconds (", clickPercent * 100, "% of", duration, "seconds)")

    // Set the video time
    video.currentTime = newTime
    
    // Update state immediately
    setCurrentTime(newTime)
    const progress = (newTime / duration) * 100
    setWatchTime(Math.round(progress))
    
    // Force a small delay to ensure the seeking takes effect
    setTimeout(() => {
      console.log("Video currentTime after seeking:", video.currentTime)
    }, 100)
  }

  const handleProgressMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
    // Immediately seek to the clicked position
    handleProgressClick(e)
  }

  const handleProgressMouseUp = () => {
    setIsDragging(false)
  }

  const handleProgressMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isDragging) return
    
    const video = videoRef.current
    const progressBar = progressRef.current
    if (!video || !progressBar || !duration) return

    const rect = progressBar.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const progressWidth = rect.width
    const clickPercent = Math.max(0, Math.min(1, mouseX / progressWidth))
    const newTime = clickPercent * duration

    video.currentTime = newTime
    setCurrentTime(newTime)
    const progress = (newTime / duration) * 100
    setWatchTime(Math.round(progress))
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

  const handleContinue = () => {
    router.push("/influence-profile")
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
            Hi {user.firstName}! Watch this demo to see how personalized AI coaching can transform your
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
            <CustomVideoPlayer
              videoUrl={videoUrl}
              title="Demo Video"
              onEnded={handleVideoEnd}
            />
          </CardContent>
        </Card>

        {/* What You'll Learn */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">
              What You'll Learn About Leadership
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Personalized AI Coaching</h4>
                    <p className="text-gray-600 text-sm">How AI adapts to your influence style</p>
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
                      Learn techniques that work with your influence style
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
                Now let's show you your personalized influence style snapshot based on your
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
                Watch the demo video above to unlock your influence style snapshot.
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

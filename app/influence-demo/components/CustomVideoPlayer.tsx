"use client"

import React, { useEffect, useRef, useState } from "react"
import { Play, Pause } from "lucide-react"

type CustomVideoPlayerProps = {
  videoUrl: string
  title?: string
  onEnded?: () => void
}

export default function CustomVideoPlayer({ videoUrl, title, onEnded }: CustomVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [wasPlayingBeforeDrag, setWasPlayingBeforeDrag] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      if (!isDragging) setCurrentTime(video.currentTime)
    }

    const handleLoadedMetadata = () => {
      setDuration(video.duration || 0)
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleEnded = () => {
      setIsPlaying(false)
      // Reset to start
      video.currentTime = 0
      setCurrentTime(0)
      onEnded?.()
    }

    video.addEventListener("timeupdate", handleTimeUpdate)
    video.addEventListener("loadedmetadata", handleLoadedMetadata)
    video.addEventListener("play", handlePlay)
    video.addEventListener("pause", handlePause)
    video.addEventListener("ended", handleEnded)

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate)
      video.removeEventListener("loadedmetadata", handleLoadedMetadata)
      video.removeEventListener("play", handlePlay)
      video.removeEventListener("pause", handlePause)
      video.removeEventListener("ended", handleEnded)
    }
  }, [isDragging, onEnded])

  // Global dragging handlers
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!isDragging) return
      const video = videoRef.current
      const bar = progressRef.current
      if (!video || !bar || !duration) return

      const rect = bar.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const pct = Math.max(0, Math.min(1, mouseX / rect.width))
      const newTime = pct * duration
      video.currentTime = newTime
      setCurrentTime(newTime)
    }

    const handleUp = () => {
      if (!isDragging) return
      setIsDragging(false)
      const video = videoRef.current
      if (video && wasPlayingBeforeDrag) {
        video.play().catch(() => {})
      }
    }

    if (isDragging) {
      document.addEventListener("mousemove", handleMove)
      document.addEventListener("mouseup", handleUp)
    }
    return () => {
      document.removeEventListener("mousemove", handleMove)
      document.removeEventListener("mouseup", handleUp)
    }
  }, [isDragging, duration, wasPlayingBeforeDrag])

  const togglePlayPause = async () => {
    const video = videoRef.current
    if (!video) return
    try {
      if (video.paused) {
        await video.play()
      } else {
        video.pause()
      }
    } catch (e) {
      // no-op
    }
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const video = videoRef.current
    const bar = progressRef.current
    if (!video || !bar || !duration) return
    const rect = bar.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const pct = Math.max(0, Math.min(1, clickX / rect.width))
    const newTime = pct * duration
    video.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleProgressMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const video = videoRef.current
    if (video) {
      setWasPlayingBeforeDrag(!video.paused)
      if (!video.paused) video.pause()
    }
    setIsDragging(true)
    handleProgressClick(e)
  }

  const formatTime = (t: number) => {
    const m = Math.floor(t / 60)
    const s = Math.floor(t % 60)
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  const progressPct = duration ? (currentTime / duration) * 100 : 0

  return (
    <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ aspectRatio: "16/9" }}>
      <video
        ref={videoRef}
        className="w-full h-full object-cover cursor-pointer"
        controls={false}
        preload="metadata"
        playsInline
        onClick={togglePlayPause}
      >
        <source src={videoUrl} type="video/mp4" />
        <source src={videoUrl} type="video/webm" />
        <source src={videoUrl} type="video/ogg" />
        Your browser does not support the video tag.
      </video>

      {/* Center Overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {(!isPlaying && currentTime === 0) && (
          <div className="text-center pointer-events-auto">
            <button
              onClick={togglePlayPause}
              className="bg-[#92278F] hover:bg-[#7a1f78] text-white px-8 py-4 rounded-full shadow-lg mb-4 flex items-center"
            >
              <Play className="w-8 h-8 mr-2" />
              Play Demo Video
            </button>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-4 z-10 pointer-events-auto">
        <div className="flex items-center space-x-3 text-white text-sm">
          <button
            onClick={togglePlayPause}
            className="text-white hover:bg-white/20 rounded p-1"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          <div className="flex-1 flex items-center space-x-2 select-none">
            <span className="text-xs w-10 text-right">{formatTime(currentTime)}</span>
            <div
              ref={progressRef}
              className="flex-1 bg-gray-600 rounded-full h-2 cursor-pointer relative hover:bg-gray-500 transition-colors"
              onMouseDown={handleProgressMouseDown}
              onClick={handleProgressClick}
            >
              <div
                className="bg-[#92278F] h-2 rounded-full transition-all duration-100 relative"
                style={{ width: `${progressPct}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#92278F] rounded-full shadow-lg"></div>
              </div>
            </div>
            <span className="text-xs w-10">{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}



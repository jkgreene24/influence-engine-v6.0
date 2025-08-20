"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, ArrowLeft, Play, Pause, RotateCcw } from "lucide-react"
import { type FunnelState } from "@/lib/utils/funnel-state"

interface QuizQuestion {
  id: string
  text: string
  answers: {
    id: string
    text: string
    style?: string
    route?: string
  }[]
  followUp?: {
    id: string
    text: string
    answers: {
      id: string
      text: string
      style?: string
    }[]
  }
}

interface QuizEntryProps {
  funnelState: FunnelState
  updateFunnelState: (newState: Partial<FunnelState>) => void
  goToNextStep: () => void
}

export default function QuizEntry({ funnelState, updateFunnelState, goToNextStep }: QuizEntryProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [quizPath, setQuizPath] = useState<string[]>([])
  const [showFollowUp, setShowFollowUp] = useState(false)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [videoProgress, setVideoProgress] = useState(0)

  // Quiz questions with branching logic
  const questions: QuizQuestion[] = [
    {
      id: "q1",
      text: "What best describes how you lead or influence others?",
      answers: [
        { id: "a", text: "I bring structure and steady follow-through.", style: "Anchor/Navigator", route: "structure" },
        { id: "b", text: "I create emotional safety and strong human connection.", style: "Diplomat/Connector", route: "relationship" },
        { id: "c", text: "I create momentum and drive action.", style: "Catalyst/Connector", route: "fast-paced" },
        { id: "d", text: "Honestly? It feels like a mix of two or more of these.", route: "blend" },
        { id: "e", text: "None of these feel quite right — show me totally different options.", route: "alternative" }
      ]
    },
    {
      id: "q2",
      text: "What frustrates you most in group situations?",
      answers: [
        { id: "a", text: "When nothing is getting done.", style: "Catalyst" },
        { id: "b", text: "When emotions are ignored or people feel left out.", style: "Diplomat/Connector" },
        { id: "c", text: "When people are disorganized or short-sighted.", style: "Anchor/Navigator" }
      ]
    },
    {
      id: "q3-fast",
      text: "When things stall out, I usually:",
      answers: [
        { id: "a", text: "Provide structure and clarity so others can act.", style: "Anchor" },
        { id: "b", text: "I energize people and drive forward movement.", style: "Catalyst" },
        { id: "c", text: "Talk to people and get everyone back on the same page.", style: "Connector" },
        { id: "d", text: "Honestly? It feels like a mix of two or more of these.", route: "blend" },
        { id: "e", text: "None of these feel right — show me totally different options.", route: "alternative" }
      ],
      followUp: {
        id: "q3-fast-alt",
        text: "You said none of those felt quite right—let's try again. When things stall out, what feels most natural to you?",
        answers: [
          { id: "a", text: "Framing the big picture", style: "Navigator" },
          { id: "b", text: "Providing structure and calm", style: "Anchor" },
          { id: "c", text: "Creating emotional stability and a sense of trust", style: "Diplomat" }
        ]
      }
    },
    {
      id: "q3-structure",
      text: "In complex situations, I prefer to:",
      answers: [
        { id: "a", text: "Step back and look at long-term impacts.", style: "Navigator" },
        { id: "b", text: "Break it into steps and stabilize it.", style: "Anchor" },
        { id: "c", text: "Sparking energy and action.", style: "Catalyst" },
        { id: "d", text: "Honestly? It feels like a mix of two or more of these.", route: "blend" },
        { id: "e", text: "None of these feel right — show me totally different options.", route: "alternative" }
      ],
      followUp: {
        id: "q3-structure-alt",
        text: "You said none of those felt quite right—let's try again. In complex situations, what feels more natural to you?",
        answers: [
          { id: "a", text: "Sparking energy and action", style: "Catalyst" },
          { id: "b", text: "Building trust and emotional safety", style: "Diplomat" },
          { id: "c", text: "Clarifying the vision and next steps", style: "Navigator" }
        ]
      }
    },
    {
      id: "q3-relationship",
      text: "My default way of helping is:",
      answers: [
        { id: "a", text: "Clarifying and building shared understanding.", style: "Connector" },
        { id: "b", text: "Listening and tuning into emotions.", style: "Diplomat" },
        { id: "c", text: "Sparking energy and action", style: "Catalyst" },
        { id: "d", text: "Honestly? It feels like a mix of two or more of these.", route: "blend" },
        { id: "e", text: "None of these feel right — show me totally different options.", route: "alternative" }
      ],
      followUp: {
        id: "q3-relationship-alt",
        text: "You said none of those felt quite right—let's try again. When someone needs help, what's your natural instinct?",
        answers: [
          { id: "a", text: "Providing structure and calm", style: "Anchor" },
          { id: "b", text: "Sparking action or momentum", style: "Catalyst" },
          { id: "c", text: "Framing a longer-term vision", style: "Navigator" }
        ]
      }
    },
    {
      id: "q4",
      text: "People often describe me as:",
      answers: [
        { id: "a", text: "Empathetic and emotionally present", style: "Diplomat" },
        { id: "b", text: "Calm and dependable", style: "Anchor" },
        { id: "c", text: "Strategic and insightful", style: "Navigator" },
        { id: "d", text: "Collaborative and connective", style: "Connector" },
        { id: "e", text: "Bold and energizing", style: "Catalyst" }
      ]
    },
    {
      id: "q5",
      text: "When I'm leading, I care most about:",
      answers: [
        { id: "a", text: "Making sure people feel safe and seen", style: "Diplomat" },
        { id: "b", text: "Long-term vision and impact", style: "Navigator" },
        { id: "c", text: "A clean plan and reliable process", style: "Anchor" },
        { id: "d", text: "Everyone feeling aligned and involved", style: "Connector" },
        { id: "e", text: "Getting things done quickly", style: "Catalyst" }
      ]
    },
    {
      id: "q6",
      text: "My biggest influence strength is:",
      answers: [
        { id: "a", text: "Unifying people", style: "Connector" },
        { id: "b", text: "Steady structure", style: "Anchor" },
        { id: "c", text: "Emotional presence", style: "Diplomat" },
        { id: "d", text: "Strategic vision", style: "Navigator" },
        { id: "e", text: "Driving action", style: "Catalyst" }
      ]
    },
    {
      id: "q7",
      text: "When I'm under pressure, I tend to:",
      answers: [
        { id: "a", text: "Reach out and reconnect people", style: "Connector" },
        { id: "b", text: "Try to re-stabilize and get back on track", style: "Anchor" },
        { id: "c", text: "Become extra sensitive to how others feel", style: "Diplomat" },
        { id: "d", text: "Double down and push harder", style: "Catalyst" },
        { id: "e", text: "Withdraw to re-evaluate", style: "Navigator" }
      ]
    },
    {
      id: "q8",
      text: "In high-stakes situations, I naturally:",
      answers: [
        { id: "a", text: "Stick to the plan and preserve what's working", style: "Anchor" },
        { id: "b", text: "Move quickly to resolve it", style: "Catalyst" },
        { id: "c", text: "Focus on keeping people calm and heard", style: "Diplomat" },
        { id: "d", text: "Think long-term and assess ripple effects", style: "Navigator" },
        { id: "e", text: "Make sure no one is left behind", style: "Connector" }
      ]
    },
    {
      id: "q9",
      text: "When I'm caught off guard, I'm most likely to:",
      answers: [
        { id: "a", text: "Pause and gather facts", style: "Anchor" },
        { id: "b", text: "Freeze and observe", style: "Navigator" },
        { id: "c", text: "Jump into action", style: "Catalyst" },
        { id: "d", text: "Look around to see how others are reacting", style: "Diplomat" },
        { id: "e", text: "Ask questions and gather the group", style: "Connector" }
      ]
    },
    {
      id: "q10",
      text: "I influence best when I…",
      answers: [
        { id: "a", text: "Can spark action and connect people", style: "Catalyst-Connector" },
        { id: "b", text: "Can calm emotions while keeping us moving", style: "Diplomat-Anchor" },
        { id: "c", text: "Can create clarity and strategy", style: "Navigator-Anchor" },
        { id: "d", text: "Can lead with urgency but emotional clarity", style: "Catalyst-Diplomat" },
        { id: "e", text: "Can blend foresight with bold execution", style: "Navigator-Catalyst" },
        { id: "f", text: "Honestly? I don't fit neatly into any of these — show me more.", route: "alternative" }
      ],
      followUp: {
        id: "q10-alt",
        text: "You said \"none\" — which feels more true?",
        answers: [
          { id: "a", text: "I shift based on what's needed", style: "high-versatility" },
          { id: "b", text: "I'm not sure how I influence — I just do it intuitively", style: "intuitive" },
          { id: "c", text: "I do a bit of all of them depending on who I'm with", style: "adaptive" }
        ]
      }
    }
  ]

  // Get current question based on path and index
  const getCurrentQuestion = (): QuizQuestion | null => {
    if (currentQuestionIndex === 0) return questions[0] // Q1
    if (currentQuestionIndex === 1) return questions[1] // Q2
    
    // Determine Q3 based on path
    const q1Answer = answers["q1"]
    const q2Answer = answers["q2"]
    
    if (currentQuestionIndex === 2) {
      if (q1Answer === "c" || q2Answer === "a") return questions[2] // q3-fast
      if (q1Answer === "a" || q2Answer === "c") return questions[3] // q3-structure
      if (q1Answer === "b" || q2Answer === "b") return questions[4] // q3-relationship
      return questions[2] // Default to fast-paced
    }
    
    // Style confirmation questions (Q4-Q6)
    if (currentQuestionIndex >= 3 && currentQuestionIndex <= 5) {
      return questions[currentQuestionIndex + 2] // Q4-Q6
    }
    
    // Pressure questions (Q7-Q9)
    if (currentQuestionIndex >= 6 && currentQuestionIndex <= 8) {
      return questions[currentQuestionIndex + 2] // Q7-Q9
    }
    
    // Blend clarity (Q10)
    if (currentQuestionIndex === 9) {
      return questions[10] // Q10
    }
    
    return null
  }

  const currentQuestion = getCurrentQuestion()

  // Randomize answer order
  const getRandomizedAnswers = (question: QuizQuestion) => {
    const answers = [...question.answers]
    for (let i = answers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[answers[i], answers[j]] = [answers[j], answers[i]]
    }
    return answers
  }

  const handleAnswerSelect = (answerId: string) => {
    if (!currentQuestion) return

    const answer = currentQuestion.answers.find(a => a.id === answerId)
    if (!answer) return

    // Save answer
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: answerId }))

    // Handle routing logic
    if (answer.route === "alternative" && currentQuestion.followUp) {
      setShowFollowUp(true)
      return
    }

    // Move to next question
    setTimeout(() => {
      setCurrentQuestionIndex(prev => prev + 1)
      setShowFollowUp(false)
    }, 500)
  }

  const handleFollowUpAnswer = (answerId: string) => {
    if (!currentQuestion?.followUp) return

    const answer = currentQuestion.followUp.answers.find(a => a.id === answerId)
    if (!answer) return

    // Save follow-up answer
    setAnswers(prev => ({ ...prev, [currentQuestion.followUp!.id]: answerId }))

    // Move to next question
    setTimeout(() => {
      setCurrentQuestionIndex(prev => prev + 1)
      setShowFollowUp(false)
    }, 500)
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
      setShowFollowUp(false)
    }
  }

  const handleComplete = () => {
    // Determine influence style based on answers
    const styleCounts: Record<string, number> = {}
    
    Object.entries(answers).forEach(([questionId, answerId]) => {
      const question = questions.find(q => q.id === questionId)
      if (!question) return
      
      const answer = question.answers.find(a => a.id === answerId)
      if (answer?.style) {
        const styles = answer.style.split('-')
        styles.forEach(style => {
          styleCounts[style] = (styleCounts[style] || 0) + 1
        })
      }
    })

    // Find dominant style(s)
    const sortedStyles = Object.entries(styleCounts)
      .sort(([,a], [,b]) => b - a)
      .map(([style]) => style)

    let influenceStyle = sortedStyles[0] || "Connector"
    let secondaryStyle = sortedStyles[1] || null

    // Handle blends
    if (secondaryStyle && styleCounts[influenceStyle] === styleCounts[secondaryStyle]) {
      influenceStyle = `${influenceStyle}-${secondaryStyle}`
      secondaryStyle = null
    }

    // Update funnel state and proceed
    updateFunnelState({
      influenceStyle,
      secondaryStyle: secondaryStyle || undefined,
      step: 'quiz'
    })
    
    goToNextStep()
  }

  const totalQuestions = 10
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#92278F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Processing your results...</p>
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
            <Badge variant="outline" className="text-sm">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </Badge>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Quiz Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Question Section */}
          <div className="lg:col-span-2">
            <Card className="mb-8">
              <CardContent className="p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {showFollowUp ? currentQuestion.followUp?.text : currentQuestion.text}
                  </h2>
                  <p className="text-gray-600">
                    Answer honestly. There are no wrong answers—only patterns that reveal your most natural approach.
                  </p>
                </div>

                <div className="space-y-4">
                  {(showFollowUp ? currentQuestion.followUp?.answers : getRandomizedAnswers(currentQuestion))?.map((answer) => (
                    <Button
                      key={answer.id}
                      variant="outline"
                      className={`w-full justify-start text-left p-4 h-auto border-2 transition-all duration-200 ${
                        answers[showFollowUp ? currentQuestion.followUp!.id : currentQuestion.id] === answer.id
                          ? 'border-[#92278F] bg-[#92278F]/5 text-[#92278F]'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => showFollowUp ? handleFollowUpAnswer(answer.id) : handleAnswerSelect(answer.id)}
                    >
                      <span className="font-medium">{answer.text}</span>
                    </Button>
                  ))}
                </div>

                {/* Navigation */}
                <div className="flex justify-between items-center mt-8 pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                    className="flex items-center space-x-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </Button>

                  {currentQuestionIndex === totalQuestions - 1 && (
                    <Button
                      onClick={handleComplete}
                      className="bg-[#92278F] hover:bg-[#7a1f78] text-white flex items-center space-x-2"
                    >
                      <span>See My Results</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Video Section */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Watch the Demo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <video
                    className="w-full h-full object-cover"
                    controls
                    onPlay={() => setIsVideoPlaying(true)}
                    onPause={() => setIsVideoPlaying(false)}
                    onTimeUpdate={(e) => {
                      const video = e.target as HTMLVideoElement
                      setVideoProgress((video.currentTime / video.duration) * 100)
                    }}
                  >
                    <source src="/demo-video.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="text-gray-900 font-medium">{Math.round(videoProgress)}%</span>
                  </div>
                  <Progress value={videoProgress} className="h-1" />
                </div>

                <div className="mt-4 text-sm text-gray-600">
                  <p>See how The Influence Engine™ works in action.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

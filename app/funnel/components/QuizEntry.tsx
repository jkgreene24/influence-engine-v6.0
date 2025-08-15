"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, Zap, Users, Anchor, Link, Navigation, MessageCircle } from "lucide-react"
import { type FunnelState } from "@/lib/utils/funnel-state"
import { automationHelpers } from "@/lib/utils/mock-automation"

interface QuizQuestion {
  id: string
  question: string
  answers: {
    id: string
    text: string
    styles: string[]
    route?: string
    followUp?: string
  }[]
}

interface QuizEntryProps {
  funnelState: FunnelState
  updateFunnelState: (newState: Partial<FunnelState>) => void
  goToNextStep: () => void
}

// Quiz questions from the existing implementation
const entryQuestions: QuizQuestion[] = [
  {
    id: "entry1",
    question: "What best describes how you lead or influence others?",
    answers: [
      { id: "A", text: "I create momentum and drive action.", styles: ["catalyst", "connector"], route: "fast-paced" },
      { id: "B", text: "I bring structure and steady follow-through.", styles: ["anchor", "navigator"], route: "structure" },
      { id: "C", text: "I create emotional safety and strong human connection.", styles: ["diplomat", "connector"], route: "relationship" },
      { id: "D", text: "Honestly? A mix of two or more of these.", styles: ["mixed"], route: "blend" },
    ],
  },
  {
    id: "entry2",
    question: "What frustrates you most in group situations?",
    answers: [
      { id: "A", text: "When nothing is getting done.", styles: ["catalyst"], route: "fast-paced" },
      { id: "B", text: "When people are disorganized or short-sighted.", styles: ["anchor", "navigator"], route: "structure" },
      { id: "C", text: "When emotions are ignored or people feel left out.", styles: ["diplomat", "connector"], route: "relationship" },
    ],
  },
]

const pathQuestions = {
  "fast-paced": [
    {
      id: "fp1",
      question: "When things stall out, I usually:",
      answers: [
        { id: "A", text: "Inject energy and urgency to move it forward.", styles: ["catalyst"] },
        { id: "B", text: "Talk to people and get everyone back on the same page.", styles: ["connector"] },
        { id: "C", text: "Not quite either of these. Show me another option.", styles: ["mixed"], followUp: "fp1-alt" },
      ],
    },
    {
      id: "fp1-alt",
      question: "When things stall out, what feels most natural to you?",
      answers: [
        { id: "A", text: "Providing structure and calm", styles: ["anchor"] },
        { id: "B", text: "Holding space and emotional safety", styles: ["diplomat"] },
        { id: "C", text: "Framing the big picture", styles: ["navigator"] },
      ],
    },
    {
      id: "fp2",
      question: "In high-stakes conversations, I'm most comfortable:",
      answers: [
        { id: "A", text: "Taking charge and setting the pace", styles: ["catalyst"] },
        { id: "B", text: "Listening and finding common ground", styles: ["connector"] },
      ],
    },
  ],
  "structure": [
    {
      id: "st1",
      question: "When planning or organizing, I focus on:",
      answers: [
        { id: "A", text: "The big picture and long-term vision", styles: ["navigator"] },
        { id: "B", text: "The details and reliable execution", styles: ["anchor"] },
      ],
    },
    {
      id: "st2",
      question: "When things get chaotic, I:",
      answers: [
        { id: "A", text: "Step back and create a clear plan", styles: ["navigator"] },
        { id: "B", text: "Roll up my sleeves and get things done", styles: ["anchor"] },
      ],
    },
  ],
  "relationship": [
    {
      id: "rel1",
      question: "In group dynamics, I'm most valued for:",
      answers: [
        { id: "A", text: "Creating harmony and resolving conflicts", styles: ["diplomat"] },
        { id: "B", text: "Connecting people and building bridges", styles: ["connector"] },
      ],
    },
    {
      id: "rel2",
      question: "When someone is struggling, I:",
      answers: [
        { id: "A", text: "Listen and provide emotional support", styles: ["diplomat"] },
        { id: "B", text: "Help them see the bigger picture", styles: ["connector"] },
      ],
    },
  ],
}

export default function QuizEntry({ funnelState, updateFunnelState, goToNextStep }: QuizEntryProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedPath, setSelectedPath] = useState<string>("")
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [needsBlend, setNeedsBlend] = useState(false)
  const [needsConfirmation, setNeedsConfirmation] = useState(false)

  // Determine which questions to show
  let questions: QuizQuestion[] = []
  if (selectedPath && pathQuestions[selectedPath as keyof typeof pathQuestions]) {
    questions = pathQuestions[selectedPath as keyof typeof pathQuestions]
  } else {
    questions = entryQuestions
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  const handleAnswerSelect = (answerId: string) => {
    const answer = currentQuestion.answers.find(a => a.id === answerId)
    if (!answer) return

    // Store the answer
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: answerId }))

    // Handle routing logic
    if (answer.route) {
      setSelectedPath(answer.route)
      setCurrentQuestionIndex(0) // Reset to first question of new path
    } else if (answer.followUp) {
      // Handle follow-up questions (simplified for now)
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
      // Check if we need to determine blend
      if (answer.styles.includes("mixed")) {
        setNeedsBlend(true)
        setCurrentQuestionIndex(prev => prev + 1)
      } else if (answer.styles.length > 1) {
        setNeedsConfirmation(true)
        setCurrentQuestionIndex(prev => prev + 1)
      } else {
        // Single style determined
        const style = answer.styles[0]
        completeQuiz(style)
      }
    }
  }

  const completeQuiz = async (primaryStyle: string, secondaryStyle?: string) => {
    // Update funnel state with quiz results
    updateFunnelState({
      influenceStyle: primaryStyle,
      secondaryStyle: secondaryStyle,
      step: 'results'
    })
    
    // Tag quiz completion in automation
    try {
      if (funnelState.userData?.email) {
        await automationHelpers.tagQuizEvents(funnelState.userData.email, primaryStyle)
        await automationHelpers.tagQuizCompletion(funnelState.userData.email)
      }
    } catch (error) {
      console.error('Failed to tag quiz events:', error)
    }
    
    // Move to next step
    goToNextStep()
  }

  const getStyleIcon = (style: string) => {
    switch (style.toLowerCase()) {
      case 'catalyst':
        return <Zap className="w-6 h-6" />
      case 'navigator':
        return <Navigation className="w-6 h-6" />
      case 'diplomat':
        return <Users className="w-6 h-6" />
      case 'anchor':
        return <Anchor className="w-6 h-6" />
      case 'connector':
        return <Link className="w-6 h-6" />
      default:
        return <MessageCircle className="w-6 h-6" />
    }
  }

  const getStyleColor = (style: string) => {
    switch (style.toLowerCase()) {
      case 'catalyst':
        return 'bg-orange-500'
      case 'navigator':
        return 'bg-blue-500'
      case 'diplomat':
        return 'bg-pink-500'
      case 'anchor':
        return 'bg-green-500'
      case 'connector':
        return 'bg-purple-500'
      default:
        return 'bg-gray-500'
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

      {/* Quiz Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Question {currentQuestionIndex + 1} of {questions.length}</span>
            <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 text-center">
              {currentQuestion.question}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentQuestion.answers.map((answer) => (
                <Button
                  key={answer.id}
                  variant="outline"
                  className="w-full h-auto p-6 text-left justify-start border-2 hover:border-[#92278F] hover:bg-[#92278F]/5"
                  onClick={() => handleAnswerSelect(answer.id)}
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-[#92278F] text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {answer.id}
                    </div>
                    <span className="text-lg">{answer.text}</span>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </Button>
          
          <div className="text-sm text-gray-500">
            Take your time - this helps us provide the most accurate results
          </div>
        </div>
      </div>
    </div>
  )
}

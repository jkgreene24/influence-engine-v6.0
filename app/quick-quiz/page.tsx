"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, Zap, Users, Anchor, Link, Navigation, MessageCircle } from "lucide-react"
import { useRouter } from "next/navigation"


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

interface QuizResult {
  primary: string
  secondary?: string
  isBlend: boolean
}

interface QuizState {
  step: "entry" | "path" | "blend" | "confirmation" | "result" | "quiz"
  questionIndex: number
  selectedPath: string
  answers: Record<string, string>
  needsBlend: boolean
  needsConfirmation: boolean
}

// Function to shuffle array
const shuffleArray = (array: any[]): any[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Function to randomize answer order
const randomizeAnswers = (answers: any[]) => {
  const shuffled = shuffleArray(answers);
  const letters = ['A', 'B', 'C', 'D', 'E'];
  return shuffled.map((answer, index) => ({
    ...answer,
    id: letters[index]
  }));
};

const entryQuestions: QuizQuestion[] = [
  {
    id: "entry1",
    question: "What best describes how you lead or influence others?",
    answers: [
      { id: "A", text: "I bring structure and steady follow-through.", styles: ["anchor", "navigator"], route: "structure" },
      { id: "B", text: "I create emotional safety and strong human connection.", styles: ["diplomat", "connector"], route: "relationship" },
      { id: "C", text: "I create momentum and drive action.", styles: ["catalyst", "connector"], route: "fast-paced" },
      { id: "D", text: "Honestly? It feels like a mix of two or more of these.", styles: ["mixed"], route: "blend" },
      { id: "E", text: "None of these feel quite right — show me totally different options.", styles: ["mixed"], route: "fast-paced-alt" },
    ],
  },
  {
    id: "entry2",
    question: "What frustrates you most in group situations?",
    answers: [
      { id: "A", text: "When nothing is getting done.", styles: ["catalyst"], route: "fast-paced" },
      { id: "B", text: "When emotions are ignored or people feel left out.", styles: ["diplomat", "connector"], route: "relationship" },
      { id: "C", text: "When people are disorganized or short-sighted.", styles: ["anchor", "navigator"], route: "structure" },
    ],
  },
]

const pathQuestions = {
  "fast-paced": [
    {
      id: "fp1",
      question: "When things stall out, I usually:",
      answers: [
        { id: "A", text: "Provide structure and clarity so others can act.", styles: ["anchor"] },
        { id: "B", text: "I energize people and drive forward movement.", styles: ["catalyst"] },
        { id: "C", text: "Talk to people and get everyone back on the same page.", styles: ["connector"] },
        { id: "D", text: "Honestly? It feels like a mix of two or more of these.", styles: ["mixed"], followUp: "fp1-alt" },
        { id: "E", text: "None of these feel right — show me totally different options.", styles: ["mixed"], followUp: "fp1-alt" },
      ],
    },
    {
      id: "fp1-alt",
      question: "You said none of those felt quite right—let's try again. When things stall out, what feels most natural to you?",
      answers: [
        { id: "A", text: "Framing the big picture", styles: ["navigator"] },
        { id: "B", text: "Providing structure and calm", styles: ["anchor"] },
        { id: "C", text: "Creating emotional stability and a sense of trust", styles: ["diplomat"] },
      ],
    },
  ],
  structure: [
    {
      id: "st1",
      question: "In complex situations, I prefer to:",
      answers: [
        { id: "A", text: "Step back and look at long-term impacts.", styles: ["navigator"] },
        { id: "B", text: "Break it into steps and stabilize it.", styles: ["anchor"] },
        { id: "C", text: "Sparking energy and action.", styles: ["catalyst"] },
        { id: "D", text: "Honestly? It feels like a mix of two or more of these.", styles: ["mixed"], followUp: "st1-alt" },
        { id: "E", text: "None of these feel right — show me totally different options.", styles: ["mixed"], followUp: "st1-alt" },
      ],
    },
    {
      id: "st1-alt",
      question: "You said none of those felt quite right—let's try again. In complex situations, what feels more natural to you?",
      answers: [
        { id: "A", text: "Sparking energy and action", styles: ["catalyst"] },
        { id: "B", text: "Building trust and emotional safety", styles: ["diplomat"] },
        { id: "C", text: "Clarifying the vision and next steps", styles: ["navigator"] },
      ],
    },
  ],
  relationship: [
    {
      id: "rel1",
      question: "My default way of helping is:",
      answers: [
        { id: "A", text: "Clarifying and building shared understanding.", styles: ["connector"] },
        { id: "B", text: "Listening and tuning into emotions.", styles: ["diplomat"] },
        { id: "C", text: "Sparking energy and action", styles: ["catalyst"] },
        { id: "D", text: "Honestly? It feels like a mix of two or more of these.", styles: ["mixed"], followUp: "rel1-alt" },
        { id: "E", text: "None of these feel right — show me totally different options.", styles: ["mixed"], followUp: "rel1-alt" },
      ],
    },
    {
      id: "rel1-alt",
      question: "You said none of those felt quite right—let's try again. When someone needs help, what's your natural instinct?",
      answers: [
        { id: "A", text: "Providing structure and calm", styles: ["anchor"] },
        { id: "B", text: "Sparking action or momentum", styles: ["catalyst"] },
        { id: "C", text: "Framing a longer-term vision", styles: ["navigator"] },
      ],
    },
  ],
}

const blendQuestions = [
  {
    id: "blend1",
    question: "You tend to blend energy and depth. When you're under pressure, what shows up first?",
    answers: [
      { id: "A", text: "You spring into action", styles: ["catalyst"] },
      { id: "B", text: "You emotionally anchor and hold space", styles: ["diplomat"] },
      { id: "C", text: "You try to reconnect the group", styles: ["connector"] },
    ],
  },
  {
    id: "blend2",
    question: "Which feels more natural, even if you do both?",
    answers: [
      { id: "A", text: "Driving change and initiating movement", styles: ["catalyst", "navigator"] },
      { id: "B", text: "Building emotional trust and psychological safety", styles: ["diplomat", "connector"] },
      { id: "C", text: "Creating order and planning for success", styles: ["anchor"] },
    ],
  },
]

// Alternative question set for "none of these feel right" responses
const alternativeQuestions = [
  {
    id: "alt1",
    question: "When you're at your best, what drives you most?",
    answers: [
      { id: "A", text: "Vision", styles: ["navigator"] },
      { id: "B", text: "Momentum", styles: ["catalyst"] },
      { id: "C", text: "People", styles: ["connector"] },
      { id: "D", text: "Stability", styles: ["anchor"] },
      { id: "E", text: "Emotion", styles: ["diplomat"] },
    ],
  },
  {
    id: "alt2",
    question: "What kind of feedback do you hear most?",
    answers: [
      { id: "A", text: "You keep things moving.", styles: ["catalyst"] },
      { id: "B", text: "You always understand people.", styles: ["diplomat"] },
      { id: "C", text: "You think big.", styles: ["navigator"] },
      { id: "D", text: "You're grounded and dependable.", styles: ["anchor"] },
      { id: "E", text: "You bring people together.", styles: ["connector"] },
    ],
  },
]

const confirmationQuestions = [
  {
    id: "confirm1",
    question: "People often describe me as:",
    answers: [
      { id: "A", text: "Empathetic and emotionally present", styles: ["diplomat"] },
      { id: "B", text: "Calm and dependable", styles: ["anchor"] },
      { id: "C", text: "Strategic and insightful", styles: ["navigator"] },
      { id: "D", text: "Collaborative and connective", styles: ["connector"] },
      { id: "E", text: "Bold and energizing", styles: ["catalyst"] },
    ],
  },
  {
    id: "confirm2",
    question: "When I'm leading, I care most about:",
    answers: [
      { id: "A", text: "Making sure people feel safe and seen", styles: ["diplomat"] },
      { id: "B", text: "Long-term vision and impact", styles: ["navigator"] },
      { id: "C", text: "A clean plan and reliable process", styles: ["anchor"] },
      { id: "D", text: "Everyone feeling aligned and involved", styles: ["connector"] },
      { id: "E", text: "Getting things done quickly", styles: ["catalyst"] },
    ],
  },
  {
    id: "confirm3",
    question: "My biggest influence strength is:",
    answers: [
      { id: "A", text: "Unifying people", styles: ["connector"] },
      { id: "B", text: "Steady structure", styles: ["anchor"] },
      { id: "C", text: "Emotional presence", styles: ["diplomat"] },
      { id: "D", text: "Strategic vision", styles: ["navigator"] },
      { id: "E", text: "Driving action", styles: ["catalyst"] },
    ],
  },
]

const pressureQuestions = [
  {
    id: "pressure1",
    question: "When I'm under pressure, I tend to:",
    answers: [
      { id: "A", text: "Reach out and reconnect people", styles: ["connector"] },
      { id: "B", text: "Try to re-stabilize and get back on track", styles: ["anchor"] },
      { id: "C", text: "Become extra sensitive to how others feel", styles: ["diplomat"] },
      { id: "D", text: "Double down and push harder", styles: ["catalyst"] },
      { id: "E", text: "Withdraw to re-evaluate", styles: ["navigator"] },
    ],
  },
  {
    id: "pressure2",
    question: "In high-stakes situations, I naturally:",
    answers: [
      { id: "A", text: "Stick to the plan and preserve what's working", styles: ["anchor"] },
      { id: "B", text: "Move quickly to resolve it", styles: ["catalyst"] },
      { id: "C", text: "Focus on keeping people calm and heard", styles: ["diplomat"] },
      { id: "D", text: "Think long-term and assess ripple effects", styles: ["navigator"] },
      { id: "E", text: "Make sure no one is left behind", styles: ["connector"] },
    ],
  },
  {
    id: "pressure3",
    question: "When I'm caught off guard, I'm most likely to:",
    answers: [
      { id: "A", text: "Pause and gather facts", styles: ["anchor"] },
      { id: "B", text: "Freeze and observe", styles: ["navigator"] },
      { id: "C", text: "Jump into action", styles: ["catalyst"] },
      { id: "D", text: "Look around to see how others are reacting", styles: ["diplomat"] },
      { id: "E", text: "Ask questions and gather the group", styles: ["connector"] },
    ],
  },
]

const blendClarityQuestions = [
  {
    id: "blend1",
    question: "I influence best when I…",
    answers: [
      { id: "A", text: "Can spark action and connect people", styles: ["catalyst", "connector"] },
      { id: "B", text: "Can calm emotions while keeping us moving", styles: ["diplomat", "anchor"] },
      { id: "C", text: "Can create clarity and strategy", styles: ["navigator", "anchor"] },
      { id: "D", text: "Can lead with urgency but emotional clarity", styles: ["catalyst", "diplomat"] },
      { id: "E", text: "Can blend foresight with bold execution", styles: ["navigator", "catalyst"] },
      { id: "F", text: "Honestly? I don't fit neatly into any of these — show me more.", styles: ["mixed"], followUp: "blend1-alt" },
    ],
  },
  {
    id: "blend1-alt",
    question: "You said \"none\" — which feels more true?",
    answers: [
      { id: "A", text: "I shift based on what's needed", styles: ["high-versatility"] },
      { id: "B", text: "I'm not sure how I influence — I just do it intuitively", styles: ["intuitive"] },
      { id: "C", text: "I do a bit of all of them depending on who I'm with", styles: ["adaptive"] },
    ],
  },
]

const tiebreakerQuestions = [
  {
    id: "tie1",
    question: "When you're at your best, what drives you most?",
    answers: [
      { id: "A", text: "Vision", styles: ["navigator"] },
      { id: "B", text: "Momentum", styles: ["catalyst"] },
      { id: "C", text: "People", styles: ["connector"] },
      { id: "D", text: "Stability", styles: ["anchor"] },
      { id: "E", text: "Emotion", styles: ["diplomat"] },
    ],
  },
  {
    id: "tie2",
    question: "What kind of feedback do you hear most?",
    answers: [
      { id: "A", text: "You keep things moving.", styles: ["catalyst"] },
      { id: "B", text: "You always understand people.", styles: ["diplomat"] },
      { id: "C", text: "You think big.", styles: ["navigator"] },
      { id: "D", text: "You're grounded and dependable.", styles: ["anchor"] },
      { id: "E", text: "You bring people together.", styles: ["connector"] },
    ],
  },
]

const getInfluenceIcon = (style: string, size = "w-8 h-8") => {
  const styles = style.split("-")

  const getIcon = (singleStyle: string) => {
    switch (singleStyle) {
      case "catalyst":
        return <Zap className={size} />
      case "diplomat":
        return <Users className={size} />
      case "anchor":
        return <Anchor className={size} />
      case "connector":
        return <Link className={size} />
      case "navigator":
        return <Navigation className={size} />
      default:
        return <MessageCircle className={size} />
    }
  }

  if (styles.length === 2) {
    return (
      <div className="flex items-center space-x-2">
        {getIcon(styles[0])}
        <span className="text-lg font-bold">+</span>
        {getIcon(styles[1])}
      </div>
    )
  }

  return getIcon(styles[0])
}

const styleDescriptions = {
  catalyst: {
    name: "Catalyst",
    description: "You lead with urgency and bold energy, moving people into action.",
    strengths: "Directness, momentum, fast decision-making",
    color: "bg-orange-500",
  },
  connector: {
    name: "Connector",
    description: "You lead by bringing people together and creating alignment.",
    strengths: "Group awareness, facilitation, collaboration",
    color: "bg-purple-500",
  },
  diplomat: {
    name: "Diplomat",
    description: "You create emotional safety and hold space for others to thrive.",
    strengths: "Empathy, conflict reduction, emotional clarity",
    color: "bg-pink-500",
  },
  anchor: {
    name: "Anchor",
    description: "You lead with structure, consistency, and grounded presence.",
    strengths: "Stability, process, reliability",
    color: "bg-green-500",
  },
  navigator: {
    name: "Navigator",
    description: "You see long-range patterns and guide others with insight and foresight.",
    strengths: "Strategy, vision, pattern recognition",
    color: "bg-blue-500",
  },
}

const blendDescriptions = {
  "catalyst-connector": {
    description: "You drive change with both action and group momentum.",
    strengths: "Energy, inclusivity, social clarity",
  },
  "connector-diplomat": {
    description: "You build trust through connection and emotional awareness.",
    strengths: "Relational harmony, empathy, mediation",
  },
  "anchor-navigator": {
    description: "You stabilize the present while guiding toward the future.",
    strengths: "Planning, system design, steadiness",
  },
  "navigator-anchor": {
    description: "You structure ideas into clear strategies with long-term value.",
    strengths: "Strategic calm, foresight, planning",
  },
  "catalyst-diplomat": {
    description: "You spark action with emotional clarity and courage.",
    strengths: "Momentum with heart, trust-building",
  },
  "navigator-catalyst": {
    description: "You combine strategic foresight with bold execution.",
    strengths: "Vision, decisive action, influence",
  },
  "diplomat-anchor": {
    description: "You offer calm emotional steadiness and dependable support.",
    strengths: "Safe presence, loyalty, follow-through",
  },
}



export default function QuickQuiz() {
  const [currentStep, setCurrentStep] = useState<"quiz" | "result">("quiz")
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedPath, setSelectedPath] = useState<string>("")
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [selectedAnswer, setSelectedAnswer] = useState<string>("")
  const [result, setResult] = useState<QuizResult | null>(null)
  const [needsBlend, setNeedsBlend] = useState(false)
  const [needsConfirmation, setNeedsConfirmation] = useState(false)
  const [needsPressure, setNeedsPressure] = useState(false)
  const [needsBlendClarity, setNeedsBlendClarity] = useState(false)
  const [needsAlternative, setNeedsAlternative] = useState(false)
  const [history, setHistory] = useState<QuizState[]>([])
  const [randomizedQuestions, setRandomizedQuestions] = useState<{
    entry: QuizQuestion[]
    fastPaced: QuizQuestion[]
    structure: QuizQuestion[]
    relationship: QuizQuestion[]
    confirmation: QuizQuestion[]
    pressure: QuizQuestion[]
    blendClarity: QuizQuestion[]
    alternative: QuizQuestion[]
  } | null>(null)
  const [userData, setUserData] = useState<any>(null)
  const router = useRouter()

  // Load user data from localStorage on component mount
  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("current_influence_user") || "null")
    if (!currentUser) {
      router.push("/")
      return
    }
    setUserData(currentUser)
  }, [router])

  // Client-side randomization
  useEffect(() => {
    const randomized = {
      entry: entryQuestions.map(q => ({
        ...q,
        answers: randomizeAnswers(q.answers.map(({ id, ...rest }) => rest))
      })),
      fastPaced: pathQuestions["fast-paced"].map(q => ({
        ...q,
        answers: randomizeAnswers(q.answers.map(({ id, ...rest }) => rest))
      })),
      structure: pathQuestions["structure"].map(q => ({
        ...q,
        answers: randomizeAnswers(q.answers.map(({ id, ...rest }) => rest))
      })),
      relationship: pathQuestions["relationship"].map(q => ({
        ...q,
        answers: randomizeAnswers(q.answers.map(({ id, ...rest }) => rest))
      })),
      confirmation: confirmationQuestions.map(q => ({
        ...q,
        answers: randomizeAnswers(q.answers.map(({ id, ...rest }) => rest))
      })),
      pressure: pressureQuestions.map(q => ({
        ...q,
        answers: randomizeAnswers(q.answers.map(({ id, ...rest }) => rest))
      })),
      blendClarity: blendClarityQuestions.map(q => ({
        ...q,
        answers: randomizeAnswers(q.answers.map(({ id, ...rest }) => rest))
      })),
      alternative: alternativeQuestions.map(q => ({
        ...q,
        answers: randomizeAnswers(q.answers.map(({ id, ...rest }) => rest))
      }))
    }
    setRandomizedQuestions(randomized)
  }, [])

  const getCurrentQuestions = () => {
    if (!randomizedQuestions) {
      // Return original questions during SSR
      switch (currentStep) {
        case "quiz":
          if (needsAlternative) {
            return alternativeQuestions
          }
          if (needsBlendClarity) {
            return blendClarityQuestions
          }
          if (needsPressure) {
            return pressureQuestions
          }
          if (needsConfirmation) {
            return confirmationQuestions
          }
          if (selectedPath) {
            return pathQuestions[selectedPath as keyof typeof pathQuestions] || []
          }
          return entryQuestions
        default:
          return []
      }
    }

    // Return randomized questions on client
    switch (currentStep) {
      case "quiz":
        if (needsAlternative) {
          return randomizedQuestions.alternative
        }
        if (needsBlendClarity) {
          return randomizedQuestions.blendClarity
        }
        if (needsPressure) {
          return randomizedQuestions.pressure
        }
        if (needsConfirmation) {
          return randomizedQuestions.confirmation
        }
        if (!selectedPath) {
          return randomizedQuestions.entry
        }
        if (selectedPath === "fast-paced") return randomizedQuestions.fastPaced
        if (selectedPath === "structure") return randomizedQuestions.structure
        if (selectedPath === "relationship") return randomizedQuestions.relationship
        return []
      default:
        return []
    }
  }

  const currentQuestions = getCurrentQuestions()
  const currentQuestion = currentQuestions[currentQuestionIndex]

  // Calculate total progress based on current step and question
  const getTotalProgress = () => {
    const currentQuestions = getCurrentQuestions()
    const totalQuestionsInStep = currentQuestions.length
    
    if (totalQuestionsInStep === 0) return 0
    
    // Calculate progress within the current step
    let progress = Math.round(((currentQuestionIndex + 1) / totalQuestionsInStep) * 100)
    
    // Adjust progress based on the current phase
    if (needsAlternative) {
      progress = 20 + (progress * 0.2) // 20-40%
    } else if (needsBlendClarity) {
      progress = 40 + (progress * 0.2) // 40-60%
    } else if (needsPressure) {
      progress = 60 + (progress * 0.2) // 60-80%
    } else if (needsConfirmation) {
      progress = 80 + (progress * 0.2) // 80-100%
    } else if (selectedPath) {
      progress = 20 + (progress * 0.4) // 20-60% (only Q3 in path)
    }
    
    return Math.round(progress)
  }

  const progress = getTotalProgress()
  
  const getStepInfo = (step: string, path?: string) => {
    switch (step) {
      case "quiz":
        if (needsAlternative) {
          return {
            title: "Finding Your Style",
            subtitle: "Let's discover what drives you most",
            description: "You didn't identify with the initial options. Let's find what truly motivates your influence approach.",
            color: "from-indigo-600 to-purple-600",
          }
        }
        if (needsBlendClarity) {
          return {
            title: "Understanding Your Blend",
            subtitle: "Let's clarify your unique combination of styles",
            description: "You show patterns of multiple influence styles. Let's understand how they work together.",
            color: "from-purple-600 to-pink-600",
          }
        }
        if (needsPressure) {
          return {
            title: "Under Pressure",
            subtitle: "How you respond when things get intense",
            description: "Your natural responses under pressure reveal your core influence patterns.",
            color: "from-red-600 to-orange-600",
          }
        }
        if (needsConfirmation) {
          return {
            title: "Style Confirmation",
            subtitle: "Final questions to confirm your influence style",
            description: "These questions help us confirm your primary influence approach.",
            color: "from-blue-600 to-indigo-600",
          }
        }
        if (!path) {
          return {
            title: "Understanding Your Natural Approach",
            subtitle: "Let's start by identifying your core influence patterns",
            description:
              "These questions help us understand how you naturally lead and what drives your communication style.",
            color: "from-[#92278F] to-purple-600",
          }
        }
        const pathTitles = {
          "fast-paced": "Fast-Paced Influencer Path",
          structure: "Structure & Vision Path",
          relationship: "Relationship-Centered Path",
        }
        const pathDescriptions = {
          "fast-paced": "You're action-oriented! Let's explore whether you're more of a Catalyst or Connector.",
          structure: "You value stability and planning! Let's see if you're more Anchor or Navigator.",
          relationship: "You prioritize people and connection! Let's determine if you're more Diplomat or Connector.",
        }
        return {
          title: pathTitles[path as keyof typeof pathTitles] || "Exploring Your Style",
          subtitle: "Diving deeper into your influence approach",
          description:
            pathDescriptions[path as keyof typeof pathDescriptions] || "Let's explore your specific style patterns.",
          color: "from-blue-600 to-indigo-600",
        }
      default:
        return {
          title: "Influence Style Quiz",
          subtitle: "",
          description: "",
          color: "from-[#92278F] to-purple-600",
        }
    }
  }
  
  const stepInfo = getStepInfo("quiz", selectedPath)

  const handleAnswerSelect = (answerId: string) => {
    setSelectedAnswer(answerId)
  }

  const saveCurrentState = () => {
    const state: QuizState = {
      step: "quiz",
      questionIndex: currentQuestionIndex,
      selectedPath,
      answers: { ...answers },
      needsBlend,
      needsConfirmation,
    }
    setHistory((prev) => [...prev, state])
  }

  const calculateResult = (allAnswers: Record<string, string>) => {
    const styleScores: Record<string, number> = {
      catalyst: 0,
      connector: 0,
      anchor: 0,
      navigator: 0,
      diplomat: 0,
    }

    // Count style occurrences from all answers
    Object.entries(allAnswers).forEach(([questionId, answerId]) => {
      let question: QuizQuestion | undefined

      // Find the question using randomized questions if available
      if (randomizedQuestions) {
        if (questionId.startsWith("entry")) {
          question = randomizedQuestions.entry.find((q) => q.id === questionId)
        } else if (questionId.startsWith("fp")) {
          question = randomizedQuestions.fastPaced.find((q) => q.id === questionId)
        } else if (questionId.startsWith("st")) {
          question = randomizedQuestions.structure.find((q) => q.id === questionId)
        } else if (questionId.startsWith("rel")) {
          question = randomizedQuestions.relationship.find((q) => q.id === questionId)
        } else if (questionId.startsWith("confirm")) {
          question = randomizedQuestions.confirmation.find((q) => q.id === questionId)
        } else if (questionId.startsWith("pressure")) {
          question = randomizedQuestions.pressure.find((q) => q.id === questionId)
        } else if (questionId.startsWith("blend")) {
          question = randomizedQuestions.blendClarity.find((q) => q.id === questionId)
        } else if (questionId.startsWith("alt")) {
          question = randomizedQuestions.alternative.find((q) => q.id === questionId)
        }
      } else {
        // Fallback to original questions
        if (questionId.startsWith("entry")) {
          question = entryQuestions.find((q) => q.id === questionId)
        } else if (questionId.startsWith("fp")) {
          question = pathQuestions["fast-paced"].find((q) => q.id === questionId)
        } else if (questionId.startsWith("st")) {
          question = pathQuestions["structure"].find((q) => q.id === questionId)
        } else if (questionId.startsWith("rel")) {
          question = pathQuestions["relationship"].find((q) => q.id === questionId)
        } else if (questionId.startsWith("confirm")) {
          question = confirmationQuestions.find((q) => q.id === questionId)
        } else if (questionId.startsWith("pressure")) {
          question = pressureQuestions.find((q) => q.id === questionId)
        } else if (questionId.startsWith("blend")) {
          question = blendClarityQuestions.find((q) => q.id === questionId)
        } else if (questionId.startsWith("alt")) {
          question = alternativeQuestions.find((q) => q.id === questionId)
        }
      }

      if (question) {
        const answer = question.answers.find((a) => a.id === answerId)
        if (answer && !answer.styles.includes("mixed")) {
          answer.styles.forEach((style) => {
            if (styleScores[style] !== undefined) {
              styleScores[style]++
            }
          })
        }
      }
    })

    // Find top two styles
    const sortedStyles = Object.entries(styleScores)
      .sort(([, a], [, b]) => b - a)
      .filter(([, score]) => score > 0)

    if (sortedStyles.length === 0) {
      return { primary: "catalyst", isBlend: false }
    }

    const [primaryStyle, primaryScore] = sortedStyles[0]
    const [secondaryStyle, secondaryScore] = sortedStyles[1] || [null, 0]

    // Determine if it's a blend (secondary score is close to primary)
    const isBlend = secondaryStyle && secondaryScore >= primaryScore * 0.6

    return {
      primary: primaryStyle,
      secondary: isBlend ? secondaryStyle : undefined,
      isBlend: !!isBlend,
    }
  }

  const handleNext = () => {
    if (!selectedAnswer) return

    // Save current state before moving forward
    saveCurrentState()

    const newAnswers = {
      ...answers,
      [currentQuestion.id]: selectedAnswer,
    }
    setAnswers(newAnswers)

    if (currentStep === "quiz") {
      if (!selectedPath) {
        // Entry questions
        if (currentQuestionIndex === 0) {
          // First entry question - determine initial path
          const answer = currentQuestion.answers.find((a) => a.id === selectedAnswer)
          if (answer && "route" in answer && answer.route) {
            const route = answer.route as string
            if (route === "blend") {
              setNeedsBlendClarity(true)
              setCurrentQuestionIndex(0)
              setSelectedAnswer("")
            } else if (route === "fast-paced-alt") {
              setNeedsAlternative(true)
              setCurrentQuestionIndex(0)
              setSelectedAnswer("")
            } else {
              setSelectedPath(route)
              setCurrentQuestionIndex(1)
              setSelectedAnswer("")
            }
          }
        } else {
          // Second entry question - confirm path and move to path questions
          const answer = currentQuestion.answers.find((a) => a.id === selectedAnswer)
          if (answer && "route" in answer && answer.route) {
            const route = answer.route as string
            if (route === "blend") {
              setNeedsBlendClarity(true)
              setCurrentQuestionIndex(0)
              setSelectedAnswer("")
            } else {
              setSelectedPath(route)
              setCurrentQuestionIndex(0)
              setSelectedAnswer("")
            }
          }
        }
      } else if (needsAlternative) {
        // Alternative questions for "none of these feel right"
        if (currentQuestionIndex < alternativeQuestions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1)
          setSelectedAnswer("")
        } else {
          // Move to confirmation questions
          setNeedsConfirmation(true)
          setNeedsAlternative(false)
          setCurrentQuestionIndex(0)
          setSelectedAnswer("")
        }
      } else if (needsBlendClarity) {
        // Blend clarity questions
        if (currentQuestionIndex < blendClarityQuestions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1)
          setSelectedAnswer("")
        } else {
          // Move to pressure questions
          setNeedsPressure(true)
          setNeedsBlendClarity(false)
          setCurrentQuestionIndex(0)
          setSelectedAnswer("")
        }
      } else if (needsPressure) {
        // Pressure questions
        if (currentQuestionIndex < pressureQuestions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1)
          setSelectedAnswer("")
        } else {
          // Move to confirmation questions
          setNeedsConfirmation(true)
          setNeedsPressure(false)
          setCurrentQuestionIndex(0)
          setSelectedAnswer("")
        }
      } else if (needsConfirmation) {
        // Confirmation questions
        if (currentQuestionIndex < confirmationQuestions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1)
          setSelectedAnswer("")
        } else {
          // Calculate final result
          const finalResult = calculateResult(newAnswers)
          setResult(finalResult)
          setCurrentStep("result")
          
          // Update database with quiz results instantly when quiz is completed
          updateQuizResultsInDatabase(finalResult)
        }
      } else {
        // Path questions (Q3)
        if (currentQuestionIndex < 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1)
          setSelectedAnswer("")
        } else {
          // After Q3, check if we need pressure questions based on mixed answers
          const mixedAnswers = Object.values(newAnswers).filter((answerId) => {
            const allQuestions = [...entryQuestions, ...Object.values(pathQuestions).flat() as QuizQuestion[]]
            for (const q of allQuestions) {
              const a = q.answers.find((ans) => ans.id === answerId)
              if (a && a.styles.includes("mixed")) return true
            }
            return false
          })

          if (mixedAnswers.length >= 1) {
            setNeedsPressure(true)
            setCurrentQuestionIndex(0)
            setSelectedAnswer("")
          } else {
            // Move to confirmation questions
            setNeedsConfirmation(true)
            setCurrentQuestionIndex(0)
            setSelectedAnswer("")
          }
        }
      }
    }
  }

  const handlePrevious = () => {
    if (history.length === 0) return

    // Get the last state from history
    const previousState = history[history.length - 1]

    // Restore the previous state
    setCurrentQuestionIndex(previousState.questionIndex)
    setSelectedPath(previousState.selectedPath)
    setAnswers(previousState.answers)
    setNeedsBlend(previousState.needsBlend)
    setNeedsConfirmation(previousState.needsConfirmation)

    // Set the selected answer for the previous question
    const prevQuestions = (() => {
      if (randomizedQuestions) {
        if (!previousState.selectedPath) {
          return randomizedQuestions.entry
        }
        if (previousState.selectedPath === "fast-paced") return randomizedQuestions.fastPaced
        if (previousState.selectedPath === "structure") return randomizedQuestions.structure
        if (previousState.selectedPath === "relationship") return randomizedQuestions.relationship
        return []
      } else {
        if (!previousState.selectedPath) {
          return entryQuestions
        }
        return pathQuestions[previousState.selectedPath as keyof typeof pathQuestions] || []
      }
    })()

    const prevQuestion = prevQuestions[previousState.questionIndex]
    if (prevQuestion) {
      setSelectedAnswer(previousState.answers[prevQuestion.id] || "")
    }

    // Remove the last state from history
    setHistory((prev) => prev.slice(0, -1))
  }

  const updateQuizResultsInDatabase = async (quizResult: QuizResult) => {
    if (!userData) {
      console.error("No user data found for quiz results update")
      return
    }

    // Create influence style string
    let influenceStyle = quizResult.primary.charAt(0).toUpperCase() + quizResult.primary.slice(1)
    if (quizResult.secondary) {
      influenceStyle += `-${quizResult.secondary.charAt(0).toUpperCase() + quizResult.secondary.slice(1)}`
    }

    // Update user data with quiz results
    const updatedUser = {
      ...userData,
      quizCompleted: true,
      primaryInfluenceStyle: quizResult.primary.charAt(0).toUpperCase() + quizResult.primary.slice(1),
      secondaryInfluenceStyle: quizResult.secondary ? quizResult.secondary.charAt(0).toUpperCase() + quizResult.secondary.slice(1) : null,
      influenceStyle: influenceStyle,
      quizResult: quizResult,
      quizCompletedAt: new Date().toISOString(),
    }

    // Save to localStorage immediately
    localStorage.setItem("current_influence_user", JSON.stringify(updatedUser))
    console.log("Quiz results saved to localStorage:", updatedUser)

    // Also save to the local database utility
    try {
      const { localDB } = await import("@/lib/utils/local-storage-db")
      if (updatedUser.id) {
        await localDB.users.update(updatedUser.id, {
          quizCompleted: true,
          influenceStyle: updatedUser.influenceStyle,
        })
        console.log("Quiz results updated in localDB successfully")
      }
    } catch (error) {
      console.warn("LocalDB update failed:", error)
    }

    console.log("Quiz results saved successfully using localStorage simulation")
  }



  const saveUserData = async () => {
    if (!result) return

    // Create influence style string
    let influenceStyle = result.primary.charAt(0).toUpperCase() + result.primary.slice(1)
    if (result.secondary) {
      influenceStyle += `-${result.secondary.charAt(0).toUpperCase() + result.secondary.slice(1)}`
    }

    // Update user data with quiz results
    const updatedUser = {
      ...userData,
      quizCompleted: true,
      primaryInfluenceStyle: result.primary.charAt(0).toUpperCase() + result.primary.slice(1),
      secondaryInfluenceStyle: result.secondary ? result.secondary.charAt(0).toUpperCase() + result.secondary.slice(1) : null,
      influenceStyle: influenceStyle,
      quizResult: result,
      quizCompletedAt: new Date().toISOString(),
    }

    // Save to localStorage immediately
    localStorage.setItem("current_influence_user", JSON.stringify(updatedUser))
    console.log("User data saved to localStorage:", updatedUser)

    // Also save to the local database utility
    try {
      const { localDB } = await import("@/lib/utils/local-storage-db")
      if (updatedUser.id) {
        await localDB.users.update(updatedUser.id, {
          quizCompleted: true,
          influenceStyle: updatedUser.influenceStyle,
        })
        console.log("User data updated in localDB successfully")
      }
    } catch (error) {
      console.warn("LocalDB update failed:", error)
    }

    console.log("User data saved successfully using localStorage simulation")

    // Navigate to influence-demo
    router.push("/influence-demo")
  }

  const getResultDisplay = () => {
    if (!result) return null

    const primaryStyle = styleDescriptions[result.primary as keyof typeof styleDescriptions]
    const secondaryStyle = result.secondary
      ? styleDescriptions[result.secondary as keyof typeof styleDescriptions]
      : null

    if (result.isBlend && result.secondary) {
      const blendKey = `${result.primary}-${result.secondary}` as keyof typeof blendDescriptions
      const blendInfo = blendDescriptions[blendKey] || blendDescriptions[`${result.secondary}-${result.primary}` as keyof typeof blendDescriptions]

      return (
        <div className="text-center space-y-6">
          <div className="flex justify-center items-center space-x-4">
            <div className={`w-20 h-20 ${primaryStyle.color} rounded-full flex items-center justify-center text-white`}>
              {getInfluenceIcon(result.primary, "w-8 h-8")}
            </div>
            <div className="text-2xl font-bold text-gray-600">+</div>
            <div
              className={`w-20 h-20 ${secondaryStyle?.color} rounded-full flex items-center justify-center text-white`}
            >
              {getInfluenceIcon(result.secondary, "w-8 h-8")}
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {primaryStyle.name}–{secondaryStyle?.name} Blend
            </h2>
            <p className="text-lg text-gray-700 mb-4">{blendInfo?.description || "You have a unique blend of influence styles."}</p>
          </div>
        </div>
      )
    } else {
      return (
        <div className="text-center space-y-6">
          <div
            className={`w-24 h-24 ${primaryStyle.color} rounded-full flex items-center justify-center text-white mx-auto`}
          >
            {getInfluenceIcon(result.primary, "w-10 h-10")}
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Influence Style: {primaryStyle.name}</h2>
            <p className="text-lg text-gray-700">{primaryStyle.description}</p>
          </div>
        </div>
      )
    }
  }



  // Show loading state while user data is loading or questions are being randomized
  if (!userData || !randomizedQuestions) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#92278F] mx-auto mb-4"></div>
          <p className="text-gray-600">
            {!userData ? "Loading your information..." : "Preparing your personalized quiz..."}
          </p>
        </div>
      </div>
    )
  }

  if (currentStep === "result") {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#92278F] to-[#a83399] text-white py-12">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <img src="/logo.png" alt="Logo" className="w-12 h-12 rounded-full" />
              <span className="text-2xl font-bold tracking-tight">The Influence Engine™</span>
            </div>
            <h1 className="text-4xl font-bold mb-2">Your Influence Style Revealed!</h1>
            <p className="text-xl text-white/90">
              Discover how this style can transform your communication and leadership
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-12">
          <Card className="border-2 border-[#92278F]/20 bg-gradient-to-r from-[#92278F]/5 to-purple-50 mb-8">
            <CardContent className="p-8">{getResultDisplay()}</CardContent>
          </Card>

          {/* What This Means Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900 text-center">What This Means for You</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                             <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                 <h3 className="font-semibold text-blue-900 mb-2">🎯 Your Communication Strengths</h3>
                 <p className="text-blue-800">
                   {result?.isBlend && result.secondary
                     ? (() => {
                         const blendKey = `${result.primary}-${result.secondary}` as keyof typeof blendDescriptions
                         const blendInfo = blendDescriptions[blendKey] || blendDescriptions[`${result.secondary}-${result.primary}` as keyof typeof blendDescriptions]
                         return blendInfo?.strengths || "You have a unique blend of influence styles."
                       })()
                     : styleDescriptions[result?.primary as keyof typeof styleDescriptions]?.strengths || "You have strong communication abilities."}
                 </p>
               </div>

              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                <h3 className="font-semibold text-green-900 mb-2">🚀 How The Influence Engine™ Helps</h3>
                <p className="text-green-800">
                  The Influence Engine™ will adapt its coaching to your specific style, providing personalized guidance
                  that sounds like you and strengthens your natural influence patterns.
                </p>
              </div>

              <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-lg">
                <h3 className="font-semibold text-purple-900 mb-2">💡 Next Steps</h3>
                <p className="text-purple-800">
                  Ready to experience AI coaching that's calibrated to your unique style? Unlock personalized guidance for real-world situations.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* CTA Section */}
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Ready to Continue Your Journey?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Your influence style has been identified! Continue to watch the demo and get your personalized snapshot profile.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={saveUserData}
                className="bg-[#92278F] hover:bg-[#7a1f78] text-white px-8 py-3 text-lg font-semibold"
              >
                Continue to Demo
              </Button>
            </div>
            <p className="text-sm text-gray-500">Next: Watch the demo video to understand your influence style</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dynamic Header Based on Step */}
      <div className={`bg-gradient-to-r ${stepInfo.color} text-white py-8`}>
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center space-x-3">
              <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-full" />
              <span className="text-lg font-bold tracking-tight">The Influence Engine™</span>
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">{stepInfo.title}</h1>
            <p className="text-xl text-white/90 mb-4">{stepInfo.subtitle}</p>
            <p className="text-white/80 max-w-2xl mx-auto">{stepInfo.description}</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Progress Section */}
        <div className="mb-8">
                       <div className="flex justify-between items-center mb-4">
               <div className="text-sm text-gray-600">
                 {!selectedPath && !needsAlternative && !needsBlendClarity && !needsPressure && !needsConfirmation && `Question ${currentQuestionIndex + 1} of 2`}
                 {selectedPath && !needsAlternative && !needsBlendClarity && !needsPressure && !needsConfirmation && `Question ${currentQuestionIndex + 1} of 1`}
                 {needsAlternative && `Question ${currentQuestionIndex + 1} of ${currentQuestions.length}`}
                 {needsBlendClarity && `Question ${currentQuestionIndex + 1} of ${currentQuestions.length}`}
                 {needsPressure && `Question ${currentQuestionIndex + 1} of ${currentQuestions.length}`}
                 {needsConfirmation && `Question ${currentQuestionIndex + 1} of ${currentQuestions.length}`}
               </div>
               <div className="text-sm text-gray-600">{progress}% Complete</div>
             </div>
          <Progress value={progress} className="h-3 bg-gray-200" />
        </div>

        {/* Question Card */}
        <Card className="mb-8 border-2 border-gray-200 shadow-lg">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{currentQuestion?.question}</h2>
              <p className="text-gray-600">
                Choose the answer that best describes your natural approach. There are no wrong answers!
              </p>
            </div>

            <div className="space-y-4">
              {currentQuestion?.answers.map((answer) => (
                <button
                  key={answer.id}
                  onClick={() => handleAnswerSelect(answer.id)}
                  className={`w-full text-left p-6 rounded-xl border-2 transition-all duration-300 ${
                    selectedAnswer === answer.id
                      ? "border-[#92278F] bg-[#92278F]/10 shadow-md transform scale-[1.02]"
                      : "border-gray-200 hover:border-gray-300 bg-white hover:shadow-md"
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-colors ${
                        selectedAnswer === answer.id
                          ? "border-[#92278F] bg-[#92278F] text-white"
                          : "border-gray-400 text-gray-600"
                      }`}
                    >
                      {answer.id}
                    </div>
                    <span className="text-gray-800 leading-relaxed text-lg">{answer.text}</span>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={history.length === 0}
            className="flex items-center space-x-2 px-6 py-3 text-lg bg-transparent"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </Button>

          <Button
            onClick={handleNext}
            disabled={!selectedAnswer}
            className="bg-[#92278F] hover:bg-[#7a1f78] text-white flex items-center space-x-2 px-8 py-3 text-lg font-semibold"
          >
                         <span>
               {selectedPath && currentQuestionIndex === 1
                 ? "Continue"
                 : "Next"}
             </span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Brand Info Footer */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <p className="text-sm text-gray-600 mb-2">
              <strong>About This Quiz:</strong> This assessment is based on The Influence Engine™ methodology, designed
              to identify your natural communication and leadership patterns.
            </p>
            <p className="text-xs text-gray-500">
              Built on coaching intelligence • Personalized to your style • Trusted by professionals
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

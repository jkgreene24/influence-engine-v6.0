"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, Zap, Users, Anchor, Link, Navigation, MessageCircle } from "lucide-react"
import { useRouter } from "next/navigation"

interface QuizAnswer {
  id: string
  text: string
  styles: string[]
  isMix?: boolean
  isNone?: boolean
  altBank?: string
  analyticsTag?: string
}

interface QuizQuestion {
  id: string
  question: string
  answers: QuizAnswer[]
  isAlt?: boolean
  altBankFor?: string
}

interface QuizResult {
  primary: string
  secondary?: string
  isBlend: boolean
  scores: Record<string, number>
}

interface QuizState {
  currentQuestionIndex: number
  answers: Record<string, string>
  scores: Record<string, number>
  needsQ10: boolean
  analyticsData: Array<{
    questionId: string
    answerId: string
    analyticsTag: string
    timestamp: string
  }>
  history: Array<{
    questionIndex: number
    answers: Record<string, string>
    scores: Record<string, number>
    analyticsData: Array<{
      questionId: string
      answerId: string
      analyticsTag: string
      timestamp: string
    }>
    questionFlow: QuizQuestion[]
  }>
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

// Function to randomize answer order while maintaining A-C as styles, D as mix, E as none
const randomizeAnswers = (answers: QuizAnswer[], questionId: string, isAlt: boolean = false) => {
  // Separate style answers (A-C) from mix/none answers (D-E)
  const styleAnswers = answers.filter(a => !a.isMix && !a.isNone);
  const mixNoneAnswers = answers.filter(a => a.isMix || a.isNone);
  
  // Shuffle style answers
  const shuffledStyles = shuffleArray(styleAnswers);
  
  // Reconstruct with proper ordering
  const result: QuizAnswer[] = [];
  
  // Add shuffled style answers as A-C
  shuffledStyles.forEach((answer, index) => {
    const newId = String.fromCharCode(65 + index); // A, B, C
    result.push({
      ...answer,
      id: newId,
      // Keep the original analytics tag based on the original answer position
      analyticsTag: answer.analyticsTag || generateAnalyticsTag(questionId, answer.id, isAlt, answer.isMix, answer.isNone)
    });
  });
  
  // Add mix/none answers as D-E
  mixNoneAnswers.forEach((answer, index) => {
    const newId = String.fromCharCode(68 + index); // D, E
    result.push({
      ...answer,
      id: newId,
      // Keep the original analytics tag based on the original answer position
      analyticsTag: answer.analyticsTag || generateAnalyticsTag(questionId, answer.id, isAlt, answer.isMix, answer.isNone)
    });
  });
  
  return result;
};

// Function to generate analytics tag for an answer
const generateAnalyticsTag = (questionId: string, answerId: string, isAlt: boolean = false, isMix: boolean = false, isNone: boolean = false): string => {
  const prefix = isAlt ? `${questionId}_ALT` : questionId;
  
  if (isMix) {
    return `${prefix}_MIX`;
  } else if (isNone) {
    return `${prefix}_NONE`;
  } else {
    return `${prefix}_${answerId}`;
  }
};

// Core questions (Q1-Q9) with their alternate banks
const coreQuestions: QuizQuestion[] = [
  {
    id: "Q1",
    question: "How do you usually lead or influence others?",
    answers: [
      { id: "A", text: "Take charge and push things forward", styles: ["catalyst"], analyticsTag: "Q1_A" },
      { id: "B", text: "Build consensus and buy‑in", styles: ["diplomat"], analyticsTag: "Q1_B" },
      { id: "C", text: "Adapt depending on who's in the room", styles: ["navigator"], analyticsTag: "Q1_C" },
      { id: "D", text: "A mix of two or more of these", styles: ["catalyst", "diplomat", "navigator"], isMix: true, analyticsTag: "Q1_MIX" },
      { id: "E", text: "None of these feel right. Show me different options.", styles: [], isNone: true, altBank: "Q1-Alt", analyticsTag: "Q1_NONE" }
    ]
  },
      {
      id: "Q1-Alt",
      question: "How do you usually lead or influence others?",
      answers: [
        { id: "A", text: "Step back, listen, and provide calm direction", styles: ["anchor"] },
        { id: "B", text: "Connect people, ideas, or opportunities", styles: ["connector"] },
        { id: "C", text: "Spark vision and inspire bold action", styles: ["catalyst"] },
        { id: "D", text: "A mix of two or more of these", styles: ["anchor", "connector", "catalyst"], isMix: true }
      ],
      isAlt: true,
      altBankFor: "Q1"
    },
  {
    id: "Q2",
    question: "When things stall out, I usually…",
    answers: [
      { id: "A", text: "Talk to people and get everyone back on the same page", styles: ["diplomat"] },
      { id: "B", text: "Pause, give space, and let people cool off", styles: ["anchor"] },
      { id: "C", text: "Reframe the situation to highlight shared goals", styles: ["navigator"] },
      { id: "D", text: "A mix of two or more of these", styles: ["diplomat", "anchor", "navigator"], isMix: true },
      { id: "E", text: "None of these feel right. Show me different options.", styles: [], isNone: true, altBank: "Q2-Alt" }
    ]
  },
  {
    id: "Q2-Alt",
    question: "When things stall out, I usually…",
    answers: [
      { id: "A", text: "Light a fire to get people moving again", styles: ["catalyst"] },
      { id: "B", text: "Connect them to resources or people who can help", styles: ["connector"] },
      { id: "C", text: "Step back and provide clarity from outside the conflict", styles: ["navigator"] },
      { id: "D", text: "A mix of two or more of these", styles: ["catalyst", "connector", "navigator"], isMix: true }
    ],
    isAlt: true,
    altBankFor: "Q2"
  },
  {
    id: "Q3",
    question: "When making decisions, I usually…",
    answers: [
      { id: "A", text: "Move fast and push forward", styles: ["catalyst"] },
      { id: "B", text: "Take time and weigh risks carefully", styles: ["anchor"] },
      { id: "C", text: "Seek feedback and input before deciding", styles: ["diplomat"] },
      { id: "D", text: "A mix of two or more of these", styles: ["catalyst", "anchor", "diplomat"], isMix: true },
      { id: "E", text: "None of these feel right. Show me different options.", styles: [], isNone: true, altBank: "Q3-Alt" }
    ]
  },
      {
      id: "Q3-Alt",
      question: "When making decisions, I usually…",
      answers: [
        { id: "A", text: "Reframe options until the best path is clear", styles: ["navigator"] },
        { id: "B", text: "Find who can help us move faster", styles: ["connector"] },
        { id: "C", text: "Trust my intuition and act decisively", styles: ["catalyst"] },
        { id: "D", text: "A mix of two or more of these", styles: ["navigator", "connector", "catalyst"], isMix: true }
      ],
      isAlt: true,
      altBankFor: "Q3"
    },
  {
    id: "Q4",
    question: "When a situation feels uncertain or tense, I usually…",
    answers: [
      { id: "A", text: "Slow things down and create stability", styles: ["anchor"] },
      { id: "B", text: "Push forward with bold energy", styles: ["catalyst"] },
      { id: "C", text: "Look for common ground", styles: ["diplomat"] },
      { id: "D", text: "A mix of two or more of these", styles: ["anchor", "catalyst", "diplomat"], isMix: true },
      { id: "E", text: "None of these feel right. Show me different options.", styles: [], isNone: true, altBank: "Q4-Alt" }
    ]
  },
      {
      id: "Q4-Alt",
      question: "When a situation feels uncertain or tense, I usually…",
      answers: [
        { id: "A", text: "Step in with clarity and direction", styles: ["navigator"] },
        { id: "B", text: "Connect people to ease tension", styles: ["connector"] },
        { id: "C", text: "Share a vision that calms or inspires", styles: ["catalyst"] },
        { id: "D", text: "A mix of two or more of these", styles: ["navigator", "connector", "catalyst"], isMix: true }
      ],
      isAlt: true,
      altBankFor: "Q4"
    },
  {
    id: "Q5",
    question: "With a skeptical stakeholder or counterpart, my first move is to…",
    answers: [
      { id: "A", text: "Lay out a clear plan and next steps", styles: ["navigator"] },
      { id: "B", text: "Hear them out and rebuild common ground", styles: ["diplomat"] },
      { id: "C", text: "Paint a compelling vision of the upside", styles: ["catalyst"] },
      { id: "D", text: "A mix of two or more of these", styles: ["navigator", "diplomat", "catalyst"], isMix: true },
      { id: "E", text: "None of these feel right. Show me different options.", styles: [], isNone: true, altBank: "Q5-Alt" }
    ]
  },
      {
      id: "Q5-Alt",
      question: "With a skeptical stakeholder or counterpart, my first move is to…",
      answers: [
        { id: "A", text: "De‑risk the path and stabilize expectations", styles: ["anchor"] },
        { id: "B", text: "Bring in the right person/resource to unlock momentum", styles: ["connector"] },
        { id: "C", text: "Reframe success criteria so interests align", styles: ["diplomat"] },
        { id: "D", text: "A mix of two or more of these", styles: ["anchor", "connector", "diplomat"], isMix: true }
      ],
      isAlt: true,
      altBankFor: "Q5"
    },
  {
    id: "Q6",
    question: "In group settings, my natural role is…",
    answers: [
      { id: "A", text: "Bringing people together and making introductions", styles: ["connector"] },
      { id: "B", text: "Offering structure and direction", styles: ["navigator"] },
      { id: "C", text: "Inspiring with bold ideas", styles: ["catalyst"] },
      { id: "D", text: "A mix of two or more of these", styles: ["connector", "navigator", "catalyst"], isMix: true },
      { id: "E", text: "None of these feel right. Show me different options.", styles: [], isNone: true, altBank: "Q6-Alt" }
    ]
  },
      {
      id: "Q6-Alt",
      question: "In group settings, my natural role is…",
      answers: [
        { id: "A", text: "Keeping the group calm and steady", styles: ["anchor"] },
        { id: "B", text: "Making sure all voices are heard", styles: ["diplomat"] },
        { id: "C", text: "Suggesting new opportunities or collaborations", styles: ["connector"] },
        { id: "D", text: "A mix of two or more of these", styles: ["anchor", "diplomat", "connector"], isMix: true }
      ],
      isAlt: true,
      altBankFor: "Q6"
    },
  {
    id: "Q7",
    question: "When a group is divided, I'm most effective when I…",
    answers: [
      { id: "A", text: "Facilitate the conversation so everyone feels heard", styles: ["diplomat"] },
      { id: "B", text: "Propose clear structure and decision rules", styles: ["navigator"] },
      { id: "C", text: "Rally people around a motivating common goal", styles: ["catalyst"] },
      { id: "D", text: "A mix of two or more of these", styles: ["diplomat", "navigator", "catalyst"], isMix: true },
      { id: "E", text: "None of these feel right. Show me different options.", styles: [], isNone: true, altBank: "Q7-Alt" }
    ]
  },
      {
      id: "Q7-Alt",
      question: "When a group is divided, I'm most effective when I…",
      answers: [
        { id: "A", text: "Lower the temperature and restore stability", styles: ["anchor"] },
        { id: "B", text: "Connect key people privately to unblock movement", styles: ["connector"] },
        { id: "C", text: "Reframe the issue so trade‑offs are clearer", styles: ["navigator"] },
        { id: "D", text: "A mix of two or more of these", styles: ["anchor", "connector", "navigator"], isMix: true }
      ],
      isAlt: true,
      altBankFor: "Q7"
    },
  {
    id: "Q8",
    question: "When others are anxious or overwhelmed, I usually…",
    answers: [
      { id: "A", text: "Stay calm, slow things down, and provide stability", styles: ["anchor"] },
      { id: "B", text: "Fire up energy and motivate action", styles: ["catalyst"] },
      { id: "C", text: "Reframe the issue so it feels manageable", styles: ["navigator"] },
      { id: "D", text: "A mix of two or more of these", styles: ["anchor", "catalyst", "navigator"], isMix: true },
      { id: "E", text: "None of these feel right. Show me different options.", styles: [], isNone: true, altBank: "Q8-Alt" }
    ]
  },
      {
      id: "Q8-Alt",
      question: "When others are anxious or overwhelmed, I usually…",
      answers: [
        { id: "A", text: "Help them rebuild trust by listening", styles: ["diplomat"] },
        { id: "B", text: "Connect them to someone who can ease the load", styles: ["connector"] },
        { id: "C", text: "Share a bigger vision of why this matters", styles: ["catalyst"] },
        { id: "D", text: "A mix of two or more of these", styles: ["diplomat", "connector", "catalyst"], isMix: true }
      ],
      isAlt: true,
      altBankFor: "Q8"
    },
  {
    id: "Q9",
    question: "When moving a project forward, I'm most likely to…",
    answers: [
      { id: "A", text: "Spot opportunities and pull in the right people", styles: ["connector"] },
      { id: "B", text: "Keep steady progress without drama", styles: ["anchor"] },
      { id: "C", text: "Lay out milestones and structure", styles: ["navigator"] },
      { id: "D", text: "A mix of two or more of these", styles: ["connector", "anchor", "navigator"], isMix: true },
      { id: "E", text: "None of these feel right. Show me different options.", styles: [], isNone: true, altBank: "Q9-Alt" }
    ]
  },
      {
      id: "Q9-Alt",
      question: "When moving a project forward, I'm most likely to…",
      answers: [
        { id: "A", text: "Build trust so people feel safe committing", styles: ["diplomat"] },
        { id: "B", text: "Push hard and create urgency", styles: ["catalyst"] },
        { id: "C", text: "Step in with clarity and direction", styles: ["navigator"] },
        { id: "D", text: "A mix of two or more of these", styles: ["diplomat", "catalyst", "navigator"], isMix: true }
      ],
      isAlt: true,
      altBankFor: "Q9"
    }
];

// Q10 Clarifier question
const q10Question: QuizQuestion = {
  id: "Q10",
  question: "In a high‑pressure situation where the outcome is critical, I usually…",
  answers: [
    { id: "A", text: "Stay calm and steady so others can rely on me", styles: ["anchor"], analyticsTag: "Q10_A" },
    { id: "B", text: "Focus on building trust and alignment so people pull together", styles: ["diplomat"], analyticsTag: "Q10_B" },
    { id: "C", text: "Push forward with bold ideas and energy to break through", styles: ["catalyst"], analyticsTag: "Q10_C" },
    { id: "D", text: "Reframe the situation until the path is clear and structured", styles: ["navigator"], analyticsTag: "Q10_D" },
    { id: "E", text: "Connect the right people and resources to solve it", styles: ["connector"], analyticsTag: "Q10_E" }
  ]
};

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
    description:
      "You create momentum and drive outcomes. People follow you because of your energy, confidence, and push-forward mindset.",
    color: "bg-orange-500",
  },
  connector: {
    name: "Connector",
    description: "You build bridges. You create alignment and connection that brings people together to make progress.",
    color: "bg-purple-500",
  },
  anchor: {
    name: "Anchor",
    description:
      "You provide consistency and structure. People trust you because you're steady, clear, and dependable.",
    color: "bg-green-500",
  },
  navigator: {
    name: "Navigator",
    description: "You lead with vision and strategic thinking. You zoom out and keep the big picture in focus.",
    color: "bg-blue-500",
  },
  diplomat: {
    name: "Diplomat",
    description:
      "You influence through empathy and presence. People open up around you and feel understood and supported.",
    color: "bg-pink-500",
  },
}

const blendDescriptions = {
  "catalyst-navigator": "You combine bold momentum with smart strategy. People are drawn to your drive, but stay because of your clarity and planning.",
  "catalyst-connector": "You move fast and bring people with you. Your energy inspires others, and your ability to connect makes it contagious.",
  "catalyst-diplomat": "You lead with passion but always tune in to others. You push forward while creating space for feelings and nuance.",
  "catalyst-anchor": "You bring focused energy and long-term consistency. You push things forward without losing your grounding.",
  "navigator-catalyst": "You lead with strategy, then bring the fire when it counts. People trust your plan, but feel your urgency.",
  "navigator-connector": "You influence through insight and intuition. You read the situation and the people in it, helping everyone move forward together.",
  "navigator-diplomat": "You lead with clarity and compassion. People look to you for smart plans that also feel fair and considerate.",
  "navigator-anchor": "You combine strategy and steadiness. People trust you to think ahead and hold the line when it counts.",
  "connector-catalyst": "You lead with relationships and energize others to move. Your influence feels both personal and powerful.",
  "connector-navigator": "You build trust quickly — then guide people with clarity. You connect on a human level and show them what's possible.",
  "connector-diplomat": "You connect deeply and calmly. People trust you because you listen, reflect, and create emotional safety.",
  "connector-anchor": "You're emotionally tuned-in and unwavering. People feel safe opening up to you because you're both relatable and reliable.",
  "diplomat-catalyst": "You lead with empathy and add fire when it matters. People feel your care but also your conviction.",
  "diplomat-navigator": "You guide with empathy and strategic thinking. You're emotionally grounded and intellectually clear.",
  "diplomat-connector": "You influence through emotional insight and connection. You make people feel understood, valued, and motivated to engage.",
  "diplomat-anchor": "You are a calm force of trust. People open up because you're steady and emotionally present — a rock in high-stakes moments.",
  "anchor-catalyst": "You're steady and strong — with a surprising ability to ignite momentum when needed. People rely on your foundation and follow your lead when you decide to move.",
  "anchor-navigator": "You bring stability and foresight. People trust you to plan ahead and stick with the process until the outcome is secure.",
  "anchor-connector": "You are loyal, grounded, and people-first. You build long-term trust through presence and relational consistency.",
  "anchor-diplomat": "You offer emotional steadiness and wisdom. People feel safe sharing with you because you lead with quiet confidence.",
}

export default function QuickQuiz() {
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestionIndex: 0,
    answers: {},
    scores: {
      anchor: 0,
      diplomat: 0,
      catalyst: 0,
      navigator: 0,
      connector: 0
    },
    needsQ10: false,
    analyticsData: [],
    history: []
  });
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [result, setResult] = useState<QuizResult | null>(null);
  const [randomizedQuestions, setRandomizedQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionFlow, setCurrentQuestionFlow] = useState<QuizQuestion[]>([]);
  const router = useRouter();

  // Initialize randomized questions
  useEffect(() => {
    const randomized = coreQuestions.map(q => ({
      ...q,
      answers: randomizeAnswers(q.answers, q.id, q.isAlt || false)
    }));
    setRandomizedQuestions(randomized);
    
    // Set initial question flow (Q1-Q9)
    const initialFlow = randomized.filter(q => !q.isAlt);
    setCurrentQuestionFlow(initialFlow);
  }, []);

  const currentQuestion = currentQuestionFlow[quizState.currentQuestionIndex];

  // Calculate progress
  const getProgress = () => {
    const totalQuestions = currentQuestionFlow.length;
    return Math.round(((quizState.currentQuestionIndex + 1) / totalQuestions) * 100);
  };

  const progress = getProgress();

  // Calculate scores based on answers (normalized by 3x to avoid floating-point precision issues)
  const calculateScores = (answers: Record<string, string>): Record<string, number> => {
    const scores = {
      anchor: 0,
      diplomat: 0,
      catalyst: 0,
      navigator: 0,
      connector: 0
    };

    console.log("=== CALCULATING SCORES ===");
    console.log("Current answers:", answers);

    Object.entries(answers).forEach(([questionId, answerId]) => {
      console.log(`\n--- Processing ${questionId}, Answer ${answerId} ---`);
      
      const question = randomizedQuestions.find(q => q.id === questionId);
      if (!question) {
        console.log(`❌ Question ${questionId} not found in randomizedQuestions`);
        return;
      }

      const answer = question.answers.find(a => a.id === answerId);
      if (!answer) {
        console.log(`❌ Answer ${answerId} not found in question ${questionId}`);
        return;
      }

      console.log(`✅ Found answer: "${answer.text}"`);
      console.log(`   Styles: ${answer.styles.join(', ')}`);
      console.log(`   isMix: ${answer.isMix}`);
      console.log(`   isNone: ${answer.isNone}`);
      console.log(`   Analytics tag: ${answer.analyticsTag}`);

      if (answer.isMix && answer.styles.length > 0) {
        // Split +3 evenly across styles (normalized to avoid floating-point issues)
        const pointsPerStyle = 3 / answer.styles.length;
        console.log(`   📊 MIX answer - splitting ${pointsPerStyle} points per style (normalized: +3 total)`);
        answer.styles.forEach(style => {
          if (scores[style as keyof typeof scores] !== undefined) {
            const oldScore = scores[style as keyof typeof scores];
            scores[style as keyof typeof scores] += pointsPerStyle;
            console.log(`   ➕ ${style}: ${oldScore} → ${scores[style as keyof typeof scores]} (+${pointsPerStyle})`);
          }
        });
      } else if (!answer.isNone && answer.styles.length > 0) {
        // Style answers = +3 to each mapped style (normalized)
        console.log(`   📊 STYLE answer - adding 3 points per style (normalized)`);
        answer.styles.forEach(style => {
          if (scores[style as keyof typeof scores] !== undefined) {
            const oldScore = scores[style as keyof typeof scores];
            scores[style as keyof typeof scores] += 3;
            console.log(`   ➕ ${style}: ${oldScore} → ${scores[style as keyof typeof scores]} (+3)`);
          }
        });
      } else {
        console.log(`   ⚠️ No points added (isNone: ${answer.isNone}, styles: ${answer.styles.length})`);
      }
    });

    console.log("\n=== FINAL SCORES ===");
    Object.entries(scores).forEach(([style, score]) => {
      console.log(`${style}: ${score}`);
    });
    console.log("=====================\n");

    return scores;
  };

  // Determine if Q10 is needed
  const needsQ10 = (scores: Record<string, number>): boolean => {
    const sortedScores = Object.entries(scores)
      .sort(([, a], [, b]) => b - a)
      .filter(([, score]) => score > 0);

    if (sortedScores.length < 2) return false;

    const [primaryStyle, primaryScore] = sortedScores[0];
    const [secondaryStyle, secondaryScore] = sortedScores[1];

    // Only trigger Q10 if top two are within 3 points (normalized scoring)
    // Remove the "scattered across 3+" condition as it's causing false positives
    const withinOnePoint = Math.abs(primaryScore - secondaryScore) <= 3;

    console.log(`\n=== Q10 DECISION ===`);
    console.log(`Primary: ${primaryStyle} (${primaryScore})`);
    console.log(`Secondary: ${secondaryStyle} (${secondaryScore})`);
    console.log(`Score difference: ${Math.abs(primaryScore - secondaryScore)}`);
    console.log(`Within 3 points (normalized): ${withinOnePoint}`);
    console.log(`Q10 needed: ${withinOnePoint}`);
    console.log(`=====================\n`);

    return withinOnePoint;
  };

  // Calculate final result
  const calculateResult = (scores: Record<string, number>, q10Answer?: string): QuizResult => {
    console.log("=== CALCULATING FINAL RESULT ===");
    console.log("Initial scores:", scores);
    console.log("Q10 answer:", q10Answer);
    
    let finalScores = { ...scores };

    // Add Q10 score if provided
    if (q10Answer) {
      console.log("\n--- Processing Q10 ---");
      const q10AnswerObj = q10Question.answers.find(a => a.id === q10Answer);
      if (q10AnswerObj) {
        console.log(`✅ Q10 answer: "${q10AnswerObj.text}"`);
        console.log(`   Styles: ${q10AnswerObj.styles.join(', ')}`);
        console.log(`   Analytics tag: ${q10AnswerObj.analyticsTag}`);
        
        q10AnswerObj.styles.forEach(style => {
          if (finalScores[style as keyof typeof finalScores] !== undefined) {
            const oldScore = finalScores[style as keyof typeof finalScores];
            finalScores[style as keyof typeof finalScores] += 3;
            console.log(`   ➕ ${style}: ${oldScore} → ${finalScores[style as keyof typeof finalScores]} (+3)`);
          }
        });
      } else {
        console.log(`❌ Q10 answer ${q10Answer} not found`);
      }
    }

    console.log("\n--- Final scores after Q10 ---");
    Object.entries(finalScores).forEach(([style, score]) => {
      console.log(`${style}: ${score}`);
    });

    const sortedScores = Object.entries(finalScores)
      .sort(([, a], [, b]) => b - a)
      .filter(([, score]) => score > 0);

    console.log("\n--- Sorted scores (filtered) ---");
    sortedScores.forEach(([style, score], index) => {
      console.log(`${index + 1}. ${style}: ${score}`);
    });

    if (sortedScores.length === 0) {
      console.log("⚠️ No scores > 0, defaulting to catalyst");
      return {
        primary: "catalyst",
        isBlend: false,
        scores: finalScores
      };
    }

    const [primaryStyle, primaryScore] = sortedScores[0];
    const [secondaryStyle, secondaryScore] = sortedScores[1] || [null, 0];

    // Determine if it's a blend (top two within 3 points - normalized scoring)
    const isBlend = secondaryStyle && Math.abs(primaryScore - secondaryScore) <= 3;
    
    console.log(`\n--- RESULT ---`);
    console.log(`Primary: ${primaryStyle} (${primaryScore})`);
    console.log(`Secondary: ${secondaryStyle} (${secondaryScore})`);
    console.log(`Is blend: ${isBlend}`);
    console.log(`Score difference: ${Math.abs(primaryScore - secondaryScore)} (normalized)`);

    const result = {
      primary: primaryStyle,
      secondary: isBlend ? secondaryStyle : undefined,
      isBlend: !!isBlend,
      scores: finalScores
    };

    console.log("Final result:", result);
    console.log("=============================\n");

    return result;
  };

  const handleAnswerSelect = (answerId: string) => {
    setSelectedAnswer(answerId);
  };

  const saveCurrentState = () => {
    const newHistory = [...quizState.history, {
      questionIndex: quizState.currentQuestionIndex,
      answers: { ...quizState.answers },
      scores: { ...quizState.scores },
      analyticsData: [...quizState.analyticsData],
      questionFlow: [...currentQuestionFlow]
    }];
    setQuizState(prev => ({ ...prev, history: newHistory }));
  };

  const handleNext = () => {
    if (!selectedAnswer || !currentQuestion) return;

    saveCurrentState();

    // Get the selected answer object to extract analytics tag
    const selectedAnswerObjForAnalytics = currentQuestion.answers.find(a => a.id === selectedAnswer);
    const analyticsTag = selectedAnswerObjForAnalytics?.analyticsTag || `${currentQuestion.id}_${selectedAnswer}`;

    // Add analytics data (this will capture Q10 answers too)
    const newAnalyticsData = [
      ...quizState.analyticsData,
      {
        questionId: currentQuestion.id,
        answerId: selectedAnswer,
        analyticsTag: analyticsTag,
        timestamp: new Date().toISOString()
      }
    ];

    const newAnswers = {
      ...quizState.answers,
      [currentQuestion.id]: selectedAnswer
    };

    const newScores = calculateScores(newAnswers);
    const needsQ10Clarifier = needsQ10(newScores);

    setQuizState(prev => ({
      ...prev,
      answers: newAnswers,
      scores: newScores,
      needsQ10: needsQ10Clarifier,
      analyticsData: newAnalyticsData
    }));

    // Check if answer routes to alt bank
    const selectedAnswerObj = currentQuestion.answers.find(a => a.id === selectedAnswer);
    if (selectedAnswerObj?.isNone && selectedAnswerObj.altBank) {
      // Route to alt bank
      const altQuestion = randomizedQuestions.find(q => q.id === selectedAnswerObj.altBank);
      if (altQuestion) {
        const newFlow = [...currentQuestionFlow];
        newFlow[quizState.currentQuestionIndex] = altQuestion;
        setCurrentQuestionFlow(newFlow);
      }
    } else {
      // Move to next question
      const nextIndex = quizState.currentQuestionIndex + 1;
      
      if (nextIndex >= currentQuestionFlow.length) {
        // Quiz completed - check if Q10 is needed
        if (needsQ10Clarifier && !currentQuestionFlow.some(q => q.id === "Q10")) {
          // Add Q10 to flow
          const q10Randomized = {
            ...q10Question,
            answers: randomizeAnswers(q10Question.answers, "Q10", false)
          };
          setCurrentQuestionFlow([...currentQuestionFlow, q10Randomized]);
          setQuizState(prev => ({ ...prev, currentQuestionIndex: nextIndex }));
        } else {
          // Calculate final result (including Q10 if it was answered)
          const finalResult = calculateResult(newScores, newAnswers["Q10"]);
          setResult(finalResult);
          // Save analytics data including Q10 before updating database
          updateQuizResultsInDatabase(finalResult, newAnalyticsData);
        }
      } else {
        setQuizState(prev => ({ ...prev, currentQuestionIndex: nextIndex }));
      }
    }

    setSelectedAnswer("");
  };

  const handlePrevious = () => {
    if (quizState.history.length === 0) return;

    const previousState = quizState.history[quizState.history.length - 1];
    const newHistory = quizState.history.slice(0, -1);

    setQuizState(prev => ({
      ...prev,
      currentQuestionIndex: previousState.questionIndex,
      answers: previousState.answers,
      scores: previousState.scores,
      history: newHistory
    }));

    // Restore the question flow from history
    setCurrentQuestionFlow(previousState.questionFlow);

    // Set selected answer for previous question
    const prevQuestion = previousState.questionFlow[previousState.questionIndex];
    if (prevQuestion) {
      setSelectedAnswer(previousState.answers[prevQuestion.id] || "");
    }
  };

  const updateQuizResultsInDatabase = async (quizResult: QuizResult, analyticsData?: Array<{
    questionId: string
    answerId: string
    analyticsTag: string
    timestamp: string
  }>) => {
    let currentUser = JSON.parse(localStorage.getItem("current_influence_user") || "null");
    
    if (!currentUser) {
      console.error("No user data found for quiz results update");
      return;
    }

    let influenceStyle = quizResult.primary.charAt(0).toUpperCase() + quizResult.primary.slice(1);
    if (quizResult.secondary) {
      influenceStyle += `-${quizResult.secondary.charAt(0).toUpperCase() + quizResult.secondary.slice(1)}`;
    }

    const updatedDBUser = {
      ...currentUser,
      quizCompleted: true,
      influenceStyle: influenceStyle,
      quizResult: quizResult,
      quizCompletedAt: new Date().toISOString(),
    };

    const response = await fetch("/api/update-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedDBUser),
    });
    
    if (response.ok) {
      console.log("Quiz results updated successfully in database");
      
      // Save quiz selections to database (use passed analyticsData or fall back to state)
      const dataToSave = analyticsData || quizState.analyticsData;
      await saveQuizSelectionsToDatabase(currentUser.id, dataToSave);
    } else {
      console.error("Failed to update quiz results in database");
    }
  };

  const saveQuizSelectionsToDatabase = async (userId: string | number, analyticsData: Array<{
    questionId: string
    answerId: string
    analyticsTag: string
    timestamp: string
  }>) => {
    try {
      const response = await fetch("/api/save-quiz-analytics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          analyticsData: analyticsData
        }),
      });
      
      if (response.ok) {
        console.log("Quiz selections saved successfully");
      } else {
        console.error("Failed to save quiz selections");
      }
    } catch (error) {
      console.error("Error saving quiz selections:", error);
    }
  };

  const saveUserData = async () => {
    if (!result) return;

    let currentUser = JSON.parse(localStorage.getItem("current_influence_user") || "null");
    
    if (!currentUser) {
      router.push("/");
      return;
    }

    // Store the raw style names (lowercase) for the funnel
    const updatedUser = {
      ...currentUser,
      quizCompleted: true,
      primaryInfluenceStyle: result.primary,
      secondaryInfluenceStyle: result.secondary || null,
      influenceStyle: result.primary, // Use the raw primary style for funnel
      quizResult: result,
      quizCompletedAt: new Date().toISOString(),
    };

    console.log("Saving user data to localStorage:", updatedUser);
    localStorage.setItem("current_influence_user", JSON.stringify(updatedUser));
    console.log("Redirecting to post-quiz-funnel");
    router.push("/post-quiz-funnel");
  };

  const getResultDisplay = () => {
    if (!result) return null;

    const primaryStyle = styleDescriptions[result.primary as keyof typeof styleDescriptions];
    const secondaryStyle = result.secondary
      ? styleDescriptions[result.secondary as keyof typeof styleDescriptions]
      : null;

    if (result.isBlend && result.secondary) {
      const blendKey = `${result.primary}-${result.secondary}` as keyof typeof blendDescriptions;
      const blendDescription =
        blendDescriptions[blendKey] ||
        blendDescriptions[`${result.secondary}-${result.primary}` as keyof typeof blendDescriptions];

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
            <p className="text-lg text-gray-700 mb-4">{blendDescription}</p>
          </div>
        </div>
      );
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
      );
    }
  };

  // Show loading state while randomizing questions
  if (!randomizedQuestions.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#92278F] mx-auto mb-4"></div>
          <p className="text-gray-600">Preparing your personalized quiz...</p>
        </div>
      </div>
    );
  }

  // Show results
  if (result) {
    return (
      <div className="min-h-screen bg-gray-50">
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

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900 text-center">What This Means for You</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <h3 className="font-semibold text-blue-900 mb-2">🎯 Your Communication Strengths</h3>
                <p className="text-blue-800">
                  {result?.isBlend && result.secondary
                    ? `As a ${styleDescriptions[result.primary as keyof typeof styleDescriptions].name}–${styleDescriptions[result.secondary as keyof typeof styleDescriptions].name} blend, you have the unique ability to adapt your approach based on the situation.`
                    : `Your ${styleDescriptions[result?.primary as keyof typeof styleDescriptions]?.name} style means you naturally excel at ${styleDescriptions[result?.primary as keyof typeof styleDescriptions]?.description.toLowerCase()}`}
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

          <div className="text-center space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Ready to Continue Your Journey?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Your influence style has been identified! Get your personalized snapshot and discover your next steps.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={saveUserData}
                className="bg-[#92278F] hover:bg-[#7a1f78] text-white px-8 py-3 text-lg font-semibold"
              >
                Get My Snapshot →
              </Button>
            </div>
            <p className="text-sm text-gray-500">Next: Your personalized influence style snapshot</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-[#92278F] to-purple-600 text-white py-8">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center space-x-3">
              <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-full" />
              <span className="text-lg font-bold tracking-tight">The Influence Engine™</span>
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Influence Style Assessment</h1>
            <p className="text-xl text-white/90 mb-4">Discover your natural communication and leadership patterns</p>
            <p className="text-white/80 max-w-2xl mx-auto">
              Answer these questions based on your natural approach. There are no right or wrong answers!
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-gray-600">
              Question {quizState.currentQuestionIndex + 1} of {currentQuestionFlow.length}
            </div>
            <div className="text-sm text-gray-600">{progress}% Complete</div>
          </div>
          <Progress value={progress} className="h-3 bg-gray-200" />
        </div>

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

        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={quizState.history.length === 0}
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
              {quizState.currentQuestionIndex === currentQuestionFlow.length - 1
                ? "Get My Results"
                : "Next"}
            </span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

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
  );
}

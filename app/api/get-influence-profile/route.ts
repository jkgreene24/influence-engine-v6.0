import { NextResponse } from "next/server";

// Mock influence profiles data for localStorage simulation
const mockInfluenceProfiles = {
  catalyst: {
    influence_style: "catalyst",
    title: "The Catalyst",
    description: "You're a natural momentum builder who drives action and creates urgency.",
    strengths: ["Creating urgency", "Driving action", "Building momentum"],
    challenges: ["May overwhelm others", "Could rush decisions"],
    recommendations: ["Practice patience", "Listen more", "Build consensus"]
  },
  navigator: {
    influence_style: "navigator",
    title: "The Navigator",
    description: "You excel at seeing the big picture and creating clear strategic direction.",
    strengths: ["Strategic thinking", "Big picture vision", "Clear direction"],
    challenges: ["May miss details", "Could be too abstract"],
    recommendations: ["Focus on implementation", "Provide concrete steps", "Connect vision to action"]
  },
  diplomat: {
    influence_style: "diplomat",
    title: "The Diplomat",
    description: "You create emotional safety and build strong human connections.",
    strengths: ["Emotional intelligence", "Conflict resolution", "Building trust"],
    challenges: ["May avoid difficult conversations", "Could prioritize harmony over results"],
    recommendations: ["Embrace healthy conflict", "Set clear boundaries", "Balance empathy with accountability"]
  },
  anchor: {
    influence_style: "anchor",
    title: "The Anchor",
    description: "You provide stability and reliable execution in any situation.",
    strengths: ["Reliability", "Attention to detail", "Steady execution"],
    challenges: ["May resist change", "Could be too rigid"],
    recommendations: ["Embrace flexibility", "Share your process", "Help others build systems"]
  },
  connector: {
    influence_style: "connector",
    title: "The Connector",
    description: "You excel at building bridges between people and ideas.",
    strengths: ["Networking", "Finding common ground", "Building relationships"],
    challenges: ["May spread too thin", "Could avoid taking sides"],
    recommendations: ["Focus your energy", "Take clear positions", "Leverage your network strategically"]
  }
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const influenceStyle = searchParams.get('style');
    
    if (!influenceStyle) {
      return NextResponse.json({ error: "Influence style is required" }, { status: 400 });
    }

    const profile = mockInfluenceProfiles[influenceStyle as keyof typeof mockInfluenceProfiles];

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 
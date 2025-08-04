import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const influenceStyle = searchParams.get('style');
    
    if (!influenceStyle) {
      return NextResponse.json({ error: "Influence style is required" }, { status: 400 });
    }

    const supabase = await createClient();
    
    // Query the influence_profiles table for the specific style
    const { data, error } = await supabase
      .from("influence_profiles")
      .select("*")
      .eq("influence_style", influenceStyle)
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 
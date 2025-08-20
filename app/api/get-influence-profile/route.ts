import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const influenceStyle = searchParams.get('style');
    
    console.log("API called with influence style:", influenceStyle);
    
    if (!influenceStyle) {
      return NextResponse.json({ error: "Influence style is required" }, { status: 400 });
    }

    // Create Supabase client
    const supabase = await createClient();

    // Query the influence_profiles table for the specific style
    // Try exact match first, then case-insensitive match
    let { data: profile, error } = await supabase
      .from('influence_profiles')
      .select('*')
      .eq('influence_style', influenceStyle.toLowerCase())
      .single();

    // If not found, try case-insensitive search
    if (!profile && !error) {
      const { data: profiles, error: searchError } = await supabase
        .from('influence_profiles')
        .select('*')
        .ilike('influence_style', influenceStyle.toLowerCase());
      
      if (profiles && profiles.length > 0) {
        profile = profiles[0];
        error = null;
      } else {
        error = searchError;
      }
    }

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    if (!profile) {
      console.log("No profile found for style:", influenceStyle);
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    console.log("Profile found:", profile);
    return NextResponse.json(profile);
  } catch (error) {
    console.error("Route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 
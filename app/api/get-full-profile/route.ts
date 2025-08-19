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
    const { data: profile, error } = await supabase
      .from('influence_profiles')
      .select('*')
      .eq('influence_style', influenceStyle.toLowerCase())
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
    }

    if (!profile) {
      console.log("No profile found for style:", influenceStyle);
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    console.log("Profile found:", profile);
    
    // Parse the full_profile JSON if it's stored as text
    let fullProfile;
    try {
      fullProfile = typeof profile.full_profile === 'string' 
        ? JSON.parse(profile.full_profile) 
        : profile.full_profile;
    } catch (parseError) {
      console.error("Error parsing full_profile:", parseError);
      fullProfile = profile.full_profile;
    }

    return NextResponse.json(fullProfile);
  } catch (error) {
    console.error("Route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 
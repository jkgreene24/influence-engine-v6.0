import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    console.log("Inserting new user:", body);
    
    // Create Supabase client
    const supabase = await createClient();
    
    // Insert user into Supabase
    const { data: user, error } = await supabase
      .from('influence_users')
      .insert({
        first_name: body.firstName,
        last_name: body.lastName,
        email: body.email,
        phone: body.phone || null,
        company: body.company || null,
        role: body.role || null,
        email_verified: body.emailVerified ?? false,
        quiz_completed: body.quizCompleted ?? false,
        demo_watched: body.demoWatched ?? false,
        nda_signed: body.ndaSigned ?? false,
        signature_url: body.signatureData || null,
        influence_style: body.influenceStyle || null,
        paid_at: body.paidAt || null,
        paid_for: body.paidFor || null,
        nda_digital_signature: body.ndaDigitalSignature || null,
        // Source tracking as JSONB
        source_tracking: body.sourceTracking || null,
      })
      .select()
      .single();
    
    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
    }
    
    console.log("User created successfully:", user);
    
    // Return the created user
    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("Route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  console.log("=== UPDATE USER API ROUTE CALLED ===");
  try {
    console.log("Update user request received");
    
    const body = await request.json();
    
         console.log("Request body:", { 
       id: body.id,
       email: body.email, 
       ndaSigned: body.ndaSigned,
       hasSignatureData: !!body.signatureData,
       quizCompleted: body.quizCompleted,
       influenceStyle: body.influenceStyle,
       demoWatched: body.demoWatched,
       ndaDigitalSignature: body.ndaDigitalSignature,
     });
    
    // Create Supabase client
    console.log("Creating Supabase client...");
    console.log("Environment check:", {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    });
    const supabase = await createClient();
    console.log("Supabase client created successfully");
    
    // Prepare updates for Supabase
    const updates: any = {};
         if (body.ndaSigned !== undefined) updates.nda_signed = body.ndaSigned;
     if (body.signatureData !== undefined) updates.signature_url = body.signatureData;
     if (body.ndaDigitalSignature !== undefined) updates.nda_digital_signature = body.ndaDigitalSignature;
     if (body.influenceStyle !== undefined) updates.influence_style = body.influenceStyle;
     if (body.quizCompleted !== undefined) updates.quiz_completed = body.quizCompleted;
     if (body.demoWatched !== undefined) updates.demo_watched = body.demoWatched;
     // Note: paid_at and paid_for are only updated by Stripe webhook after successful payment
    
    console.log("Updates to apply:", updates);
    console.log("User ID to update:", body.id);
    console.log("User ID type:", typeof body.id);
         console.log("Database field mappings:");
     console.log("- ndaSigned -> nda_signed:", body.ndaSigned);
     console.log("- ndaDigitalSignature -> nda_digital_signature:", body.ndaDigitalSignature);
    
    // Convert ID to number if it's a string
    const userId = typeof body.id === 'string' ? parseInt(body.id, 10) : body.id;
    console.log("Converted user ID:", userId, "Type:", typeof userId);
    
    // Update user in Supabase
    const { data: updatedUser, error } = await supabase
      .from('influence_users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      console.error("Supabase error:", error);
      console.error("Error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return NextResponse.json({ error: "Failed to update user", details: error.message }, { status: 500 });
    }
    
    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    console.log("User updated successfully:", updatedUser);
    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error("Route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
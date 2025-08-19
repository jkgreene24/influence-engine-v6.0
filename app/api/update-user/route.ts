import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    console.log("Update user request received");
    
    const body = await request.json();
    
    console.log("Request body:", { 
      id: body.id,
      email: body.email, 
      ndaSigned: body.ndaSigned,
      hasSignatureData: !!body.signatureData,
    });
    
    // Create Supabase client
    const supabase = await createClient();
    
    // Prepare updates for Supabase
    const updates: any = {};
    if (body.ndaSigned !== undefined) updates.nda_signed = body.ndaSigned;
    if (body.signatureData !== undefined) updates.signature_url = body.signatureData;
    if (body.ndaDigitalSignature !== undefined) updates.nda_digital_signature = body.ndaDigitalSignature;
    if (body.influenceStyle !== undefined) updates.influence_style = body.influenceStyle;
    if (body.quizCompleted !== undefined) updates.quiz_completed = body.quizCompleted;
    if (body.demoWatched !== undefined) updates.demo_watched = body.demoWatched;
    if (body.paidAt !== undefined) updates.paid_at = body.paidAt;
    if (body.paidFor !== undefined) updates.paid_for = body.paidFor;
    if (body.cart !== undefined) updates.paid_for = body.cart.join(','); // Store cart as comma-separated string
    
    console.log("Updates to apply:", updates);
    
    // Update user in Supabase
    const { data: updatedUser, error } = await supabase
      .from('influence_users')
      .update(updates)
      .eq('id', body.id)
      .select()
      .single();
    
    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
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
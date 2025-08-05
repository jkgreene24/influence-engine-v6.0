import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    console.log("Update payment status request received");
    
    const supabase = await createClient();
    const body = await request.json();
    const { userEmail } = body;
    
    console.log("Updating payment status for user:", userEmail);
    
    // Update the user's paid_at timestamp
    const { data, error } = await supabase
      .from("influence_users")
      .update({ 
        paid_at: new Date().toISOString() 
      })
      .eq("email", userEmail)
      .select();
      
    if (error) {
      console.error("Supabase update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    console.log("Payment status updated successfully:", data);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 
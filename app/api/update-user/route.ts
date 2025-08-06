import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { toDbFormat } from "@/lib/utils/db-conversions";

export async function POST(request: Request) {
  try {
    console.log("Update user request received");
    
    const supabase = await createClient();
    const body = await request.json();
    
    console.log("Request body:", { 
      id: body.id,
      email: body.email, 
      ndaSigned: body.ndaSigned,
      hasSignatureData: !!body.signatureData,
    });
    
    const user = toDbFormat(body);
    console.log("Converted to DB format:", { 
      id: user.id,
      email: user.email, 
      nda_signed: user.nda_signed,
      has_signature_url: !!user.signature_url,
    });
    
    const { data, error } = await supabase
      .from("influence_users")
      .update(user)
      .eq("id", body.id)
      .select();
      
    if (error) {
      console.error("Supabase update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    console.log("User updated successfully:", data);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
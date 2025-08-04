import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { toDbFormat } from "@/lib/utils/db-conversions";

export async function POST(request: Request) {
  try {
    console.log("Environment variables check:");
    console.log("SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Missing");
    console.log("SERVICE_ROLE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "Set" : "Missing");
    
    const supabase = await createClient();
    const body = await request.json();
    
    // Convert frontend format to database format
    const dbData = toDbFormat(body);
    
    console.log("Attempting to insert:", dbData);
    
    const { data, error } = await supabase.from("influence_users").insert(dbData);
    
    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    console.log("Insert successful:", data);
    
    // Return the data as-is, let frontend handle conversion if needed
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
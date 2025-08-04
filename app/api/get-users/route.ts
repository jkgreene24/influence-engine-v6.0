import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { fromDbFormatArray } from "@/lib/utils/db-conversions";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("influence_users").select("*");

    if (error) {
      console.error("Get users error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Convert database format to frontend format
    const users = fromDbFormatArray(data || []);
    return NextResponse.json(users);
  } catch (error) {
    console.error("Route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
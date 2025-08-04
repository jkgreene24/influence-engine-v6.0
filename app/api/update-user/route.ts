import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { toDbFormat } from "@/lib/utils/db-conversions";

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();
  const user = toDbFormat(body)
  const { data, error } = await supabase.from("influence_users").update(user).eq("email", body.email);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}
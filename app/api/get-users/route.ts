import { NextResponse } from "next/server";
import { localDB } from "@/lib/utils/local-storage-db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (email) {
      // Get specific user by email
      const user = await localDB.users.getByEmail(email);
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: user });
    } else {
      // Get all users
      const users = await localDB.users.getAll();
      return NextResponse.json({ success: true, data: users });
    }
  } catch (error) {
    console.error("Route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

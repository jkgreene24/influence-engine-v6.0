import { NextResponse } from "next/server";
import { localDB } from "@/lib/utils/local-storage-db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    console.log("Inserting new user:", body);
    
    // Create user in localStorage database
    const user = await localDB.users.create({
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone || '',
      company: body.company || '',
      role: body.role || '',
      emailVerified: body.emailVerified ?? false,
      quizCompleted: body.quizCompleted ?? false,
      demoWatched: body.demoWatched ?? false,
      ndaSigned: body.ndaSigned ?? false,
      signatureData: body.signatureData || '',
      paidAt: body.paidAt || '',
      paidFor: body.paidFor || '',
    });
    
    console.log("User created successfully:", user);
    
    // Return the created user
    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("Route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
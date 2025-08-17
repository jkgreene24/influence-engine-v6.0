import { NextResponse } from "next/server";
import { localDB } from "@/lib/utils/local-storage-db";

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
    
    // Prepare updates for localStorage
    const updates: any = {};
    if (body.ndaSigned !== undefined) updates.ndaSigned = body.ndaSigned;
    if (body.signatureData !== undefined) updates.signatureData = body.signatureData;
    if (body.influenceStyle !== undefined) updates.influenceStyle = body.influenceStyle;
    if (body.quizCompleted !== undefined) updates.quizCompleted = body.quizCompleted;
    if (body.demoWatched !== undefined) updates.demoWatched = body.demoWatched;
    if (body.paidAt !== undefined) updates.paidAt = body.paidAt;
    
    console.log("Updates to apply:", updates);
    
    const updatedUser = await localDB.users.update(body.id, updates);
    
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
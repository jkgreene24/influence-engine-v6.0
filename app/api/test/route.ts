import { NextResponse } from "next/server";

export async function GET() {
  console.log("=== TEST API ROUTE CALLED ===");
  return NextResponse.json({ message: "Test API route working" });
}

export async function POST(request: Request) {
  console.log("=== TEST POST API ROUTE CALLED ===");
  const body = await request.json();
  console.log("Test POST body:", body);
  return NextResponse.json({ message: "Test POST working", received: body });
}

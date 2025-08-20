import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { userId, analyticsData } = await request.json();

    if (!userId || !analyticsData || !Array.isArray(analyticsData)) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    // Prepare quiz selections for insertion
    const quizSelections = analyticsData.map((data) => ({
      user_id: parseInt(userId), // Convert to integer since influence_users.id is INTEGER
      question_id: data.questionId,
      answer_id: data.answerId,
      analytics_tag: data.analyticsTag,
    }));

    // Insert quiz selections into the database
    const { data, error } = await supabase
      .from("quiz_selections")
      .insert(quizSelections);

    if (error) {
      console.error("Error inserting quiz selections:", error);
      return NextResponse.json(
        { error: "Failed to save quiz selections" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Quiz selections saved successfully", data },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in save-quiz-analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

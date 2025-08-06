import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil",
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      userEmail, 
      userName, 
      influenceStyle, 
      secondaryStyle, 
      purchaseType = "toolkit",
      paymentMethodId,
      amount,
      currency = "usd",
      userId
    } = body;

    console.log("Processing payment for:", { userEmail, userName, influenceStyle, secondaryStyle, purchaseType, amount, userId });

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // Amount in cents
      currency: currency,
      payment_method: paymentMethodId,
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never'
      },
      metadata: {
        userEmail,
        userName,
        influenceStyle,
        secondaryStyle: secondaryStyle || "",
        purchaseType,
        userId,
      },
    });

    console.log("Payment intent created:", paymentIntent.id);

    if (paymentIntent.status === 'succeeded') {
      // Update payment status in database
      try {
        const supabase = await createClient();
        const paidFor = purchaseType === "betty" ? "betty" : "toolkit";
        
        const { data, error } = await supabase
          .from("influence_users")
          .update({ 
            paid_at: new Date().toISOString(),
            paid_for: paidFor
          })
          .eq("id", userId)
          .select();
          
        if (error) {
          console.error("Failed to update payment status:", error);
        } else {
          console.log("Payment status updated successfully for user ID:", userId);
        }
      } catch (error) {
        console.error("Error updating payment status:", error);
      }

      return NextResponse.json({ 
        success: true, 
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret 
      });
    } else {
      return NextResponse.json(
        { error: "Payment failed to process" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error processing payment:", error);
    return NextResponse.json(
      { error: "Failed to process payment" },
      { status: 500 }
    );
  }
}

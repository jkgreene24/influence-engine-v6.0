import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil",
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userEmail, userName, influenceStyle, secondaryStyle, purchaseType = "toolkit" } = body;

    console.log("Creating checkout session for:", { userEmail, userName, influenceStyle, secondaryStyle, purchaseType });

    // Determine product and pricing based on purchase type
    let priceId: string;
    let successUrl: string;
    let cancelUrl: string;

    if (purchaseType === "betty") {
      priceId = process.env.STRIPE_BETTY_PRICE_ID!; // $499 Betty product price ID
      successUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}&type=betty`;
      cancelUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/influence-nda`;
    } else {
      priceId = process.env.STRIPE_TOOLKIT_PRICE_ID!; // $19 Toolkit product price ID
      successUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}&type=toolkit`;
      cancelUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/influence-nda`;
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "payment", // Both are one-time payments
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: userEmail,
      metadata: {
        userEmail,
        userName,
        influenceStyle,
        secondaryStyle: secondaryStyle || "",
        purchaseType,
      },
      billing_address_collection: "required",
      shipping_address_collection: {
        allowed_countries: ["US", "CA", "GB", "AU"], // Add more countries as needed
      },
    });

    console.log("Checkout session created:", session.id);

    return NextResponse.json({ sessionUrl: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
} 
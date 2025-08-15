import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil",
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userEmail, userName, influenceStyle, secondaryStyle, purchaseType = "toolkit", metadata } = body;

    console.log("Creating checkout session for:", { userEmail, userName, influenceStyle, secondaryStyle, purchaseType });

    // Determine product and pricing based on purchase type
    let priceId: string;
    let successUrl: string;
    let cancelUrl: string;

    // Map purchase types to Stripe price IDs
    switch (purchaseType) {
      case "book":
        priceId = process.env.STRIPE_BOOK_PRICE_ID!;
        break;
      case "toolkit":
        priceId = process.env.STRIPE_TOOLKIT_PRICE_ID!;
        break;
      case "ie_annual":
        priceId = process.env.STRIPE_IE_ANNUAL_PRICE_ID!;
        break;
      case "bundle":
        priceId = process.env.STRIPE_BUNDLE_PRICE_ID!;
        break;
      default:
        priceId = process.env.STRIPE_TOOLKIT_PRICE_ID!;
    }

    successUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/funnel?step=success&session_id={CHECKOUT_SESSION_ID}`;
    cancelUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/funnel?step=checkout`;

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
        ...metadata, // Include all the additional metadata from the funnel
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
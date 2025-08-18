import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil",
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userEmail, userName, influenceStyle, secondaryStyle, cart, metadata } = body;

    console.log("Creating checkout session for:", { userEmail, userName, influenceStyle, secondaryStyle, cart });

    // Parse cart items from metadata if not directly provided
    const cartItems = cart || (metadata?.cart ? metadata.cart.split(',') : ['toolkit']);
    
    console.log("Cart items to process:", cartItems);

    // Map cart items to Stripe price IDs
    const lineItems: any[] = [];
    
    cartItems.forEach((item: string) => {
      switch (item.toLowerCase()) {
        case "book":
          lineItems.push({
            price: process.env.STRIPE_BOOK_PRICE_ID!,
            quantity: 1,
          });
          console.log(`Mapped ${item} to price ID: ${process.env.STRIPE_BOOK_PRICE_ID}`);
          break;
        case "toolkit":
          lineItems.push({
            price: process.env.STRIPE_TOOLKIT_PRICE_ID!,
            quantity: 1,
          });
          console.log(`Mapped ${item} to price ID: ${process.env.STRIPE_TOOLKIT_PRICE_ID}`);
          break;
        case "ie_annual":
          lineItems.push({
            price: process.env.STRIPE_IE_ANNUAL_PRICE_ID!,
            quantity: 1,
          });
          console.log(`Mapped ${item} to price ID: ${process.env.STRIPE_IE_ANNUAL_PRICE_ID}`);
          break;
        case "bundle":
          // For bundle, add all three individual products
          lineItems.push(
            {
              price: process.env.STRIPE_BOOK_PRICE_ID!,
              quantity: 1,
            },
            {
              price: process.env.STRIPE_TOOLKIT_PRICE_ID!,
              quantity: 1,
            },
            {
              price: process.env.STRIPE_IE_ANNUAL_PRICE_ID!,
              quantity: 1,
            }
          );
          console.log(`Mapped ${item} to bundle: Book + Toolkit + IE_Annual`);
          break;
        default:
          console.warn(`Unknown cart item: ${item}, defaulting to toolkit`);
          lineItems.push({
            price: process.env.STRIPE_TOOLKIT_PRICE_ID!,
            quantity: 1,
          });
      }
    });

    console.log("Line items for Stripe:", lineItems);

    const successUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/funnel?step=success&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/funnel?step=checkout`;

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment", // Both are one-time payments
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: userEmail,
      metadata: {
        userEmail,
        userName,
        influenceStyle,
        secondaryStyle: secondaryStyle || "",
        cart: cartItems.join(','),
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
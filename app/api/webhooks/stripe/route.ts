import { NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil",
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const sig = headersList.get("stripe-signature");

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig!, endpointSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  console.log("Webhook event received:", event.type);

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("Payment successful for session:", session.id);
      
      // Here you would:
      // 1. Send welcome email with toolkit access
      // 2. Add user to community/notion access
      // 3. Log the successful purchase
      
      console.log("Session metadata:", session.metadata);
      console.log("Customer email:", session.customer_email);
      break;
      
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log("Payment succeeded:", paymentIntent.id);
      console.log("Payment intent metadata:", paymentIntent.metadata);
      break;
      
    case "payment_intent.payment_failed":
      const failedPayment = event.data.object as Stripe.PaymentIntent;
      console.log("Payment failed:", failedPayment.id);
      break;
      
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
} 
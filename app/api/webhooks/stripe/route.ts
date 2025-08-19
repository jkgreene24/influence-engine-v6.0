import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil",
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  console.log("Webhook event received:", event.type);

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
      break;
    case "payment_intent.succeeded":
      await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
      break;
    case "payment_intent.payment_failed":
      await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log("Processing completed checkout session:", session.id);

  try {
    const supabase = await createClient();

    // Extract user information from metadata
    const userId = session.metadata?.userId;
    const userEmail = session.metadata?.userEmail;
    const cart = session.metadata?.cart;

    if (!userId || !userEmail) {
      console.error("Missing user information in session metadata");
      return;
    }

    // Convert userId to number if it's a string
    const numericUserId = typeof userId === 'string' ? parseInt(userId, 10) : userId;
    console.log("Processing payment for user ID:", numericUserId, "Type:", typeof numericUserId);

    // Update user payment status
    const { error: updateError } = await supabase
      .from('influence_users')
      .update({
        paid_at: new Date().toISOString(),
        paid_for: cart || '',
      })
      .eq('id', numericUserId);

    if (updateError) {
      console.error("Error updating user payment status:", updateError);
      return;
    }

    console.log("User payment status updated successfully for user:", userId);

    // Store webhook event for audit
    const { error: webhookError } = await supabase
      .from('webhook_events')
      .insert({
        stripe_event_id: session.id,
        event_type: 'checkout.session.completed',
        event_data: session,
        processed: true,
        processed_at: new Date().toISOString(),
      });

    if (webhookError) {
      console.error("Error storing webhook event:", webhookError);
    }

  } catch (error) {
    console.error("Error processing checkout session completed:", error);
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log("Payment intent succeeded:", paymentIntent.id);
  // Additional payment success logic can be added here
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log("Payment intent failed:", paymentIntent.id);
  // Handle payment failure logic here
} 
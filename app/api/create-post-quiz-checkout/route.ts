import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { PRODUCT_CONFIGS } from "@/lib/utils/post-quiz-funnel-state";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil",
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userEmail, userName, cart, sourceTracking, ndaSigned, userId } = body;

    console.log("Creating post-quiz checkout session for:", { 
      userEmail, 
      userName, 
      cart,
      sourceTracking,
      ndaSigned 
    });

    const supabase = await createClient();
    
    // Use provided user data instead of authentication
    if (!userEmail) {
      return NextResponse.json({ error: "Missing user email" }, { status: 400 });
    }

    // Validate cart items
    if (!cart || cart.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Create individual line items for each product
    const lineItems: any[] = [];
    const metadata: Record<string, string> = {
      userEmail,
      userName,
      userId: userId?.toString() || '0',
      ndaSigned: ndaSigned ? 'true' : 'false',
    };

    // Add source tracking metadata
    if (sourceTracking) {
      Object.entries(sourceTracking).forEach(([key, value]) => {
        if (value) {
          metadata[`source_${key}`] = value.toString();
        }
      });
    }

    // Create line items for each cart item
    cart.forEach((item: any) => {
      if (item.stripePriceId) {
        lineItems.push({
          price: item.stripePriceId,
          quantity: 1,
        });
        
        // Add product-specific metadata
        if (item.type === 'toolkit' && item.metadata?.influenceStyle) {
          metadata[`toolkit_style_${item.metadata.influenceStyle}`] = 'true';
        }
      }
    });

    console.log("Line items for Stripe:", lineItems);
    console.log("Metadata:", metadata);

    const successUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/post-quiz-funnel/checkout`;

    console.log("Success URL:", successUrl);
    console.log("Cancel URL:", cancelUrl);

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: userEmail,
      metadata,
      billing_address_collection: "required",
      shipping_address_collection: {
        allowed_countries: ["US", "CA", "GB", "AU"],
      },
    });

    console.log("Checkout session created:", session.id);
    console.log("Session URL:", session.url);

    // Calculate total price for database record
    const totalPrice = cart.reduce((sum: number, item: any) => sum + item.price, 0);
    
    // Save checkout session to database
    await saveCheckoutSession(supabase, userId || 0, session.id, {
      cart,
      sourceTracking,
      ndaSigned,
      totalPrice: totalPrice,
    });

    if (!session.url) {
      console.error("No URL in Stripe session response");
      return NextResponse.json(
        { error: "Failed to create checkout session URL" },
        { status: 500 }
      );
    }

    return NextResponse.json({ sessionUrl: session.url });
  } catch (error) {
    console.error("Error creating post-quiz checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

async function saveCheckoutSession(
  supabase: any, 
  userId: number, 
  sessionId: string, 
  sessionData: any
) {
  try {
    await supabase
      .from('checkout_sessions')
      .insert({
        user_id: userId,
        stripe_session_id: sessionId,
        session_data: sessionData,
        status: 'pending',
        created_at: new Date().toISOString(),
      });
  } catch (error) {
    console.error("Error saving checkout session to database:", error);
  }
}

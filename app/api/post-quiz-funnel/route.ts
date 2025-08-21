import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { 
  PostQuizFunnelState, 
  ProductState,
  createInitialFunnelState,
  selectProduct,
  declineProduct,
  updateDemoProgress,
  signNdaAgreement,
  moveToNextStep,
  getBundleCartItem,
  generateSourceTags
} from "@/lib/utils/post-quiz-funnel-state";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, data, userId, userEmail, influenceStyle, secondaryStyle } = body;
    
    const supabase = await createClient();
    
    // Use provided user data instead of authentication
    if (!userId || !userEmail) {
      return NextResponse.json({ error: "Missing user data" }, { status: 400 });
    }
    
    // Load current funnel state from database
    let funnelState = await loadFunnelStateFromDatabase(supabase, userId);
    
    if (!funnelState) {
      // Create initial funnel state if none exists
      funnelState = createInitialFunnelState(
        userId,
        userEmail,
        influenceStyle || 'catalyst',
        secondaryStyle
      );
      await saveFunnelStateToDatabase(supabase, funnelState);
    }
    
    // Handle different actions
    switch (action) {
      case 'select_product':
        funnelState = selectProduct(funnelState, data.productType);
        await saveFunnelStateToDatabase(supabase, funnelState);
        await saveProductSelection(supabase, userId, data.productType, true);
        break;
        
      case 'decline_product':
        funnelState = declineProduct(funnelState, data.productType);
        await saveFunnelStateToDatabase(supabase, funnelState);
        await saveProductSelection(supabase, userId, data.productType, false);
        break;
        
      case 'update_demo_progress':
        funnelState = updateDemoProgress(funnelState, data.watchPercentage);
        await saveFunnelStateToDatabase(supabase, funnelState);
        await updateDemoProgressInDatabase(supabase, userId, data.watchPercentage);
        break;
        
      case 'sign_nda_agreement':
        funnelState = signNdaAgreement(funnelState);
        await saveFunnelStateToDatabase(supabase, funnelState);
        await signNdaAgreementInDatabase(supabase, userId);
        break;
        
      case 'move_to_next_step':
        funnelState = moveToNextStep(funnelState);
        await saveFunnelStateToDatabase(supabase, funnelState);
        await saveFunnelStep(supabase, userId, funnelState.currentStep);
        break;
        
      case 'select_bundle':
        const bundleType = data.bundleType; // 'engine' or 'mastery'
        const bundleCartItem = getBundleCartItem(bundleType);
        
        // Clear individual items and add bundle
        funnelState.cart = [bundleCartItem];
        funnelState.products.bundle.selected = true;
        funnelState.products.bundle.selectedAt = new Date().toISOString();
        funnelState.tags.push(`PROD_BUNDLE_${bundleType.toUpperCase()}`);
        
        // Mark individual items as replaced by bundle
        if (bundleType === 'engine') {
          funnelState.products.toolkit.selected = false;
          funnelState.products.engine.selected = false;
          funnelState.products.book.selected = false;
          funnelState.tags.push('BUNDLE_REPLACES_INDIVIDUAL_ITEMS');
        } else {
          funnelState.products.toolkit.selected = false;
          funnelState.products.book.selected = false;
          funnelState.tags.push('BUNDLE_REPLACES_INDIVIDUAL_ITEMS');
        }
        
        await saveFunnelStateToDatabase(supabase, funnelState);
        await saveProductSelection(supabase, userId, 'bundle', true, bundleType);
        break;
        
      case 'update_source_tracking':
        funnelState.sourceTracking = { ...funnelState.sourceTracking, ...data.sourceTracking };
        const sourceTags = generateSourceTags(funnelState.sourceTracking);
        funnelState.tags = [...funnelState.tags, ...sourceTags];
        await saveFunnelStateToDatabase(supabase, funnelState);
        break;
        
      case 'get_state':
        // Just return the current state
        break;
        
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
    
    // Save analytics event
    await saveAnalyticsEvent(supabase, userId, action, data);
    
    // Save tags to database
    await saveUserTags(supabase, userId, funnelState.tags);
    
    return NextResponse.json({ 
      success: true, 
      funnelState,
      nextStep: funnelState.currentStep 
    });
    
  } catch (error) {
    console.error("Error in post-quiz funnel API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Database helper functions
async function loadFunnelStateFromDatabase(supabase: any, userId: number): Promise<PostQuizFunnelState | null> {
  const { data: funnelSteps } = await supabase
    .from('funnel_steps')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  const { data: products } = await supabase
    .from('funnel_products')
    .select('*')
    .eq('user_id', userId);
    
  const { data: userTags } = await supabase
    .from('user_tags')
    .select('*')
    .eq('user_id', userId);
    
  if (!funnelSteps || funnelSteps.length === 0) {
    return null;
  }
  
  // Reconstruct funnel state from database
  const latestStep = funnelSteps[0];
  const productStates: {
    toolkit: ProductState;
    engine: ProductState;
    book: ProductState;
    bundle: ProductState;
  } = {
    toolkit: { offered: false, selected: false, declined: false },
    engine: { offered: false, selected: false, declined: false },
    book: { offered: false, selected: false, declined: false },
    bundle: { offered: false, selected: false, declined: false },
  };
  
  products?.forEach((product: any) => {
    if (productStates[product.product_type as keyof typeof productStates]) {
      productStates[product.product_type as keyof typeof productStates] = {
        offered: true,
        selected: product.selected,
        declined: product.declined,
        selectedAt: product.selected_at,
        declinedAt: product.declined_at,
        stripeSku: product.stripe_sku,
        price: product.price,
      };
    }
  });
  
  const tags = userTags?.map((tag: any) => tag.tag_name) || [];
  
  // This is a simplified reconstruction - in a real implementation,
  // you'd want to store the full state as JSONB in the database
  return {
    userId,
    userEmail: '', // Will be filled from user profile
    currentStep: latestStep.step_name as any,
    influenceStyle: '',
    secondaryStyle: undefined,
    isBlend: false,
    products: productStates,
    demo: {
      watched: false,
      watchPercentage: 0,
      skipped: false,
    },
    ndaAgreement: {
      signed: false,
    },
    sourceTracking: {},
    cart: [],
    tags,
    funnelStartedAt: latestStep.created_at,
    lastUpdatedAt: latestStep.completed_at,
  };
}

async function saveFunnelStateToDatabase(supabase: any, funnelState: PostQuizFunnelState) {
  // Save current step
  await supabase
    .from('funnel_steps')
    .insert({
      user_id: funnelState.userId,
      step_name: funnelState.currentStep,
      step_data: funnelState,
      completed_at: new Date().toISOString(),
    });
    
  // Update user's demo watch percentage if needed
  if (funnelState.demo.watchPercentage > 0) {
    await supabase
      .from('influence_users')
      .update({ 
        demo_watch_percentage: funnelState.demo.watchPercentage,
      })
      .eq('id', funnelState.userId);
  }
}

async function saveProductSelection(
  supabase: any, 
  userId: number, 
  productType: string, 
  selected: boolean,
  bundleType?: string
) {
  const productData = {
    user_id: userId,
    product_type: productType,
    selected,
    declined: !selected,
    selected_at: selected ? new Date().toISOString() : null,
    declined_at: !selected ? new Date().toISOString() : null,
  };
  
  if (bundleType) {
    (productData as any)['bundle_type'] = bundleType;
  }
  
  await supabase
    .from('funnel_products')
    .upsert(productData, { onConflict: 'user_id,product_type' });
}

async function updateDemoProgressInDatabase(supabase: any, userId: number, watchPercentage: number) {
  await supabase
    .from('influence_users')
    .update({ 
      demo_watch_percentage: watchPercentage,
    })
    .eq('id', userId);
}

async function signNdaAgreementInDatabase(supabase: any, userId: number) {
  await supabase
    .from('influence_users')
    .update({ 
      nda_signed: true,
      nda_signed_at: new Date().toISOString(),
    })
    .eq('id', userId);
}

async function saveFunnelStep(supabase: any, userId: number, stepName: string) {
  await supabase
    .from('funnel_steps')
    .insert({
      user_id: userId,
      step_name: stepName,
      completed_at: new Date().toISOString(),
    });
}

async function saveAnalyticsEvent(supabase: any, userId: number, eventType: string, eventData: any) {
  await supabase
    .from('funnel_analytics')
    .insert({
      user_id: userId,
      event_type: eventType,
      event_data: eventData,
      created_at: new Date().toISOString(),
    });
}

async function saveUserTags(supabase: any, userId: number, tags: string[]) {
  const tagData = tags.map(tag => ({
    user_id: userId,
    tag_name: tag,
    created_at: new Date().toISOString(),
  }));
  
  // Use upsert to avoid duplicates
  for (const tag of tagData) {
    await supabase
      .from('user_tags')
      .upsert(tag, { onConflict: 'user_id,tag_name' });
  }
}

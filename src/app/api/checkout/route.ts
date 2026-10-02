import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { sendOrderConfirmationEmail } from "@/lib/mailgun";
import { isSupabaseFullyConfigured } from "@/lib/config";
import { demoProducts } from "@/lib/demo-products";
import type { Order } from "@/lib/types";

interface CheckoutItemInput {
  productId: string;
  quantity: number;
}

interface CheckoutBody {
  email: string;
  customerName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
  items: CheckoutItemInput[];
}

const FREE_SHIPPING_THRESHOLD = 5000;
const SHIPPING_CENTS = 599;

export async function POST(request: Request) {
  let body: CheckoutBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { email, customerName, addressLine1, city, country, items } = body;

  if (
    !email ||
    !customerName ||
    !addressLine1 ||
    !city ||
    !country ||
    !Array.isArray(items) ||
    items.length === 0
  ) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  if (!isSupabaseFullyConfigured()) {
    const productMap = new Map(demoProducts.map((p) => [p.id, p]));
    let subtotal = 0;
    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return NextResponse.json(
          { error: "Unknown product in cart" },
          { status: 400 }
        );
      }
      const quantity = Math.max(1, Math.min(Math.floor(item.quantity), 99));
      subtotal += product.price_cents * quantity;
    }
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_CENTS;
    const total = subtotal + shipping;
    const orderId = `demo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    return NextResponse.json({ orderId, totalCents: total });
  }

  const admin = createAdminClient();

  const productIds = items.map((i) => i.productId);
  const { data: products, error: productsError } = await admin
    .from("products")
    .select("id, name, price_cents, slug")
    .in("id", productIds);

  if (productsError || !products) {
    return NextResponse.json(
      { error: "Could not load products" },
      { status: 500 }
    );
  }

  const productMap = new Map(products.map((p) => [p.id, p]));

  let subtotal = 0;
  const orderItems = [];
  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product) {
      return NextResponse.json({ error: "Unknown product in cart" }, { status: 400 });
    }
    const quantity = Math.max(1, Math.min(Math.floor(item.quantity), 99));
    subtotal += product.price_cents * quantity;
    orderItems.push({
      product_id: product.id,
      product_name: product.name,
      unit_price_cents: product.price_cents,
      quantity,
    });
  }

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_CENTS;
  const total = subtotal + shipping;

  let userId: string | null = null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userId = user?.id ?? null;
  } catch {
    userId = null;
  }

  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({
      user_id: userId,
      email,
      customer_name: customerName,
      address_line1: addressLine1,
      address_line2: body.addressLine2 ?? null,
      city,
      state: body.state ?? null,
      postal_code: body.postalCode ?? null,
      country,
      subtotal_cents: subtotal,
      shipping_cents: shipping,
      total_cents: total,
      status: "confirmed",
    })
    .select()
    .single();

  if (orderError || !order) {
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }

  const { error: itemsError } = await admin.from("order_items").insert(
    orderItems.map((oi) => ({ ...oi, order_id: order.id }))
  );

  if (itemsError) {
    await admin.from("orders").delete().eq("id", order.id);
    return NextResponse.json(
      { error: "Failed to save order items" },
      { status: 500 }
    );
  }

  try {
    await sendOrderConfirmationEmail({
      to: email,
      order: order as Order,
      items: orderItems.map((oi) => ({
        product_name: oi.product_name,
        quantity: oi.quantity,
        unit_price_cents: oi.unit_price_cents,
      })),
    });
  } catch (error) {
    console.error("Failed to send confirmation email", error);
  }

  return NextResponse.json({ orderId: order.id, totalCents: total });
}

import { createClient } from "@/lib/supabase/server";

export type OrderStatus = "pending" | "shipped" | "delivered" | "canceled" | "refunded";

export interface OrderSummary {
  id: string;
  status: OrderStatus;
  currency: string;
  subtotal: number;
  total: number;
  createdAt: string;
  itemCount: number;
}

export interface OrderItem {
  id: string;
  productId: string | null;
  productName: string;
  unitPrice: number;
  quantity: number;
}

export interface OrderDetail extends OrderSummary {
  contactEmail: string;
  shippingAddress: Record<string, unknown> | null;
  items: OrderItem[];
}

// RLS ("Orders are viewable by owner or admin") already scopes these queries to
// the signed-in user's own orders, so no explicit user_id filter is needed here.

export async function getOrders(): Promise<OrderSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("id, status, currency, subtotal, total, created_at, order_items(count)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Failed to load orders: ${error.message}`);

  return (data ?? []).map((row) => ({
    id: row.id,
    status: row.status as OrderStatus,
    currency: row.currency,
    subtotal: row.subtotal,
    total: row.total,
    createdAt: row.created_at,
    itemCount: (row.order_items as unknown as { count: number }[])[0]?.count ?? 0,
  }));
}

export async function getOrderById(orderId: string): Promise<OrderDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, status, currency, subtotal, total, created_at, contact_email, shipping_address, order_items(id, product_id, product_name, unit_price, quantity)",
    )
    .eq("id", orderId)
    .maybeSingle();
  if (error) throw new Error(`Failed to load order: ${error.message}`);
  if (!data) return null;

  const items = data.order_items.map((item) => ({
    id: item.id,
    productId: item.product_id,
    productName: item.product_name,
    unitPrice: item.unit_price,
    quantity: item.quantity,
  }));

  return {
    id: data.id,
    status: data.status as OrderStatus,
    currency: data.currency,
    subtotal: data.subtotal,
    total: data.total,
    createdAt: data.created_at,
    contactEmail: data.contact_email,
    shippingAddress: data.shipping_address as Record<string, unknown> | null,
    itemCount: items.length,
    items,
  };
}

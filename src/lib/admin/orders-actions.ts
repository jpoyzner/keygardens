"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sendOrderStatusEmail } from "@/lib/email";
import type { OrderStatus } from "@/lib/orders";

export interface OrderActionState {
  error?: string;
}

const STATUSES: OrderStatus[] = ["pending", "shipped", "delivered", "canceled", "refunded"];

export async function updateOrderStatus(
  orderId: string,
  _state: OrderActionState | undefined,
  formData: FormData,
): Promise<OrderActionState> {
  const status = String(formData.get("status") ?? "");
  if (!STATUSES.includes(status as OrderStatus)) {
    return { error: "Choose a valid status." };
  }

  const supabase = await createClient();
  const { data: current } = await supabase
    .from("orders")
    .select("status, contact_email")
    .eq("id", orderId)
    .single();

  const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
  if (error) {
    return { error: `Could not update order: ${error.message}` };
  }

  // Notify the customer only on an actual transition into shipped/delivered.
  if (current && current.status !== status && (status === "shipped" || status === "delivered")) {
    await sendOrderStatusEmail({ id: orderId, contactEmail: current.contact_email, status });
  }

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  revalidatePath("/account/orders");
  return {};
}

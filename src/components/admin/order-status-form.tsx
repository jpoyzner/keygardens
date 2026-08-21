"use client";

import { useActionState } from "react";
import { updateOrderStatus, type OrderActionState } from "@/lib/admin/orders-actions";
import type { OrderStatus } from "@/lib/orders";

const STATUSES: OrderStatus[] = ["pending", "shipped", "delivered", "canceled", "refunded"];

export function OrderStatusForm({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const [state, formAction, pending] = useActionState<OrderActionState | undefined, FormData>(
    (state, formData) => updateOrderStatus(orderId, state, formData),
    undefined,
  );

  return (
    <form action={formAction} className="flex items-center gap-2">
      <select
        name="status"
        defaultValue={status}
        className="rounded border border-zinc-300 px-2 py-1 text-sm capitalize"
      >
        {STATUSES.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-white px-3 py-1.5 text-sm font-medium text-zinc-900 disabled:opacity-50"
      >
        {pending ? "Saving..." : "Update"}
      </button>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}

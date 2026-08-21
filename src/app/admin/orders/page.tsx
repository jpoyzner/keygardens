import Link from "next/link";
import { getOrders } from "@/lib/orders";

export const metadata = { title: "Admin — Orders" };

function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function AdminOrdersPage() {
  const orders = await getOrders();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Orders</h1>

      <ul className="flex flex-col gap-2">
        {orders.map((order) => (
          <li key={order.id}>
            <Link
              href={`/admin/orders/${order.id}`}
              className="flex items-center justify-between rounded border border-zinc-200 px-4 py-3 hover:border-zinc-400"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">Order #{order.id.slice(0, 8)}</span>
                <span className="text-xs text-zinc-500">
                  {formatDate(order.createdAt)} · {order.itemCount} item
                  {order.itemCount === 1 ? "" : "s"}
                </span>
              </div>
              <div className="flex flex-col items-end gap-0.5">
                <span className="text-sm font-semibold">
                  {formatPrice(order.total, order.currency)}
                </span>
                <span className="text-xs text-zinc-500 capitalize">{order.status}</span>
              </div>
            </Link>
          </li>
        ))}
        {orders.length === 0 && <p className="text-sm text-zinc-600">No orders yet.</p>}
      </ul>
    </div>
  );
}

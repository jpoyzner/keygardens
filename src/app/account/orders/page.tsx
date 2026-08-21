import Link from "next/link";
import { getOrders } from "@/lib/orders";

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

export default async function OrdersPage() {
  const orders = await getOrders();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Order history</h1>
        <Link href="/account" className="text-sm underline">
          Back to account
        </Link>
      </div>

      {orders.length === 0 ? (
        <p className="text-zinc-600">You haven&apos;t placed any orders yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/account/orders/${order.id}`}
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
        </ul>
      )}
    </div>
  );
}

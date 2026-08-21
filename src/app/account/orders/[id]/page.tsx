import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/orders";

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

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  const address = order.shippingAddress;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 rounded-lg border border-white bg-black my-8 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Order #{order.id.slice(0, 8)}</h1>
        <Link href="/account/orders" className="text-sm underline">
          Back to orders
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-200">
        <span>{formatDate(order.createdAt)}</span>
        <span className="rounded-full bg-zinc-100 px-3 py-1 font-medium text-zinc-900 capitalize">
          {order.status}
        </span>
      </div>

      <ul className="flex flex-col gap-3">
        {order.items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between border-b border-zinc-700 pb-3"
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">{item.productName}</span>
              <span className="text-xs text-zinc-300">
                Qty {item.quantity} × {formatPrice(item.unitPrice, order.currency)}
              </span>
            </div>
            <span className="text-sm font-medium">
              {formatPrice(item.unitPrice * item.quantity, order.currency)}
            </span>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-1 border-t border-zinc-700 pt-4 text-sm">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatPrice(order.subtotal, order.currency)}</span>
        </div>
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>{formatPrice(order.total, order.currency)}</span>
        </div>
      </div>

      <div className="flex flex-col gap-1 text-sm text-zinc-200">
        <span>Contact: {order.contactEmail}</span>
        {address && (
          <span>
            Shipping to:{" "}
            {Object.values(address)
              .filter((value) => typeof value === "string" && value.trim())
              .join(", ")}
          </span>
        )}
      </div>
    </div>
  );
}

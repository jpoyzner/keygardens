import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/orders";
import { OrderStatusForm } from "@/components/admin/order-status-form";

export const metadata = { title: "Admin — Order detail" };

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

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  const address = order.shippingAddress;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Order #{order.id.slice(0, 8)}</h1>
        <Link href="/admin/orders" className="text-sm underline">
          Back to orders
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <span className="text-sm text-zinc-600">{formatDate(order.createdAt)}</span>
        <OrderStatusForm orderId={order.id} status={order.status} />
      </div>

      <ul className="flex flex-col gap-3">
        {order.items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between border-b border-zinc-200 pb-3"
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">{item.productName}</span>
              <span className="text-xs text-zinc-500">
                Qty {item.quantity} × {formatPrice(item.unitPrice, order.currency)}
              </span>
            </div>
            <span className="text-sm font-medium">
              {formatPrice(item.unitPrice * item.quantity, order.currency)}
            </span>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-1 border-t border-zinc-200 pt-4 text-sm">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatPrice(order.subtotal, order.currency)}</span>
        </div>
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>{formatPrice(order.total, order.currency)}</span>
        </div>
      </div>

      <div className="flex flex-col gap-1 text-sm text-zinc-600">
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

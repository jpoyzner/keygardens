import Link from "next/link";

const SECTIONS = [
  {
    href: "/admin/products",
    label: "Products",
    description: "Create, edit, and remove products, categories, and images.",
  },
  {
    href: "/admin/categories",
    label: "Categories",
    description: "Manage the category list used for browsing and filters.",
  },
  {
    href: "/admin/orders",
    label: "Orders",
    description: "View orders and update fulfillment status.",
  },
  { href: "/admin/reviews", label: "Reviews", description: "Moderate or remove product reviews." },
  {
    href: "/admin/coming-soon",
    label: "Coming soon",
    description: "Manage the coming-soon slideshow.",
  },
];

export default function AdminPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Admin</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {SECTIONS.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="flex flex-col gap-1 rounded border border-zinc-700 px-4 py-3 hover:border-zinc-500"
          >
            <span className="font-medium">{section.label}</span>
            <span className="text-sm text-zinc-200">{section.description}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

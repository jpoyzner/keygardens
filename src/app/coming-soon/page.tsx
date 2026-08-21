import { getComingSoonSlides } from "@/lib/coming-soon";
import { ComingSoonSlideshow } from "@/components/coming-soon-slideshow";
import { SubscribeForm } from "@/components/subscribe-form";

export const metadata = { title: "Coming soon — Keygardens" };

export default async function ComingSoonPage() {
  const slides = await getComingSoonSlides();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-16">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-semibold">Coming soon</h1>
        <p className="text-zinc-600">A preview of what&apos;s next at Keygardens.</p>
      </div>

      <ComingSoonSlideshow slides={slides} />

      <div className="flex flex-col gap-2 border-t border-zinc-200 pt-6">
        <h2 className="text-sm font-medium">Get notified when it launches</h2>
        <SubscribeForm />
      </div>
    </div>
  );
}

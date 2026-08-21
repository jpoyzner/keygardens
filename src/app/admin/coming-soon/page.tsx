import Image from "next/image";
import { getAdminComingSoonSlides } from "@/lib/admin/coming-soon";
import { deleteSlide, moveSlide, toggleSlideActive } from "@/lib/admin/coming-soon-actions";
import { SlideCaptionForm } from "@/components/admin/slide-caption-form";
import { NewSlideForm } from "@/components/admin/new-slide-form";

export const metadata = { title: "Admin — Coming soon" };

export default async function AdminComingSoonPage() {
  const slides = await getAdminComingSoonSlides();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Coming soon slides</h1>

      <ul className="flex flex-col gap-3">
        {slides.map((slide, index) => (
          <li
            key={slide.id}
            className="flex flex-wrap items-center gap-4 rounded border border-zinc-700 px-4 py-3"
          >
            <div className="relative h-16 w-24 overflow-hidden rounded border border-zinc-700">
              <Image src={slide.url} alt={slide.caption ?? ""} fill className="object-cover" />
            </div>
            <SlideCaptionForm id={slide.id} caption={slide.caption} />
            <div className="ml-auto flex items-center gap-2 text-sm">
              <form action={moveSlide.bind(null, slide.id, "up")}>
                <button
                  type="submit"
                  disabled={index === 0}
                  className="underline disabled:opacity-30"
                >
                  ↑
                </button>
              </form>
              <form action={moveSlide.bind(null, slide.id, "down")}>
                <button
                  type="submit"
                  disabled={index === slides.length - 1}
                  className="underline disabled:opacity-30"
                >
                  ↓
                </button>
              </form>
              <form action={toggleSlideActive.bind(null, slide.id, slide.isActive)}>
                <button type="submit" className="underline">
                  {slide.isActive ? "Deactivate" : "Activate"}
                </button>
              </form>
              <form action={deleteSlide.bind(null, slide.id)}>
                <button type="submit" className="text-red-600 underline">
                  Delete
                </button>
              </form>
            </div>
          </li>
        ))}
        {slides.length === 0 && <p className="text-sm text-zinc-200">No slides yet.</p>}
      </ul>

      <div className="rounded border border-dashed border-zinc-600 px-4 py-3">
        <h2 className="mb-2 text-sm font-medium">Add a slide</h2>
        <NewSlideForm />
      </div>
    </div>
  );
}

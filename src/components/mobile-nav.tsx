"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

export function MobileNav({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);

  // Reset during render when the route changes, e.g. after tapping a link
  // (see https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes).
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex cursor-pointer flex-col gap-1.5 p-2 sm:hidden"
        aria-label="Toggle menu"
        aria-expanded={open}
      >
        <span className="h-0.5 w-6 bg-white" />
        <span className="h-0.5 w-6 bg-white" />
        <span className="h-0.5 w-6 bg-white" />
      </button>

      {open && (
        <nav className="absolute inset-x-0 top-full flex flex-col gap-4 border-b border-white bg-[#1d1d1b] px-4 py-4 text-sm sm:hidden">
          {children}
        </nav>
      )}
    </>
  );
}

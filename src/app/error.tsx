"use client";

import { useEffect } from "react";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto my-8 flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-4 rounded-lg border border-white bg-black px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="text-sm text-zinc-400">
        An unexpected error occurred. This is often temporary — please try again.
      </p>
      <button
        onClick={() => retry()}
        className="rounded bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-200"
      >
        Try again
      </button>
    </div>
  );
}

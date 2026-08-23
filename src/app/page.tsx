import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-16 pt-20 text-center">
      <div className="flex h-32 aspect-[850/312] items-center justify-center rounded-2xl border-[6px] border-white bg-[#1d1d1b] p-4 sm:h-44">
        <Image
          src="/logo.png"
          alt="Keygardens"
          width={1034}
          height={312}
          className="h-full w-full object-contain"
          priority
        />
      </div>
      <Link
        href="/products"
        className="mt-4 flex flex-col items-center gap-2 rounded-[30px] border-2 border-white bg-white px-10 py-2 text-lg font-semibold text-zinc-900"
      >
        Shop now
        <Image src="/key.png" alt="" width={252} height={414} className="h-10 w-auto object-contain" />
      </Link>
    </div>
  );
}

import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-end gap-6 px-4 py-16 pt-20 text-center">
      <Link
        href="/products"
        className="flex flex-col items-center gap-2 rounded-[30px] border-2 border-white bg-white px-10 py-2 text-lg font-semibold text-zinc-900"
      >
        Shop now
        <Image src="/key.png" alt="" width={252} height={414} className="h-10 w-auto object-contain" />
      </Link>
    </div>
  );
}

import Link from "next/link";
import { SignupForm } from "./signup-form";

export default function SignupPage() {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 rounded-lg border border-white bg-black my-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Create an account</h1>
      <SignupForm />
      <p className="text-sm text-zinc-200">
        Already have an account?{" "}
        <Link href="/login" className="underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

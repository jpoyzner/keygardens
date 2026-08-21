import Link from "next/link";
import { ForgotPasswordForm } from "./forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 rounded-lg border border-white bg-black my-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Reset your password</h1>
      <p className="text-sm text-zinc-200">
        Enter your email and we&apos;ll send you a link to reset your password.
      </p>
      <ForgotPasswordForm />
      <p className="text-sm text-zinc-200">
        <Link href="/login" className="underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}

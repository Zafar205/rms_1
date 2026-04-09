"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function AccountConfirmationPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "your inbox";

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">Account Confirmation</p>
        <h1 className="text-3xl font-black leading-tight text-amber-100">Check Your Email</h1>
        <p className="text-sm text-stone-300">
          We sent a confirmation link to <span className="font-semibold text-stone-100">{email}</span>. Open it to activate your account.
        </p>
      </header>

      <div className="rounded-xl border border-white/10 bg-[#171110] p-4 text-sm text-stone-300">
        If you do not see the email, check spam and then request sign up again.
      </div>

      <div className="space-y-2 text-sm">
        <Link href="/auth/sign-in" className="block rounded-lg bg-primary px-4 py-2.5 text-center font-bold text-on-primary">
          Go to sign in
        </Link>
        <Link
          href="/auth/sign-up"
          className="block rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-center font-semibold text-stone-200 transition-colors hover:bg-white/10"
        >
          Create another account
        </Link>
      </div>
    </section>
  );
}

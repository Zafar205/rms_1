"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { type AuthActionState, verifyResetOtpAction } from "../actions";

const initialState: AuthActionState = {};

export default function VerifyResetOtpForm() {
  const searchParams = useSearchParams();
  const [state, formAction, isPending] = useActionState(verifyResetOtpAction, initialState);
  const prefilledEmail = searchParams.get("email") ?? "";

  return (
    <form action={formAction} className="space-y-4">
      {state.error ? (
        <p className="rounded-lg border border-red-300/40 bg-red-300/10 px-3 py-2 text-sm text-red-100">
          {state.error}
        </p>
      ) : null}

      <p className="rounded-lg border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-xs text-amber-100">
        Enter the OTP sent to your email to continue.
      </p>

      <div className="space-y-1.5">
        <label htmlFor="reset-otp-email" className="text-xs font-bold uppercase tracking-wide text-stone-200">
          Email
        </label>
        <input
          id="reset-otp-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={prefilledEmail}
          className="w-full rounded-lg border border-white/20 bg-[#120d0c] px-3 py-2.5 text-sm text-stone-100 outline-none ring-amber-300/40 transition placeholder:text-stone-500 focus:ring-2"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="reset-otp-code" className="text-xs font-bold uppercase tracking-wide text-stone-200">
          OTP Code
        </label>
        <input
          id="reset-otp-code"
          name="otp"
          type="text"
          inputMode="numeric"
          pattern="[0-9]{6,10}"
          minLength={6}
          maxLength={10}
          required
          placeholder="Enter OTP"
          className="w-full rounded-lg border border-white/20 bg-[#120d0c] px-3 py-2.5 text-sm tracking-[0.2em] text-stone-100 outline-none ring-amber-300/40 transition placeholder:text-stone-500 focus:ring-2"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-on-primary transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Verifying OTP..." : "Verify OTP"}
      </button>

      <p className="text-center text-sm text-stone-300">
        <Link
          href="/auth/forgot-password"
          className="font-semibold text-amber-200 transition-colors hover:text-amber-100"
        >
          Send a new OTP
        </Link>
      </p>
    </form>
  );
}

"use client";

import Link from "next/link";
import { useActionState } from "react";
import { forgotPasswordAction, type AuthActionState } from "../actions";

const initialState: AuthActionState = {};

export default function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(forgotPasswordAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {state.error ? (
        <p className="rounded-lg border border-red-300/40 bg-red-300/10 px-3 py-2 text-sm text-red-100">
          {state.error}
        </p>
      ) : null}

      <div className="space-y-1.5">
        <label
          htmlFor="forgot-password-email"
          className="text-xs font-bold uppercase tracking-wide text-stone-200"
        >
          Email
        </label>
        <input
          id="forgot-password-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="manager@desivesi.com"
          className="w-full rounded-lg border border-white/20 bg-[#120d0c] px-3 py-2.5 text-sm text-stone-100 outline-none ring-amber-300/40 transition placeholder:text-stone-500 focus:ring-2"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-on-primary transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Sending OTP..." : "Send OTP"}
      </button>

      <p className="text-center text-sm text-stone-300">
        <Link href="/auth/sign-in" className="font-semibold text-amber-200 transition-colors hover:text-amber-100">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}

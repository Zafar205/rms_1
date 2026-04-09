"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { signInAction, type AuthActionState } from "../actions";

const initialState: AuthActionState = {};

export default function SignInForm() {
  const searchParams = useSearchParams();
  const [state, formAction, isPending] = useActionState(signInAction, initialState);
  const infoMessage = searchParams.get("message");
  const queryError = searchParams.get("error");
  const nextPath = searchParams.get("next");

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={nextPath ?? ""} />

      {infoMessage ? (
        <p className="rounded-lg border border-emerald-300/30 bg-emerald-300/10 px-3 py-2 text-sm text-emerald-100">
          {infoMessage}
        </p>
      ) : null}

      {queryError ? (
        <p className="rounded-lg border border-red-300/40 bg-red-300/10 px-3 py-2 text-sm text-red-100">
          {queryError}
        </p>
      ) : null}

      {state.error ? (
        <p className="rounded-lg border border-red-300/40 bg-red-300/10 px-3 py-2 text-sm text-red-100">
          {state.error}
        </p>
      ) : null}

      <div className="space-y-1.5">
        <label htmlFor="sign-in-email" className="text-xs font-bold uppercase tracking-wide text-stone-200">
          Email
        </label>
        <input
          id="sign-in-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="manager@desivesi.com"
          className="w-full rounded-lg border border-white/20 bg-[#120d0c] px-3 py-2.5 text-sm text-stone-100 outline-none ring-amber-300/40 transition placeholder:text-stone-500 focus:ring-2"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="sign-in-password" className="text-xs font-bold uppercase tracking-wide text-stone-200">
          Password
        </label>
        <input
          id="sign-in-password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-lg border border-white/20 bg-[#120d0c] px-3 py-2.5 text-sm text-stone-100 outline-none ring-amber-300/40 transition placeholder:text-stone-500 focus:ring-2"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-on-primary transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Signing in..." : "Sign in"}
      </button>

      <div className="flex items-center justify-between gap-3 text-sm text-stone-300">
        <Link href="/auth/forgot-password" className="transition-colors hover:text-amber-200">
          Forgot password?
        </Link>
        <Link href="/auth/sign-up" className="transition-colors hover:text-amber-200">
          Create account
        </Link>
      </div>
    </form>
  );
}

"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { updatePasswordAction, type AuthActionState } from "../actions";

const initialState: AuthActionState = {};

export default function UpdatePasswordForm() {
  const searchParams = useSearchParams();
  const [state, formAction, isPending] = useActionState(updatePasswordAction, initialState);
  const queryError = searchParams.get("error");

  return (
    <form action={formAction} className="space-y-4">
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

      {state.success ? (
        <p className="rounded-lg border border-emerald-300/30 bg-emerald-300/10 px-3 py-2 text-sm text-emerald-100">
          {state.success}
        </p>
      ) : null}

      <div className="space-y-1.5">
        <label htmlFor="new-password" className="text-xs font-bold uppercase tracking-wide text-stone-200">
          New password
        </label>
        <input
          id="new-password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full rounded-lg border border-white/20 bg-[#120d0c] px-3 py-2.5 text-sm text-stone-100 outline-none ring-amber-300/40 transition placeholder:text-stone-500 focus:ring-2"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="confirm-password" className="text-xs font-bold uppercase tracking-wide text-stone-200">
          Confirm password
        </label>
        <input
          id="confirm-password"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full rounded-lg border border-white/20 bg-[#120d0c] px-3 py-2.5 text-sm text-stone-100 outline-none ring-amber-300/40 transition placeholder:text-stone-500 focus:ring-2"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-on-primary transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Updating password..." : "Update password"}
      </button>

      <p className="text-center text-sm text-stone-300">
        <Link href="/auth/sign-in" className="font-semibold text-amber-200 transition-colors hover:text-amber-100">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}

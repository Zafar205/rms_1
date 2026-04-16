"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUpAction, type AuthActionState } from "../actions";

const initialState: AuthActionState = {};

export default function SignUpForm() {
  const [state, formAction, isPending] = useActionState(signUpAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {state.error ? (
        <p className="rounded-lg border border-red-300/40 bg-red-300/10 px-3 py-2 text-sm text-red-100">
          {state.error}
        </p>
      ) : null}

      <div className="space-y-1.5">
        <label htmlFor="sign-up-email" className="text-xs font-bold uppercase tracking-wide text-stone-200">
          Email
        </label>
        <input
          id="sign-up-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="cashier@desivesi.com"
          className="w-full rounded-lg border border-white/20 bg-[#120d0c] px-3 py-2.5 text-sm text-stone-100 outline-none ring-amber-300/40 transition placeholder:text-stone-500 focus:ring-2"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="sign-up-phone" className="text-xs font-bold uppercase tracking-wide text-stone-200">
          Phone Number (Optional)
        </label>
        <input
          id="sign-up-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="+92 300 1234567"
          className="w-full rounded-lg border border-white/20 bg-[#120d0c] px-3 py-2.5 text-sm text-stone-100 outline-none ring-amber-300/40 transition placeholder:text-stone-500 focus:ring-2"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="sign-up-password" className="text-xs font-bold uppercase tracking-wide text-stone-200">
          Password
        </label>
        <input
          id="sign-up-password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full rounded-lg border border-white/20 bg-[#120d0c] px-3 py-2.5 text-sm text-stone-100 outline-none ring-amber-300/40 transition placeholder:text-stone-500 focus:ring-2"
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="sign-up-confirm-password"
          className="text-xs font-bold uppercase tracking-wide text-stone-200"
        >
          Confirm Password
        </label>
        <input
          id="sign-up-confirm-password"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full rounded-lg border border-white/20 bg-[#120d0c] px-3 py-2.5 text-sm text-stone-100 outline-none ring-amber-300/40 transition placeholder:text-stone-500 focus:ring-2"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="sign-up-role" className="text-xs font-bold uppercase tracking-wide text-stone-200">
          Role
        </label>
        <select
          id="sign-up-role"
          name="role"
          defaultValue="cashier"
          className="w-full rounded-lg border border-white/20 bg-[#120d0c] px-3 py-2.5 text-sm text-stone-100 outline-none ring-amber-300/40 transition focus:ring-2"
        >
          <option value="cashier">Cashier</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-on-primary transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Creating account..." : "Create account"}
      </button>

      <p className="text-center text-sm text-stone-300">
        Already have an account?{" "}
        <Link href="/auth/sign-in" className="font-semibold text-amber-200 transition-colors hover:text-amber-100">
          Sign in
        </Link>
      </p>
    </form>
  );
}

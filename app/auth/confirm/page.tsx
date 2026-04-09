"use client";

import type { EmailOtpType } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserAuthClient } from "@/lib/supabase/browser";

const isSafeRelativePath = (path: string | null): path is string =>
  Boolean(path && path.startsWith("/") && !path.startsWith("//"));

const buildSignInPath = (params: Record<string, string | undefined>) => {
  const url = new URL("/auth/sign-in", window.location.origin);

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });

  return `${url.pathname}${url.search}`;
};

const buildUpdatePasswordPath = (params: Record<string, string | undefined>) => {
  const url = new URL("/auth/update-password", window.location.origin);

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });

  return `${url.pathname}${url.search}`;
};

export default function AuthConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [statusMessage, setStatusMessage] = useState("Finalizing your sign-in...");

  useEffect(() => {
    let isActive = true;

    const finalizeAuth = async () => {
      const supabase = createSupabaseBrowserAuthClient();

      if (!supabase) {
        router.replace(
          buildSignInPath({
            error: "Supabase auth is not configured.",
          })
        );
        return;
      }

      const nextPathParam = searchParams.get("next");
      const flow = searchParams.get("flow");
      const code = searchParams.get("code");
      const tokenHash = searchParams.get("token_hash");
      const queryType = searchParams.get("type") as EmailOtpType | null;

      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const hashType = hashParams.get("type") as EmailOtpType | null;
      const type = queryType ?? hashType;
      const isRecoveryFlow =
        type === "recovery" || flow === "recovery" || nextPathParam === "/auth/update-password";
      const fallbackNextPath = isRecoveryFlow ? "/auth/update-password" : "/dashboard";
      const nextPath = isSafeRelativePath(nextPathParam) ? nextPathParam : fallbackNextPath;

      const providerError =
        searchParams.get("error_description") ?? hashParams.get("error_description");

      if (providerError) {
        if (isRecoveryFlow) {
          router.replace(
            buildUpdatePasswordPath({
              error: providerError,
            })
          );
          return;
        }

        router.replace(
          buildSignInPath({
            error: providerError,
          })
        );
        return;
      }

      let authError: string | undefined;

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        authError = error?.message;
      } else if (tokenHash && type) {
        const { error } = await supabase.auth.verifyOtp({
          type,
          token_hash: tokenHash,
        });
        authError = error?.message;
      } else if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        authError = error?.message;
      } else {
        authError = "Invalid or missing confirmation token.";
      }

      if (!isActive) {
        return;
      }

      if (authError) {
        if (isRecoveryFlow) {
          router.replace(
            buildUpdatePasswordPath({
              error: "This reset link is invalid or expired. Request a new password reset email.",
            })
          );
          return;
        }

        router.replace(
          buildSignInPath({
            error: "This confirmation link is invalid or expired.",
          })
        );
        return;
      }

      if (isRecoveryFlow) {
        setStatusMessage("Redirecting you to set a new password...");
        router.replace(nextPath);
        return;
      }

      if (type === "signup" || type === "email") {
        setStatusMessage("Account confirmed. Redirecting to sign in...");
        router.replace(
          buildSignInPath({
            message: "Account confirmed. You can sign in now.",
          })
        );
        return;
      }

      router.replace(nextPath);
    };

    void finalizeAuth();

    return () => {
      isActive = false;
    };
  }, [router, searchParams]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#140f0e] px-4 py-10 text-stone-100 sm:px-6">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-amber-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-red-700/20 blur-3xl" />

      <section className="relative mx-auto w-full max-w-md rounded-2xl border border-white/10 bg-[#211715]/90 p-6 shadow-2xl sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">Desi Vesi RMS</p>
        <h1 className="mt-2 text-3xl font-black leading-tight text-amber-100">Verifying Link</h1>
        <p className="mt-2 text-sm text-stone-300">{statusMessage}</p>
      </section>
    </main>
  );
}

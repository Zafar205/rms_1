"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { AppRole } from "@/lib/auth/types";
import { createSupabaseEmailAuthClient, createSupabaseServerAuthClient } from "@/lib/supabase/auth";

export type AuthActionState = {
  error?: string;
  success?: string;
};

const getTextValue = (value: FormDataEntryValue | null) => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
};

const parseRoleValue = (value: FormDataEntryValue | null): AppRole => {
  const role = getTextValue(value);

  if (role === "admin") {
    return "admin";
  }

  return "cashier";
};

const getSafeNextPath = (value: FormDataEntryValue | null) => {
  const path = getTextValue(value);

  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return null;
  }

  return path;
};

const getSiteUrl = async () => {
  const headerStore = await headers();
  const origin = headerStore.get("origin");

  if (origin) {
    return origin;
  }

  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const protocol = headerStore.get("x-forwarded-proto") ?? "http";

  if (host) {
    return `${protocol}://${host}`;
  }

  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
};

export async function signInAction(
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = getTextValue(formData.get("email")).toLowerCase();
  const password = getTextValue(formData.get("password"));
  const nextPath = getSafeNextPath(formData.get("next"));

  if (!email || !password) {
    return {
      error: "Email and password are required.",
    };
  }

  const supabase = await createSupabaseServerAuthClient();

  if (!supabase) {
    return {
      error:
        "Supabase auth is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY.",
    };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      error: error.message,
    };
  }

  redirect(nextPath ?? "/dashboard");
}

export async function signUpAction(
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = getTextValue(formData.get("email")).toLowerCase();
  const password = getTextValue(formData.get("password"));
  const role = parseRoleValue(formData.get("role"));

  if (!email || !password) {
    return {
      error: "Email and password are required.",
    };
  }

  if (password.length < 8) {
    return {
      error: "Password must be at least 8 characters long.",
    };
  }

  const supabase = createSupabaseEmailAuthClient();

  if (!supabase) {
    return {
      error:
        "Supabase auth is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY.",
    };
  }

  const siteUrl = await getSiteUrl();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role,
      },
      emailRedirectTo: `${siteUrl}/auth/confirm`,
    },
  });

  if (error) {
    return {
      error: error.message,
    };
  }

  const encodedEmail = encodeURIComponent(email);
  redirect(`/auth/account-confirmation?email=${encodedEmail}`);
}

export async function forgotPasswordAction(
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = getTextValue(formData.get("email")).toLowerCase();

  if (!email) {
    return {
      error: "Email is required.",
    };
  }

  const supabase = createSupabaseEmailAuthClient();

  if (!supabase) {
    return {
      error:
        "Supabase auth is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY.",
    };
  }

  const siteUrl = await getSiteUrl();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/confirm?flow=recovery&next=/auth/update-password`,
  });

  if (error) {
    return {
      error: error.message,
    };
  }

  return {
    success: "Password reset email sent. Check your inbox to continue.",
  };
}

export async function updatePasswordAction(
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const password = getTextValue(formData.get("password"));
  const confirmPassword = getTextValue(formData.get("confirmPassword"));

  if (!password) {
    return {
      error: "New password is required.",
    };
  }

  if (password.length < 8) {
    return {
      error: "Password must be at least 8 characters long.",
    };
  }

  if (password !== confirmPassword) {
    return {
      error: "Passwords do not match.",
    };
  }

  const supabase = await createSupabaseServerAuthClient();

  if (!supabase) {
    return {
      error:
        "Supabase auth is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY.",
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "Your reset session is missing or expired. Request a new password reset email.",
    };
  }

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return {
      error: error.message,
    };
  }

  return {
    success: "Password updated successfully. You can now continue to your dashboard.",
  };
}

export async function signOutAction() {
  const supabase = await createSupabaseServerAuthClient();

  if (supabase) {
    await supabase.auth.signOut();
  }

  redirect("/auth/sign-in");
}

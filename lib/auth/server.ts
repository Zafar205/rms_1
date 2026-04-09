import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import type { AppRole, AuthenticatedUser } from "./types";
import { createSupabaseServerAuthClient } from "@/lib/supabase/auth";

const signInPath = "/auth/sign-in";

const parseRole = (value: unknown): AppRole => (value === "admin" ? "admin" : "cashier");

export const getDashboardHomePathForRole = (role: AppRole) =>
  role === "admin" ? "/dashboard/menu" : "/dashboard/orders";

export const getUserRoleById = cache(async (userId: string, metadataRole?: unknown): Promise<AppRole> => {
  const supabase = await createSupabaseServerAuthClient();

  if (!supabase) {
    return parseRole(metadataRole);
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle<{ role: AppRole }>();

  if (error || !data?.role) {
    return parseRole(metadataRole);
  }

  return parseRole(data.role);
});

export const getCurrentUser = cache(async (): Promise<AuthenticatedUser | null> => {
  const supabase = await createSupabaseServerAuthClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  const role = await getUserRoleById(user.id, user.user_metadata.role);

  return {
    id: user.id,
    email: user.email ?? "",
    role,
  };
});

export async function requireAuthenticatedUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect(signInPath);
  }

  return user;
}

export async function requireAdminUser() {
  const user = await requireAuthenticatedUser();

  if (user.role !== "admin") {
    redirect("/dashboard/orders");
  }

  return user;
}

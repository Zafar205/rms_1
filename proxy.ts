import { NextResponse, type NextRequest } from "next/server";
import type { AppRole } from "@/lib/auth/types";
import { createSupabaseProxyAuthClient, hasSupabaseAuthConfiguration } from "@/lib/supabase/auth";

const authOnlyRoutes = new Set([
  "/auth/sign-in",
  "/auth/sign-up",
  "/auth/forgot-password",
  "/auth/account-confirmation",
]);

const adminOnlyRoutePrefixes = ["/dashboard/menu"];

const parseRole = (value: unknown): AppRole => (value === "admin" ? "admin" : "cashier");

export async function proxy(request: NextRequest) {
  if (!hasSupabaseAuthConfiguration()) {
    return NextResponse.next();
  }

  const { supabase, response } = createSupabaseProxyAuthClient(request);

  if (!supabase) {
    return response;
  }

  const redirectWithCookies = (targetPath: string) => {
    const redirectUrl = new URL(targetPath, request.url);
    const redirectResponse = NextResponse.redirect(redirectUrl);

    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });

    return redirectResponse;
  };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isDashboardRoute = pathname.startsWith("/dashboard");

  if (!user && isDashboardRoute) {
    const nextPath = `${pathname}${request.nextUrl.search}`;
    const signInUrl = new URL("/auth/sign-in", request.url);
    signInUrl.searchParams.set("next", nextPath);

    const redirectResponse = NextResponse.redirect(signInUrl);

    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });

    return redirectResponse;
  }

  if (user && authOnlyRoutes.has(pathname)) {
    return redirectWithCookies("/dashboard");
  }

  if (user && adminOnlyRoutePrefixes.some((prefix) => pathname.startsWith(prefix))) {
    let role = parseRole(user.user_metadata.role);

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle<{ role: AppRole }>();

    if (profile?.role) {
      role = parseRole(profile.role);
    }

    if (role !== "admin") {
      return redirectWithCookies("/dashboard/orders");
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};

import { redirect } from "next/navigation";
import { getDashboardHomePathForRole, requireAuthenticatedUser } from "@/lib/auth/server";

export default async function DashboardHomePage() {
  const user = await requireAuthenticatedUser();

  redirect(getDashboardHomePathForRole(user.role));
}
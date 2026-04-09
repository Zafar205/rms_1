import type { ReactNode } from "react";
import { requireAuthenticatedUser } from "@/lib/auth/server";
import DashboardSidebar from "./components/DashboardSidebar";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await requireAuthenticatedUser();

  return (
    <div className="min-h-screen bg-[#161110] text-stone-100 md:flex">
      <DashboardSidebar role={user.role} userEmail={user.email} />
      <main className="flex-1 px-5 py-6 md:px-8 md:py-8">{children}</main>
    </div>
  );
}
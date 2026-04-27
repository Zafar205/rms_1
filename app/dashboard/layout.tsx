import type { ReactNode } from "react";
import { requireAuthenticatedUser } from "@/lib/auth/server";
import DashboardSidebar from "./components/DashboardSidebar";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await requireAuthenticatedUser();

  return (
    <div className="min-h-screen bg-[#161110] text-stone-100 md:flex print:block print:bg-white print:text-black">
      <DashboardSidebar role={user.role} userEmail={user.email} />
      <main className="flex-1 px-5 py-6 md:px-8 md:py-8 print:px-0 print:py-0">{children}</main>
    </div>
  );
}
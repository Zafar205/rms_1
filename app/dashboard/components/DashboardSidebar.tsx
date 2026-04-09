"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAction } from "@/app/auth/actions";
import type { AppRole } from "@/lib/auth/types";
import {
  MdChevronRight,
  MdEventSeat,
  MdLogout,
  MdRestaurantMenu,
  MdShoppingBag,
} from "react-icons/md";

const adminDashboardLinks = [
  {
    href: "/dashboard/menu",
    label: "Menu",
    icon: MdRestaurantMenu,
  },
  {
    href: "/dashboard/reservations",
    label: "Reservations",
    icon: MdEventSeat,
  },
  {
    href: "/dashboard/orders",
    label: "Orders",
    icon: MdShoppingBag,
  },
];

const cashierDashboardLinks = adminDashboardLinks.filter((link) => link.href !== "/dashboard/menu");

type DashboardSidebarProps = {
  role: AppRole;
  userEmail: string;
};

export default function DashboardSidebar({ role, userEmail }: DashboardSidebarProps) {
  const pathname = usePathname();
  const dashboardLinks = role === "admin" ? adminDashboardLinks : cashierDashboardLinks;
  const isAdmin = role === "admin";

  return (
    <aside className="sticky top-0 h-screen w-full border-b border-white/10 bg-[#1b1311] p-5 md:w-[280px] md:border-b-0 md:border-r">
      <div className="mb-8 rounded-xl border border-amber-500/20 bg-[#2a1b18] p-4">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">Dashboard</p>
        <h2 className="mt-2 text-2xl font-black text-amber-100">Desi Vesi RMS</h2>
        <p className="mt-1 text-sm text-stone-300">{userEmail || "Signed in user"}</p>
        <p className="mt-2 inline-flex rounded-full bg-[#120d0c] px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-amber-200">
          {role}
        </p>
      </div>

      <nav className="space-y-2">
        {dashboardLinks.map((link) => {
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`group flex items-center justify-between rounded-lg px-3 py-3 text-sm font-semibold transition-colors ${isActive ? "bg-primary text-on-primary" : "bg-[#251816] text-stone-200 hover:bg-[#31201d]"}`}
            >
              <span className="inline-flex items-center gap-2.5">
                <link.icon className="text-lg" />
                {link.label}
              </span>
              <MdChevronRight className={`text-base ${isActive ? "opacity-100" : "opacity-40 group-hover:opacity-80"}`} />
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 rounded-xl border border-white/10 bg-[#251816] p-4 text-sm text-stone-300">
        <p className="font-bold text-amber-200">Tip</p>
        {isAdmin ? (
          <p className="mt-1">Use the Menu tab to add, edit, and hide dishes from the public menu.</p>
        ) : (
          <p className="mt-1">Cashier access includes orders and reservations only.</p>
        )}
      </div>

      <form action={signOutAction} className="mt-4">
        <button
          type="submit"
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-3 py-2.5 text-sm font-semibold text-stone-100 transition-colors hover:bg-white/10"
        >
          <MdLogout className="text-base" />
          Sign out
        </button>
      </form>
    </aside>
  );
}
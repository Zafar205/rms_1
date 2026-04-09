import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#140f0e] px-4 py-10 text-stone-100 sm:px-6">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-amber-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-red-700/20 blur-3xl" />

      <div className="relative mx-auto w-full max-w-md rounded-2xl border border-white/10 bg-[#211715]/90 p-6 shadow-2xl sm:p-8">
        {children}
      </div>
    </main>
  );
}

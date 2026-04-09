import type { ReactNode } from "react";

type AuthCardProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export default function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">Desi Vesi RMS</p>
        <h1 className="text-3xl font-black leading-tight text-amber-100">{title}</h1>
        <p className="text-sm text-stone-300">{subtitle}</p>
      </header>

      {children}
    </section>
  );
}

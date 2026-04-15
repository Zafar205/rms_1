"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function SiteNavbar() {
  const [isNavVisible, setIsNavVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDelta = currentScrollY - lastScrollY.current;

      if (currentScrollY <= 24) {
        setIsNavVisible(true);
      } else if (scrollDelta > 4) {
        setIsNavVisible(false);
      } else if (scrollDelta < -4) {
        setIsNavVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <nav
      className={`fixed top-0 z-50 w-full bg-[#1A120E]/95 shadow-lg shadow-black/20 backdrop-blur-md transition-transform duration-300 ${isNavVisible ? "translate-y-0" : "-translate-y-full"}`}
    >
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-6">
        <Link href="/" aria-label="Desi Vesi home" className="flex items-center">
          <Image
            src="/desi_vesi.png"
            alt="Desi Vesi logo"
            width={240}
            height={96}
            priority
            className="h-16 w-auto sm:h-20"
            loading="eager"
          />
        </Link>

        <div className="hidden items-center space-x-8 md:flex">
          <Link href="/menu" className="font-bold text-amber-100 transition-colors hover:text-amber-300">
            Menu
          </Link>
          <Link
            href="/dashboard"
            className="font-semibold text-stone-300 transition-colors hover:text-amber-300"
          >
            Dashboard
          </Link>
          <Link
            href="/#reservation"
            className="font-semibold text-stone-300 transition-colors hover:text-amber-300"
          >
            Reservations
          </Link>
          <Link
            href="/#about"
            className="font-semibold text-stone-300 transition-colors hover:text-amber-300"
          >
            About
          </Link>
          <Link
            href="/#contact"
            className="font-semibold text-stone-300 transition-colors hover:text-amber-300"
          >
            Contact
          </Link>
        </div>

        <Link
          href="/#reservation"
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-bold tracking-tight text-on-primary shadow-lg transition-transform duration-200 hover:scale-95 sm:text-base"
        >
          Book a Table
        </Link>
      </div>
    </nav>
  );
}

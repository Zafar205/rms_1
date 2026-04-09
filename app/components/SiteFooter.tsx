import Image from "next/image";

export default function SiteFooter() {
  return (
    <footer className="w-full bg-[#1A120E] py-12">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-8 md:grid-cols-3">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Image
              src="/desi_vesi.png"
              alt="Desi Vesi logo"
              width={220}
              height={88}
              className="h-16 w-auto md:h-20"
            />
          </div>
          <p className="text-sm tracking-wide text-stone-300">
            Copyright 2026 Desi Vesi Foods. Crafted for the Modern Hearth.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h5 className="mb-2 font-bold text-amber-200">Connect</h5>
          <a
            className="text-sm tracking-wide text-stone-300 opacity-80 transition-all hover:text-amber-300 hover:opacity-100"
            href="https://instagram.com/desivesifoods1"
            target="_blank"
            rel="noreferrer"
          >
            Instagram @desivesifoods1
          </a>
          <a
            className="text-sm tracking-wide text-stone-300 opacity-80 transition-all hover:text-amber-300 hover:opacity-100"
            href="https://wa.me/923701083388"
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp +92 370 1083388
          </a>
          <a
            className="text-sm tracking-wide text-stone-300 opacity-80 transition-all hover:text-amber-300 hover:opacity-100"
            href="https://desivesifoods.com"
            target="_blank"
            rel="noreferrer"
          >
            desivesifoods.com
          </a>
        </div>

        <div className="flex flex-col gap-2">
          <h5 className="mb-2 font-bold text-amber-200">Contact</h5>
          <a
            className="text-sm tracking-wide text-stone-300 opacity-80 transition-all hover:text-amber-300 hover:opacity-100"
            href="tel:03701083388"
          >
            0370 1083388
          </a>
          <a
            className="text-sm tracking-wide text-stone-300 opacity-80 transition-all hover:text-amber-300 hover:opacity-100"
            href="mailto:desivesifoods@gmail.com"
          >
            desivesifoods@gmail.com
          </a>
          <p className="text-sm tracking-wide text-stone-300 opacity-80">
            Shop No 09, Sector 5K, Saima Blessing Apartment, New Karachi, Pakistan
          </p>
        </div>
      </div>
    </footer>
  );
}

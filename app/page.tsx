/* eslint-disable @next/next/no-img-element */

import type { IconType } from "react-icons";
import SiteFooter from "./components/SiteFooter";
import SiteNavbar from "./components/SiteNavbar";
import {
  MdArrowForward,
  MdCall,
  MdEvent,
  MdEventSeat,
  MdIcecream,
  MdLocationOn,
  MdMail,
  MdOutdoorGrill,
  MdRestaurant,
  MdRestaurantMenu,
  MdShare,
} from "react-icons/md";

const categoryCards: {
  icon: IconType;
  title: string;
  description: string;
  iconColor: string;
  cardColor: string;
}[] = [
  {
    icon: MdRestaurantMenu,
    title: "Appetizers",
    description:
      "Small plates designed to ignite the palate and spark conversation.",
    iconColor: "text-primary",
    cardColor: "bg-surface-container-low hover:bg-surface-container-high",
  },
  {
    icon: MdOutdoorGrill,
    title: "Main Course",
    description:
      "The heart of our hearth, prepared over open flames and seasoned with legacy.",
    iconColor: "text-secondary",
    cardColor:
      "bg-surface-container-lowest border border-outline-variant/15 hover:bg-surface-container-low",
  },
  {
    icon: MdIcecream,
    title: "Desserts",
    description:
      "Sweet conclusions inspired by seasonal harvests and aromatic spices.",
    iconColor: "text-tertiary",
    cardColor: "bg-surface-container-low hover:bg-surface-container-high",
  },
];

const featuredDishes = [
  {
    name: "Royal Chicken Biryani",
    price: "PKR 1,850",
    description:
      "Aromatic basmati rice layered with saffron, tender chicken, caramelized onions, and fresh mint.",
    image: "/biryani.jpeg",
    alt: "A serving of chicken biryani topped with fried onions and herbs",
  },
  {
    name: "Smoked Seekh Kebab",
    price: "PKR 1,450",
    description:
      "Juicy minced kebabs grilled over charcoal, served with mint chutney and pickled onions.",
    image: "/kebab.jpeg",
    alt: "Chargrilled seekh kebabs plated with lemon wedges and chutney",
  },
  {
    name: "Tandoori Chicken Tikka",
    price: "PKR 1,650",
    description:
      "Yogurt-marinated chicken tikka roasted in the tandoor with a bold blend of desi spices.",
    image: "/tikka.jpeg",
    alt: "Tandoori chicken tikka pieces with smoky edges and fresh garnish",
  },
];

const galleryImages = [
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuClH5-KCUJ34vBT9QIDVyoUF12m1ddtuq9MwyhzUDMLnUl1jFP12vgc5Txnz-VfM-yXrOMpUNPLre-x2Kyb28wKdH9Q0_bKipy700Un5XOSBP48boPg5aRB0eTdIXIc9kOvP0BJOj3nsXk3vnxYrGcgER0QC19BkhZVqF8owp0ZkIPPBGFEgjJ1iz3LVTEdR0kT6mVU7rjWdLqYvmH6SMNe7REF7juR_UU5eX41Rs5qhYaG1Mccp7kwlRDxNFuqIAj9PekhA6zAKwk",
    alt: "Chef expertly seasoning a dish over an open flame with dramatic lighting",
    className: "translate-y-8",
  },
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBBALOAjQVSk-IilZqh554Dk9zm4Fb5EiMTGx_rKOABt3PBng1-aF547wT8n4FlMW5yYnpvVoGvc_FMqXxH4liQ_B6g-c4vuCqkoSS-uOCaSNIYofJAao_iKfNgOlTMOYxyo-e8aQbp8cDb9Uu_lsDeNzpgIsIOzqHl_MhEXcRZ52eUssiTFeH6f_nD_6v3I8_k8q0bOTwzlcGcvZTTV3wfipu27XqvdtvKMPcJhOyGw-MrVg5ZzO4lEVKTOtIJDvo-uBiA02EGpWE",
    alt: "Luxury restaurant interior with warm ambient lighting and plush seating",
    className: "",
  },
];

const contactItems: { icon: IconType; title: string; subtitle: string }[] = [
  {
    icon: MdLocationOn,
    title: "Shop No 09, Sector 5K",
    subtitle: "Saima Blessing Apartment, New Karachi, Karachi, Pakistan",
  },
  {
    icon: MdCall,
    title: "0370 1083388",
    subtitle: "WhatsApp: +92 370 1083388",
  },
  {
    icon: MdMail,
    title: "desivesifoods@gmail.com",
    subtitle: "Email for reservations and inquiries",
  },
];

export default function Home() {
  return (
    <div className="bg-background text-on-background selection:bg-primary-fixed selection:text-[#410001]">
      <SiteNavbar />

      <header className="relative flex min-h-screen items-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <img
            className="h-full w-full object-cover"
            alt="Gourmet plated dish with warm atmospheric lighting in a premium restaurant setting"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBB4wSTvSviYomhbjBENtD2aVGEyi_gwGZibCP-l5qBe8EO30tL_1h4ncaXQuCSQQlqYItCovz38yFsJmJ7nY4GDGAUnYxoBCGrXG55_tinsJOmujllm1k2PoS4RKi3vCczE5lpnJ2A-uzWXwpACmdrkoi7k7uRJ8f2hsP9CIR0-wxDl-4j0LeY2I9DATzdqaUywc1UmT4R5gXc33IvNGzO1PHpznjXsD0r8hMEyblWPCNcwnPiRyRdg9oxXL-972J4H1H-CezTDnw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-on-background/85 via-on-background/45 to-transparent" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6">
          <div className="max-w-2xl animate-fade-rise">
            <span className="mb-6 inline-block rounded-full bg-secondary-container px-3 py-1 text-xs font-bold uppercase tracking-widest text-on-secondary-container">
              IGNITING TRADITION
            </span>
            <h1 className="mb-8 text-5xl font-black leading-[0.9] tracking-tighter text-on-primary sm:text-6xl md:text-8xl">
              Forged in Fire.  <span className="text-secondary-container">Plated with Purpose.</span>
            </h1>
            <p className="mb-10 max-w-lg text-lg font-medium leading-relaxed text-on-primary/90 sm:text-xl">
            We return to the very roots of cooking. Open flames, glowing embers, and time honored spices, elevated through contemporary techniques. A dining experience that speaks directly to the soul.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="#reservation"
                className="bg-flame-gradient inline-flex items-center gap-2 rounded-lg px-8 py-4 text-lg font-black text-on-primary transition-transform hover:scale-95"
              >
                Reserve Your Table
                <MdArrowForward className="text-2xl" />
              </a>
              <a
                href="/menu"
                className="rounded-lg bg-surface-container-lowest/10 px-8 py-4 text-lg font-bold text-on-primary outline outline-1 outline-white/20 backdrop-blur-md transition-all hover:bg-white/20"
              >
                View The Menu
              </a>
            </div>
          </div>
        </div>
      </header>

      <section id="menu" className="bg-surface py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-20 text-center">
            <h2 className="mb-4 text-4xl font-black tracking-tight md:text-5xl">Curated Flavors</h2>
            <div className="mx-auto h-1.5 w-24 rounded-full bg-primary" />
          </div>

          <div className="grid gap-12 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-4">
              {categoryCards.map((card) => (
                <article
                  key={card.title}
                  className={`group cursor-pointer rounded-xl p-8 transition-colors ${card.cardColor}`}
                >
                  <card.icon className={`mb-4 block text-4xl ${card.iconColor}`} />
                  <h3 className="mb-2 text-2xl font-bold">{card.title}</h3>
                  <p className="leading-relaxed text-on-surface-variant">{card.description}</p>
                </article>
              ))}
            </div>

            <div className="editorial-shadow rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-2 md:p-12 lg:col-span-8">
              <div className="space-y-12">
                {featuredDishes.map((dish) => (
                  <article key={dish.name} className="flex flex-col items-start gap-8 md:flex-row">
                    <div className="h-48 w-full flex-shrink-0 overflow-hidden rounded-lg md:w-48">
                      <img className="h-full w-full object-cover" alt={dish.alt} src={dish.image} />
                    </div>
                    <div className="flex-grow">
                      <div className="mb-2 flex items-baseline justify-between gap-4">
                        <h4 className="text-2xl font-bold">{dish.name}</h4>
                        <span className="text-xl font-bold text-primary">{dish.price}</span>
                      </div>
                      <p className="text-lg italic leading-relaxed text-on-surface-variant">
                        {dish.description}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="overflow-hidden bg-surface-container-low py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-2">
          <div className="relative">
            <div className="absolute -left-12 -top-12 h-64 w-64 rounded-full bg-secondary-container/20 blur-3xl" />
            <div className="relative z-10 grid grid-cols-2 gap-4">
              {galleryImages.map((image) => (
                <img
                  key={image.src}
                  className={`rounded-lg shadow-xl ${image.className}`}
                  alt={image.alt}
                  src={image.src}
                />
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-8 text-4xl font-black leading-tight md:text-5xl">Our Philosophy</h2>
            <div className="space-y-6 text-lg leading-relaxed text-on-surface-variant">
              <p>
                At Desi Vesi, we believe the hearth is more than a cooking station. It is the
                soul of the home. Our kitchen is an intersection where ancestral recipes are
                reinvented through contemporary techniques.
              </p>
              <p>
                We source only the most vibrant seasonal ingredients, treating each element with
                respect. From the charcoal smoke of the tandoor to the delicate plating of our
                modern mains, every detail is a tribute to the craft of dining.
              </p>
              <div className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-px w-12 bg-primary" />
                  <span className="font-bold uppercase tracking-widest text-primary">
                    The Hearth Tradition
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="reservation" className="relative bg-surface py-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-8 shadow-2xl md:p-16">
            <div className="absolute right-0 top-0 p-8 text-primary/10">
              <MdEventSeat className="text-9xl" />
            </div>
            <div className="relative z-10">
              <div className="mb-12 text-center">
                <h2 className="mb-4 text-4xl font-black">Secure Your Seat</h2>
                <p className="text-on-surface-variant">
                  Join us for an evening of sensory storytelling.
                </p>
              </div>

              <form className="space-y-8">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="block px-1 text-sm font-bold uppercase tracking-tight text-on-surface-variant">
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your name"
                      className="w-full rounded-lg border-none bg-surface-container-low px-4 py-4 outline-none transition-all focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block px-1 text-sm font-bold uppercase tracking-tight text-on-surface-variant">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="name@example.com"
                      className="w-full rounded-lg border-none bg-surface-container-low px-4 py-4 outline-none transition-all focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-2">
                    <label className="block px-1 text-sm font-bold uppercase tracking-tight text-on-surface-variant">
                      Date
                    </label>
                    <input
                      type="date"
                      className="w-full appearance-none rounded-lg border-none bg-surface-container-low px-4 py-4 outline-none transition-all focus:ring-2 focus:ring-primary/40"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block px-1 text-sm font-bold uppercase tracking-tight text-on-surface-variant">
                      Time
                    </label>
                    <select className="w-full rounded-lg border-none bg-surface-container-low px-4 py-4 outline-none transition-all focus:ring-2 focus:ring-primary/40">
                      <option>18:00</option>
                      <option>19:30</option>
                      <option>21:00</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block px-1 text-sm font-bold uppercase tracking-tight text-on-surface-variant">
                      Guests
                    </label>
                    <select className="w-full rounded-lg border-none bg-surface-container-low px-4 py-4 outline-none transition-all focus:ring-2 focus:ring-primary/40">
                      <option>2 Persons</option>
                      <option>4 Persons</option>
                      <option>6+ Persons</option>
                    </select>
                  </div>
                </div>

                <button className="bg-flame-gradient w-full rounded-lg py-5 text-xl font-black text-on-primary shadow-xl transition-all hover:shadow-primary/20">
                  Confirm Reservation
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="bg-surface-container-low py-24">
        <div className="mx-auto grid max-w-7xl items-stretch gap-12 px-6 md:grid-cols-2">
          <div className="flex flex-col justify-between rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-10">
            <div>
              <h2 className="mb-8 text-3xl font-black">Get In Touch</h2>
              <div className="space-y-6">
                {contactItems.map((item) => (
                  <div key={item.title} className="flex items-start gap-4">
                    <item.icon className="text-2xl text-primary" />
                    <div>
                      <p className="font-bold">{item.title}</p>
                      <p className="text-on-surface-variant">{item.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-12 flex gap-4">
              <a
                href="https://desivesifoods.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Visit website"
                className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-surface-container-low text-on-surface transition-colors hover:bg-primary-fixed"
              >
                <MdShare className="text-xl" />
              </a>
              <a
                href="mailto:desivesifoods@gmail.com"
                aria-label="Send email"
                className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-surface-container-low text-on-surface transition-colors hover:bg-primary-fixed"
              >
                <MdMail className="text-xl" />
              </a>
            </div>
          </div>

          <div className="group relative h-[450px] overflow-hidden rounded-xl shadow-sm">
            <div className="absolute inset-0 bg-stone-200 grayscale contrast-125">
              <img
                className="h-full w-full object-cover opacity-50"
                alt="Stylized architectural map view of a clean urban grid"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAfkIJun9aqI9yNMq-F99jQDVuwALhLXvyxTLMhB_0ahu9Ubb3B4giGwqlEtdyHcKtsynZh74zqEaKvMXbckl_p7XsHGZ6k43OeoKNpKxlnJ2iqyk7oJ2iV4t1D11dKxHgB9fCggG_cOyMaj1yir75BrrjrA4TYY_EvmWK_n3p9xD5wpLcrnY7IPoEBdh6Py41Gmbp3puj-hyEkOFhE9WGds7GX0F2zOvUN5RGVNr9i4TuzlYBsewgymj5AgSD27LZQWqwrLtLjGSA"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-primary text-white shadow-2xl">
                  <MdRestaurant className="text-3xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />

      <a
        href="#reservation"
        className="fixed bottom-8 right-8 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-on-primary shadow-2xl md:hidden"
      >
        <MdEvent className="text-3xl" />
      </a>
    </div>
  );
}

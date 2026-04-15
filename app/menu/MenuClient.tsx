/* eslint-disable @next/next/no-img-element */

"use client";

import type { MenuItem } from "@/lib/menu-data";
import type { MenuCategory } from "@/lib/menu-categories";
import Link from "next/link";
import { useMemo, useState } from "react";
import { MdSearch } from "react-icons/md";
import SiteFooter from "../components/SiteFooter";
import SiteNavbar from "../components/SiteNavbar";

const formatPkr = (amount: number) => `PKR ${new Intl.NumberFormat("en-PK").format(amount)}`;
const ALL_CATEGORY_VALUE = "ALL";
const normalizeCategory = (value: string) => value.trim().toUpperCase();

type MenuClientProps = {
  menuItems: MenuItem[];
  menuCategories: MenuCategory[];
};

export default function MenuClient({ menuItems, menuCategories }: MenuClientProps) {
  const categoryOptions = useMemo(() => {
    const uniqueCategoryOptions = new Set<string>();

    for (const category of menuCategories) {
      const normalized = normalizeCategory(category.name);

      if (normalized) {
        uniqueCategoryOptions.add(normalized);
      }
    }

    for (const item of menuItems) {
      const normalized = normalizeCategory(item.category);

      if (normalized) {
        uniqueCategoryOptions.add(normalized);
      }
    }

    return [ALL_CATEGORY_VALUE, ...[...uniqueCategoryOptions].sort((left, right) => left.localeCompare(right))];
  }, [menuCategories, menuItems]);
  const lowestPrice = useMemo(
    () => (menuItems.length > 0 ? Math.min(...menuItems.map((item) => item.pricePkr)) : 0),
    [menuItems]
  );
  const highestPrice = useMemo(
    () => (menuItems.length > 0 ? Math.max(...menuItems.map((item) => item.pricePkr)) : 0),
    [menuItems]
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORY_VALUE);
  const [minPrice, setMinPrice] = useState(lowestPrice);
  const [maxPrice, setMaxPrice] = useState(highestPrice);
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc">("featured");

  const filteredItems = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    const results = menuItems.filter((item) => {
      const matchesCategory =
        selectedCategory === ALL_CATEGORY_VALUE || normalizeCategory(item.category) === selectedCategory;
      const hasPriceFilter = highestPrice > 0;
      const matchesPrice =
        !hasPriceFilter || (item.pricePkr >= Math.min(minPrice, maxPrice) && item.pricePkr <= maxPrice);
      const searchableText = `${item.name} ${item.description} ${item.category} ${item.pricePkr}`
        .toLowerCase()
        .trim();
      const matchesSearch = normalizedQuery.length === 0 || searchableText.includes(normalizedQuery);

      return matchesCategory && matchesPrice && matchesSearch;
    });

    if (sortBy === "price-asc") {
      return [...results].sort((a, b) => a.pricePkr - b.pricePkr);
    }

    if (sortBy === "price-desc") {
      return [...results].sort((a, b) => b.pricePkr - a.pricePkr);
    }

    return results;
  }, [highestPrice, maxPrice, menuItems, minPrice, searchQuery, selectedCategory, sortBy]);

  return (
    <div className="min-h-screen bg-surface text-on-background selection:bg-primary-fixed selection:text-[#410001]">
      <SiteNavbar />

      <main className="pb-14 pt-28 md:pb-16 md:pt-32">
        <section className="mx-auto max-w-7xl px-6">
          <div className="mb-10 text-center">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-primary">
              Desi Favorites
            </p>
            <h2 className="mb-4 text-4xl font-black tracking-tight md:text-5xl">Find Your Flavor</h2>
            <p className="mx-auto max-w-2xl text-on-surface-variant">
              Browse dishes in a grid, search instantly, and filter by price to match your taste
              and budget.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
            <aside className="h-fit rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-6 lg:sticky lg:top-24">
              <h3 className="mb-5 text-2xl font-black">Filters</h3>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="search" className="text-sm font-bold uppercase tracking-wide">
                    Search
                  </label>
                  <div className="flex items-center gap-2 rounded-lg border border-outline-variant/40 bg-surface-container-low px-3">
                    <MdSearch className="text-xl text-on-surface-variant" />
                    <input
                      id="search"
                      type="search"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Biryani, kebab, tikka..."
                      className="w-full bg-transparent py-3 outline-none placeholder:text-on-surface-variant/70"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="category" className="text-sm font-bold uppercase tracking-wide">
                    Category
                  </label>
                  <select
                    id="category"
                    value={selectedCategory}
                    onChange={(event) => setSelectedCategory(event.target.value)}
                    className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-3 py-3 outline-none"
                  >
                    {categoryOptions.map((category) => (
                      <option key={category} value={category}>
                        {category === ALL_CATEGORY_VALUE ? "All" : category}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-bold uppercase tracking-wide">Price Range</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="mb-1 text-xs font-semibold text-on-surface-variant">Min PKR</p>
                      <input
                        type="number"
                        min={lowestPrice}
                        max={maxPrice || highestPrice}
                        step={50}
                        value={minPrice}
                        onChange={(event) => {
                          const parsed = Number(event.target.value);

                          if (Number.isNaN(parsed)) {
                            return;
                          }

                          const clamped = Math.max(lowestPrice, Math.min(parsed, maxPrice));
                          setMinPrice(clamped);
                        }}
                        disabled={menuItems.length === 0}
                        className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-3 py-2.5 outline-none disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>

                    <div>
                      <p className="mb-1 text-xs font-semibold text-on-surface-variant">Max PKR</p>
                      <input
                        type="number"
                        min={minPrice}
                        max={highestPrice}
                        step={50}
                        value={maxPrice}
                        onChange={(event) => {
                          const parsed = Number(event.target.value);

                          if (Number.isNaN(parsed)) {
                            return;
                          }

                          const clamped = Math.min(highestPrice, Math.max(parsed, minPrice));
                          setMaxPrice(clamped);
                        }}
                        disabled={menuItems.length === 0}
                        className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-3 py-2.5 outline-none disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>
                  </div>

                  <input
                    type="range"
                    min={lowestPrice}
                    max={highestPrice}
                    step={50}
                    value={maxPrice}
                    onChange={(event) => {
                      const parsed = Number(event.target.value);
                      const clamped = Math.min(highestPrice, Math.max(parsed, minPrice));
                      setMaxPrice(clamped);
                    }}
                    disabled={menuItems.length === 0}
                    className="w-full accent-primary disabled:cursor-not-allowed disabled:opacity-60"
                  />
                  <p className="text-xs text-on-surface-variant">
                    {menuItems.length > 0 ? `Up to ${formatPkr(maxPrice)}` : "No pricing data available"}
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="sort" className="text-sm font-bold uppercase tracking-wide">
                    Sort By
                  </label>
                  <select
                    id="sort"
                    value={sortBy}
                    onChange={(event) =>
                      setSortBy(event.target.value as "featured" | "price-asc" | "price-desc")
                    }
                    className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-3 py-3 outline-none"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory(ALL_CATEGORY_VALUE);
                    setMinPrice(lowestPrice);
                    setMaxPrice(highestPrice);
                    setSortBy("featured");
                  }}
                  className="w-full rounded-lg border border-outline-variant/40 bg-surface px-4 py-2.5 font-bold text-on-surface transition-colors hover:bg-surface-container-low"
                >
                  Reset Filters
                </button>
              </div>
            </aside>

            <div>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <p className="font-semibold text-on-surface-variant">
                  Showing <span className="text-on-surface">{filteredItems.length}</span> dishes
                </p>
                <p className="text-sm font-semibold text-on-surface-variant">
                  {menuItems.length > 0
                    ? `${formatPkr(minPrice)} to ${formatPkr(maxPrice)}`
                    : "No active price range"}
                </p>
              </div>

              {filteredItems.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredItems.map((dish) => (
                    <article
                      key={dish.id}
                      className="group overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface-container-lowest"
                    >
                      <div className="relative h-44 overflow-hidden">
                        <img
                          src={dish.image}
                          alt={dish.alt}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <span className="absolute left-3 top-3 rounded-full bg-[#1A120E]/85 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-amber-100">
                          {dish.category}
                        </span>
                      </div>

                      <div className="p-5">
                        <div className="mb-2 flex items-start justify-between gap-3">
                          <h3 className="text-xl font-black leading-tight">{dish.name}</h3>
                          <span className="rounded-md bg-primary-fixed px-2 py-1 text-sm font-bold text-[#410001]">
                            {formatPkr(dish.pricePkr)}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed text-on-surface-variant">
                          {dish.description}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-10 text-center">
                  <h3 className="mb-2 text-2xl font-black">No Items Found</h3>
                  <p className="text-on-surface-variant">
                    Try widening the price range or changing your search keywords.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-7xl px-6 pb-6">
          <div className="rounded-xl bg-surface-container-low p-8 text-center md:p-12">
            <h3 className="mb-3 text-3xl font-black">Ready to Reserve?</h3>
            <p className="mb-6 text-on-surface-variant">
              Book your table now and experience the full Desi Vesi tasting journey.
            </p>
            <Link
              href="/#reservation"
              className="bg-flame-gradient inline-flex items-center rounded-lg px-8 py-3 text-lg font-black text-on-primary transition-transform hover:scale-95"
            >
              Reserve Your Table
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
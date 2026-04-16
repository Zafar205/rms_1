"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MenuCategory } from "@/lib/menu-categories";
import type { MenuItem } from "@/lib/menu-data";
import { MdAdd, MdDelete, MdRemove, MdShoppingCartCheckout } from "react-icons/md";

type CreateOrderAction = (formData: FormData) => Promise<{ orderId: string }>;

type PosTerminalProps = {
  menuItems: MenuItem[];
  menuCategories: MenuCategory[];
  createOrderAction: CreateOrderAction;
};

type CartItem = {
  id: string;
  menuItemId: string;
  name: string;
  category: string;
  pricePkr: number;
  quantity: number;
};

const ALL_CATEGORY_VALUE = "ALL";
const TAX_PERCENT = 10;

const normalizeCategory = (value: string) => value.trim().toUpperCase();

const formatPkr = (amount: number) => `PKR ${new Intl.NumberFormat("en-PK").format(amount)}`;

export default function PosTerminal({ menuItems, menuCategories, createOrderAction }: PosTerminalProps) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORY_VALUE);
  const [searchQuery, setSearchQuery] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const categoryOptions = useMemo(() => {
    const options = new Set<string>();

    for (const category of menuCategories) {
      const normalized = normalizeCategory(category.name);

      if (normalized) {
        options.add(normalized);
      }
    }

    for (const item of menuItems) {
      const normalized = normalizeCategory(item.category);

      if (normalized) {
        options.add(normalized);
      }
    }

    return [ALL_CATEGORY_VALUE, ...[...options].sort((left, right) => left.localeCompare(right))];
  }, [menuCategories, menuItems]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return menuItems.filter((item) => {
      const normalizedCategory = normalizeCategory(item.category);
      const matchesCategory =
        selectedCategory === ALL_CATEGORY_VALUE || normalizedCategory === selectedCategory;
      const matchesSearch =
        normalizedQuery.length === 0 ||
        `${item.name} ${item.description} ${item.category}`.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesSearch;
    });
  }, [menuItems, searchQuery, selectedCategory]);

  const subtotalPkr = useMemo(
    () => cartItems.reduce((total, item) => total + item.pricePkr * item.quantity, 0),
    [cartItems]
  );
  const taxPkr = useMemo(() => Math.round((subtotalPkr * TAX_PERCENT) / 100), [subtotalPkr]);
  const totalPkr = subtotalPkr + taxPkr;

  const incrementItem = (item: MenuItem) => {
    setCartItems((currentItems) => {
      const existingItem = currentItems.find((cartItem) => cartItem.id === item.id);

      if (existingItem) {
        return currentItems.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
        );
      }

      return [
        ...currentItems,
        {
          id: item.id,
          menuItemId: item.id,
          name: item.name,
          category: normalizeCategory(item.category),
          pricePkr: item.pricePkr,
          quantity: 1,
        },
      ];
    });
  };

  const decrementItem = (itemId: string) => {
    setCartItems((currentItems) =>
      currentItems
        .map((item) => (item.id === itemId ? { ...item, quantity: item.quantity - 1 } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const removeCartItem = (itemId: string) => {
    setCartItems((currentItems) => currentItems.filter((item) => item.id !== itemId));
  };

  const submitOrder = () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (cartItems.length === 0) {
      setErrorMessage("Add at least one item before creating an order.");
      return;
    }

    const payload = {
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      items: cartItems.map((item) => ({
        menuItemId: item.menuItemId,
        name: item.name,
        pricePkr: item.pricePkr,
        quantity: item.quantity,
      })),
    };

    const formData = new FormData();
    formData.set("orderPayload", JSON.stringify(payload));

    startTransition(async () => {
      try {
        const createdOrder = await createOrderAction(formData);

        setCartItems([]);
        setCustomerName("");
        setCustomerPhone("");
        setSuccessMessage(`Order #${createdOrder.orderId.slice(0, 8).toUpperCase()} created successfully.`);
        router.refresh();
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Failed to create order.");
      }
    });
  };

  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-white/10 bg-[#211715] p-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">Point of Sale</p>
        <h1 className="mt-2 text-3xl font-black text-amber-100 md:text-4xl">Create New Order</h1>
        <p className="mt-2 max-w-3xl text-stone-300">
          Select menu items, manage quantities, and submit orders directly to the Orders tab.
        </p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4 rounded-2xl border border-white/10 bg-[#211715] p-5 md:p-6">
          <div className="grid gap-3 md:grid-cols-[minmax(0,220px)_1fr]">
            <label className="space-y-1.5 text-sm text-stone-200">
              <span className="text-xs font-bold uppercase tracking-wide text-stone-300">Category</span>
              <select
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
                className="w-full rounded-lg border border-white/20 bg-[#120d0c] px-3 py-2.5 text-sm text-stone-100 outline-none ring-primary/40 focus:ring-2"
              >
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category === ALL_CATEGORY_VALUE ? "All" : category}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1.5 text-sm text-stone-200">
              <span className="text-xs font-bold uppercase tracking-wide text-stone-300">Search</span>
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search menu items"
                className="w-full rounded-lg border border-white/20 bg-[#120d0c] px-3 py-2.5 text-sm text-stone-100 outline-none ring-primary/40 placeholder:text-stone-500 focus:ring-2"
              />
            </label>
          </div>

          {filteredItems.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/20 bg-[#120d0c] p-8 text-center text-sm text-stone-300">
              No menu items match the selected filters.
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {filteredItems.map((item) => (
                <article key={item.id} className="rounded-xl border border-white/10 bg-[#120d0c] p-4">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-black text-amber-100">{item.name}</h2>
                      <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
                        {normalizeCategory(item.category)}
                      </p>
                    </div>
                    <p className="text-base font-black text-primary">{formatPkr(item.pricePkr)}</p>
                  </div>

                  <p className="mb-4 line-clamp-2 text-sm text-stone-300">{item.description}</p>

                  <button
                    type="button"
                    onClick={() => incrementItem(item)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-bold text-on-primary transition-transform hover:scale-[0.99]"
                  >
                    <MdAdd className="text-base" />
                    Add to cart
                  </button>
                </article>
              ))}
            </div>
          )}
        </div>

        <aside className="h-fit space-y-4 rounded-2xl border border-white/10 bg-[#211715] p-5 md:sticky md:top-6 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-black text-amber-100">Cart</h2>
            <p className="text-xs font-bold uppercase tracking-wide text-stone-300">
              {cartItems.reduce((count, item) => count + item.quantity, 0)} items
            </p>
          </div>

          <div className="grid gap-3">
            <label className="space-y-1.5 text-sm text-stone-200">
              <span className="text-xs font-bold uppercase tracking-wide text-stone-300">Customer Name</span>
              <input
                type="text"
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                placeholder="Walk-in customer"
                className="w-full rounded-lg border border-white/20 bg-[#120d0c] px-3 py-2.5 text-sm text-stone-100 outline-none ring-primary/40 placeholder:text-stone-500 focus:ring-2"
              />
            </label>

            <label className="space-y-1.5 text-sm text-stone-200">
              <span className="text-xs font-bold uppercase tracking-wide text-stone-300">Phone Number</span>
              <input
                type="tel"
                value={customerPhone}
                onChange={(event) => setCustomerPhone(event.target.value)}
                placeholder="Optional"
                className="w-full rounded-lg border border-white/20 bg-[#120d0c] px-3 py-2.5 text-sm text-stone-100 outline-none ring-primary/40 placeholder:text-stone-500 focus:ring-2"
              />
            </label>
          </div>

          <div className="max-h-80 space-y-2 overflow-auto pr-1">
            {cartItems.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/20 bg-[#120d0c] p-6 text-center text-sm text-stone-400">
                Cart is empty.
              </div>
            ) : (
              cartItems.map((item) => (
                <article key={item.id} className="rounded-lg border border-white/10 bg-[#120d0c] p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-stone-100">{item.name}</h3>
                      <p className="text-xs text-stone-400">{formatPkr(item.pricePkr)} each</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCartItem(item.id)}
                      className="rounded-md border border-red-300/40 bg-red-300/10 p-1.5 text-red-100 transition-colors hover:bg-red-300/20"
                      aria-label={`Remove ${item.name}`}
                    >
                      <MdDelete className="text-base" />
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="inline-flex items-center gap-1 rounded-md border border-white/20 bg-[#1b1311] p-1">
                      <button
                        type="button"
                        onClick={() => decrementItem(item.id)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-stone-100 transition-colors hover:bg-white/10"
                        aria-label={`Decrease ${item.name}`}
                      >
                        <MdRemove className="text-base" />
                      </button>
                      <span className="min-w-6 text-center text-sm font-bold text-stone-100">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setCartItems((currentItems) =>
                            currentItems.map((cartItem) =>
                              cartItem.id === item.id
                                ? { ...cartItem, quantity: cartItem.quantity + 1 }
                                : cartItem
                            )
                          )
                        }
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-stone-100 transition-colors hover:bg-white/10"
                        aria-label={`Increase ${item.name}`}
                      >
                        <MdAdd className="text-base" />
                      </button>
                    </div>

                    <p className="text-sm font-black text-amber-200">
                      {formatPkr(item.pricePkr * item.quantity)}
                    </p>
                  </div>
                </article>
              ))
            )}
          </div>

          <div className="space-y-1.5 rounded-lg border border-white/10 bg-[#120d0c] p-3 text-sm">
            <div className="flex items-center justify-between text-stone-300">
              <span>Subtotal</span>
              <span>{formatPkr(subtotalPkr)}</span>
            </div>
            <div className="flex items-center justify-between text-stone-300">
              <span>Tax ({TAX_PERCENT}%)</span>
              <span>{formatPkr(taxPkr)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-white/10 pt-1.5 text-base font-black text-amber-100">
              <span>Total</span>
              <span>{formatPkr(totalPkr)}</span>
            </div>
          </div>

          {errorMessage ? (
            <p className="rounded-lg border border-red-300/40 bg-red-300/10 px-3 py-2 text-sm text-red-100">
              {errorMessage}
            </p>
          ) : null}

          {successMessage ? (
            <p className="rounded-lg border border-emerald-300/40 bg-emerald-300/10 px-3 py-2 text-sm text-emerald-100">
              {successMessage}
            </p>
          ) : null}

          <button
            type="button"
            onClick={submitOrder}
            disabled={isPending || cartItems.length === 0}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-on-primary transition-transform hover:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <MdShoppingCartCheckout className="text-lg" />
            {isPending ? "Creating order..." : "Create order"}
          </button>

          <Link
            href="/dashboard/orders"
            className="inline-flex w-full items-center justify-center rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-semibold text-stone-100 transition-colors hover:bg-white/10"
          >
            View all orders
          </Link>
        </aside>
      </div>
    </section>
  );
}

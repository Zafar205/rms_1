"use server";

import { revalidatePath } from "next/cache";
import { requireAuthenticatedUser } from "@/lib/auth/server";
import { createSupabaseServerAuthClient } from "@/lib/supabase/auth";

type OrderItemPayload = {
  menuItemId: string | null;
  name: string;
  pricePkr: number;
  quantity: number;
};

type CreateOrderPayload = {
  customerName: string;
  customerPhone: string;
  items: OrderItemPayload[];
};

type MenuItemLookupRow = {
  id: string;
  name: string;
  price_pkr: number;
  is_available: boolean | null;
};

const ORDER_TAX_PERCENT = 10;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isUuidValue = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

const getTextValue = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const getPositiveInteger = (value: unknown) => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return null;
  }

  const rounded = Math.round(parsed);
  return rounded > 0 ? rounded : null;
};

const parseOrderPayload = (formData: FormData): CreateOrderPayload => {
  const rawPayload = formData.get("orderPayload");

  if (typeof rawPayload !== "string") {
    throw new Error("Order payload is missing.");
  }

  let parsedPayload: unknown;

  try {
    parsedPayload = JSON.parse(rawPayload);
  } catch {
    throw new Error("Invalid order payload.");
  }

  if (!isRecord(parsedPayload)) {
    throw new Error("Invalid order payload.");
  }

  const customerName = getTextValue(parsedPayload.customerName);
  const customerPhone = getTextValue(parsedPayload.customerPhone);
  const rawItems = parsedPayload.items;

  if (!Array.isArray(rawItems)) {
    throw new Error("Order must include at least one item.");
  }

  const items = rawItems.reduce<OrderItemPayload[]>((sanitizedItems, rawItem) => {
    if (!isRecord(rawItem)) {
      return sanitizedItems;
    }

    const menuItemId = getTextValue(rawItem.menuItemId);
    const name = getTextValue(rawItem.name);
    const quantity = getPositiveInteger(rawItem.quantity);
    const pricePkr = getPositiveInteger(rawItem.pricePkr);

    if (!name || quantity === null || pricePkr === null) {
      return sanitizedItems;
    }

    sanitizedItems.push({
      menuItemId: menuItemId || null,
      name,
      quantity,
      pricePkr,
    });

    return sanitizedItems;
  }, []);

  if (items.length === 0) {
    throw new Error("Order must include at least one valid item.");
  }

  return {
    customerName,
    customerPhone,
    items,
  };
};

export async function createOrderAction(formData: FormData) {
  const user = await requireAuthenticatedUser();
  const supabase = await createSupabaseServerAuthClient();

  if (!supabase) {
    throw new Error(
      "Supabase auth configuration missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY."
    );
  }

  const payload = parseOrderPayload(formData);
  const requestedMenuIds = payload.items
    .map((item) => item.menuItemId)
    .filter((menuItemId): menuItemId is string => Boolean(menuItemId && isUuidValue(menuItemId)));
  const uniqueMenuIds = [...new Set(requestedMenuIds)];

  const menuItemLookup = new Map<string, MenuItemLookupRow>();

  if (uniqueMenuIds.length > 0) {
    const { data: menuRows, error: menuError } = await supabase
      .from("menu_items")
      .select("id, name, price_pkr, is_available")
      .in("id", uniqueMenuIds);

    if (menuError) {
      throw new Error(`Unable to validate menu items: ${menuError.message}`);
    }

    for (const row of (menuRows ?? []) as MenuItemLookupRow[]) {
      menuItemLookup.set(row.id, row);
    }
  }

  const orderItems = payload.items.map((item) => {
    const hasMenuReference = Boolean(item.menuItemId && isUuidValue(item.menuItemId));

    if (hasMenuReference && item.menuItemId && !menuItemLookup.has(item.menuItemId)) {
      throw new Error("Some menu items are outdated. Refresh the POS page and try again.");
    }

    const resolvedMenuItem = item.menuItemId ? menuItemLookup.get(item.menuItemId) : undefined;

    if (resolvedMenuItem && resolvedMenuItem.is_available === false) {
      throw new Error(`${resolvedMenuItem.name} is currently unavailable.`);
    }

    const resolvedName = resolvedMenuItem?.name ?? item.name;
    const resolvedPrice = resolvedMenuItem ? Number(resolvedMenuItem.price_pkr) : item.pricePkr;
    const lineTotalPkr = resolvedPrice * item.quantity;

    return {
      menuItemId: resolvedMenuItem?.id ?? null,
      itemName: resolvedName,
      itemPricePkr: resolvedPrice,
      quantity: item.quantity,
      lineTotalPkr,
    };
  });

  const subtotalPkr = orderItems.reduce((total, item) => total + item.lineTotalPkr, 0);

  if (subtotalPkr <= 0) {
    throw new Error("Order total must be greater than zero.");
  }

  const taxPkr = Math.round((subtotalPkr * ORDER_TAX_PERCENT) / 100);
  const totalPkr = subtotalPkr + taxPkr;

  const { data: createdOrder, error: createOrderError } = await supabase
    .from("orders")
    .insert({
      customer_name: payload.customerName || "Walk-in Customer",
      customer_phone: payload.customerPhone || null,
      subtotal_pkr: subtotalPkr,
      tax_pkr: taxPkr,
      total_pkr: totalPkr,
      created_by: user.id,
    })
    .select("id")
    .single<{ id: string }>();

  if (createOrderError || !createdOrder?.id) {
    throw new Error(`Failed to create order: ${createOrderError?.message ?? "Unknown error"}`);
  }

  const { error: createOrderItemsError } = await supabase.from("order_items").insert(
    orderItems.map((item) => ({
      order_id: createdOrder.id,
      menu_item_id: item.menuItemId,
      item_name: item.itemName,
      item_price_pkr: item.itemPricePkr,
      quantity: item.quantity,
      line_total_pkr: item.lineTotalPkr,
    }))
  );

  if (createOrderItemsError) {
    await supabase.from("orders").delete().eq("id", createdOrder.id);
    throw new Error(`Failed to create order items: ${createOrderItemsError.message}`);
  }

  revalidatePath("/dashboard/pos");
  revalidatePath("/dashboard/orders");

  return {
    orderId: createdOrder.id,
  };
}

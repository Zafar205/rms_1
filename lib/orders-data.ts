import { createSupabaseServerAuthClient } from "@/lib/supabase/auth";

export type OrderItem = {
  id: string;
  orderId: string;
  menuItemId: string | null;
  itemName: string;
  itemPricePkr: number;
  quantity: number;
  lineTotalPkr: number;
};

export type OrderStatus = "pending" | "confirmed";

export type Order = {
  id: string;
  customerName: string;
  customerPhone: string;
  subtotalPkr: number;
  taxPkr: number;
  totalPkr: number;
  status: OrderStatus;
  createdAt: string;
  items: OrderItem[];
  itemCount: number;
};

type OrderItemRow = {
  id: string;
  order_id: string;
  menu_item_id: string | null;
  item_name: string;
  item_price_pkr: number;
  quantity: number;
  line_total_pkr: number;
};

type OrderRow = {
  id: string;
  customer_name: string | null;
  customer_phone: string | null;
  subtotal_pkr: number;
  tax_pkr: number;
  total_pkr: number;
  status: string | null;
  created_at: string;
  order_items: OrderItemRow[] | null;
};

type LegacyOrderRow = Omit<OrderRow, "status">;

const mapOrderItemRow = (row: OrderItemRow): OrderItem => ({
  id: row.id,
  orderId: row.order_id,
  menuItemId: row.menu_item_id,
  itemName: row.item_name,
  itemPricePkr: Number(row.item_price_pkr),
  quantity: Number(row.quantity),
  lineTotalPkr: Number(row.line_total_pkr),
});

const isOrderStatus = (value: string | null): value is OrderStatus =>
  value === "pending" || value === "confirmed";

const mapOrderRow = (row: OrderRow): Order => {
  const items = (row.order_items ?? []).map(mapOrderItemRow);
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  return {
    id: row.id,
    customerName: row.customer_name?.trim() || "Walk-in Customer",
    customerPhone: row.customer_phone?.trim() || "-",
    subtotalPkr: Number(row.subtotal_pkr),
    taxPkr: Number(row.tax_pkr),
    totalPkr: Number(row.total_pkr),
    status: isOrderStatus(row.status) ? row.status : "pending",
    createdAt: row.created_at,
    items,
    itemCount,
  };
};

const mapLegacyOrderRow = (row: LegacyOrderRow): Order =>
  mapOrderRow({
    ...row,
    status: "pending",
  });

const orderSelect =
  "id, customer_name, customer_phone, subtotal_pkr, tax_pkr, total_pkr, status, created_at, order_items(id, order_id, menu_item_id, item_name, item_price_pkr, quantity, line_total_pkr)";

const legacyOrderSelect =
  "id, customer_name, customer_phone, subtotal_pkr, tax_pkr, total_pkr, created_at, order_items(id, order_id, menu_item_id, item_name, item_price_pkr, quantity, line_total_pkr)";

export async function getOrders(): Promise<Order[]> {
  const supabase = await createSupabaseServerAuthClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase.from("orders").select(orderSelect).order("created_at", { ascending: false });

  if (!error) {
    return (data as OrderRow[] | null)?.map(mapOrderRow) ?? [];
  }

  if (!/status/i.test(error.message)) {
    return [];
  }

  const { data: legacyData, error: legacyError } = await supabase
    .from("orders")
    .select(legacyOrderSelect)
    .order("created_at", { ascending: false });

  if (legacyError) {
    return [];
  }

  return (legacyData as LegacyOrderRow[] | null)?.map(mapLegacyOrderRow) ?? [];
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const supabase = await createSupabaseServerAuthClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("orders")
    .select(orderSelect)
    .eq("id", orderId)
    .maybeSingle();

  if (!error) {
    return data ? mapOrderRow(data as OrderRow) : null;
  }

  if (!/status/i.test(error.message)) {
    return null;
  }

  const { data: legacyData, error: legacyError } = await supabase
    .from("orders")
    .select(legacyOrderSelect)
    .eq("id", orderId)
    .maybeSingle();

  if (legacyError || !legacyData) {
    return null;
  }

  return mapLegacyOrderRow(legacyData as LegacyOrderRow);
}

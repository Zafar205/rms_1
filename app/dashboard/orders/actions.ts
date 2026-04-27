"use server";

import { revalidatePath } from "next/cache";
import { requireAuthenticatedUser } from "@/lib/auth/server";
import { createSupabaseServerAuthClient } from "@/lib/supabase/auth";

const isUuidValue = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

const getTextValue = (value: FormDataEntryValue | null) =>
  typeof value === "string" ? value.trim() : "";

const ORDER_STATUS_VALUES = ["pending", "confirmed"] as const;

type OrderStatus = (typeof ORDER_STATUS_VALUES)[number];

export type OrderStatusActionState = {
  status?: OrderStatus;
  error?: string;
};

const isOrderStatusValue = (value: string): value is OrderStatus =>
  ORDER_STATUS_VALUES.includes(value as OrderStatus);

export async function deleteOrderAction(formData: FormData) {
  await requireAuthenticatedUser();

  const supabase = await createSupabaseServerAuthClient();

  if (!supabase) {
    throw new Error(
      "Supabase auth configuration missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY."
    );
  }

  const orderId = getTextValue(formData.get("id"));

  if (!orderId || !isUuidValue(orderId)) {
    throw new Error("A valid order id is required.");
  }

  const { error } = await supabase.from("orders").delete().eq("id", orderId);

  if (error) {
    throw new Error(`Failed to delete order: ${error.message}`);
  }

  revalidatePath("/dashboard/orders");
  revalidatePath("/dashboard/pos");
}

export async function updateOrderStatusAction(
  _previousState: OrderStatusActionState,
  formData: FormData
): Promise<OrderStatusActionState> {
  await requireAuthenticatedUser();

  const supabase = await createSupabaseServerAuthClient();

  if (!supabase) {
    throw new Error(
      "Supabase auth configuration missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY."
    );
  }

  const orderId = getTextValue(formData.get("id"));
  const orderStatus = getTextValue(formData.get("status")).toLowerCase();

  if (!orderId || !isUuidValue(orderId)) {
    return { error: "A valid order id is required." };
  }

  if (!isOrderStatusValue(orderStatus)) {
    return { error: "Order status must be pending or confirmed." };
  }

  const { error } = await supabase.from("orders").update({ status: orderStatus }).eq("id", orderId);

  if (error) {
    return { error: `Failed to update order status: ${error.message}` };
  }

  revalidatePath("/dashboard/orders");
  revalidatePath("/dashboard/pos");

  return { status: orderStatus };
}

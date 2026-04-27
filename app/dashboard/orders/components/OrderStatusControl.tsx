"use client";

import { useActionState, useEffect, useState } from "react";
import { updateOrderStatusAction, type OrderStatusActionState } from "../actions";
import type { OrderStatus } from "@/lib/orders-data";

type OrderStatusControlProps = {
  orderId: string;
  initialStatus: OrderStatus;
};

const initialState: OrderStatusActionState = {};

const ORDER_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
] as const;

export default function OrderStatusControl({ orderId, initialStatus }: OrderStatusControlProps) {
  const [state, formAction, isPending] = useActionState(updateOrderStatusAction, initialState);
  const [draftStatus, setDraftStatus] = useState<OrderStatus>(initialStatus);

  useEffect(() => {
    setDraftStatus(initialStatus);
  }, [initialStatus]);

  useEffect(() => {
    if (state.status) {
      setDraftStatus(state.status);
    }
  }, [state.status]);

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="id" value={orderId} />
      <select
        name="status"
        value={draftStatus}
        onChange={(event) => setDraftStatus(event.target.value as OrderStatus)}
        aria-label={`Update status for order ${orderId.slice(0, 8)}`}
        className="rounded-md border border-white/20 bg-[#1b1413] px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-stone-100 outline-none transition focus:border-amber-300/70"
      >
        {ORDER_STATUS_OPTIONS.map((status) => (
          <option key={status.value} value={status.value}>
            {status.label}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center rounded-md border border-white/20 bg-white/5 px-2.5 py-1.5 text-xs font-bold uppercase tracking-wide text-stone-100 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Saving..." : "Save"}
      </button>
    </form>
  );
}

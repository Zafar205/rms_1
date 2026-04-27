import Link from "next/link";
import { getOrders } from "@/lib/orders-data";
import { deleteOrderAction, updateOrderStatusAction } from "./actions";
import OrderStatusControl from "./components/OrderStatusControl";

export const dynamic = "force-dynamic";

const formatPkr = (amount: number) => `PKR ${new Intl.NumberFormat("en-PK").format(amount)}`;

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

export default async function OrdersPage() {
  const orders = await getOrders();

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-white/10 bg-[#211715] p-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">Orders</p>
          <h1 className="mt-2 text-3xl font-black text-amber-100 md:text-4xl">Order Management</h1>
          <p className="mt-2 max-w-3xl text-stone-300">
            Review all POS orders, track totals, and remove incorrect entries.
          </p>
        </div>

        <Link
          href="/dashboard/pos"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-on-primary transition-transform hover:scale-[0.99]"
        >
          Create Order
        </Link>
      </header>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/20 bg-[#211715] p-10 text-center">
          <h2 className="text-2xl font-black text-amber-100">No orders yet</h2>
          <p className="mt-2 text-sm text-stone-300">Create the first order from the POS tab.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#211715]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1020px] text-left text-sm">
              <thead className="bg-[#2a1b18] text-stone-200">
                <tr>
                  <th className="px-4 py-3 font-bold">Order ID</th>
                  <th className="px-4 py-3 font-bold">Customer</th>
                  <th className="px-4 py-3 font-bold">Date & Time</th>
                  <th className="px-4 py-3 font-bold">Items</th>
                  <th className="px-4 py-3 font-bold">Total</th>
                  <th className="px-4 py-3 font-bold">Status</th>
                  <th className="px-4 py-3 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-t border-white/10 text-stone-300">
                    <td className="px-4 py-3 font-semibold text-stone-100">#{order.id.slice(0, 8)}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-stone-100">{order.customerName}</p>
                      <p className="text-xs text-stone-400">{order.customerPhone}</p>
                    </td>
                    <td className="px-4 py-3">{formatDateTime(order.createdAt)}</td>
                    <td className="px-4 py-3">
                      <p>{order.itemCount} items</p>
                      <p className="line-clamp-1 text-xs text-stone-400">
                        {order.items.map((item) => item.itemName).join(", ")}
                      </p>
                    </td>
                    <td className="px-4 py-3 font-black text-amber-200">{formatPkr(order.totalPkr)}</td>
                    <td className="px-4 py-3">
                      <OrderStatusControl orderId={order.id} initialStatus={order.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                        {order.status === "confirmed" ? (
                          <Link
                            href={`/dashboard/orders/${order.id}/invoice`}
                            className="inline-flex shrink-0 items-center rounded-md border border-amber-300/30 bg-amber-300/15 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-amber-100 shadow-sm shadow-black/10 transition-colors hover:bg-amber-300/25"
                          >
                            Invoice PDF
                          </Link>
                        ) : (
                          <button
                            type="button"
                            disabled
                            title="Confirm the order before generating the invoice."
                            className="inline-flex shrink-0 cursor-not-allowed items-center rounded-md border border-amber-300/20 bg-amber-300/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-amber-100/50 opacity-60"
                          >
                            Invoice PDF
                          </button>
                        )}
                        <form action={deleteOrderAction}>
                          <input type="hidden" name="id" value={order.id} />
                          <button
                            type="submit"
                            className="inline-flex shrink-0 items-center rounded-md border border-red-300/40 bg-red-300/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-red-100 transition-colors hover:bg-red-300/20"
                          >
                            Delete
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
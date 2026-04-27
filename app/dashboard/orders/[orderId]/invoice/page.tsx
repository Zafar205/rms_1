import Link from "next/link";
import { notFound } from "next/navigation";
import PrintInvoiceButton from "./PrintInvoiceButton";
import { getOrderById } from "@/lib/orders-data";

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

type InvoicePageProps = {
  params: Promise<{ orderId: string }>;
};

export default async function InvoicePage({ params }: InvoicePageProps) {
  const { orderId } = await params;
  const order = await getOrderById(orderId);

  if (!order) {
    notFound();
  }

  return (
    <section className="mx-auto max-w-4xl space-y-6 rounded-3xl border border-white/10 bg-[#211715] p-6 text-stone-100 shadow-2xl shadow-black/20 print:mx-0 print:max-w-none print:rounded-none print:border-0 print:bg-white print:p-0 print:text-black print:shadow-none print:space-y-4">
      <style>{`@media print { body { background: white !important; margin: 0 !important; } @page { margin: 12mm; } nav, header, footer { display: none !important; } }`}</style>
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-6 print:border-black/10">
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300 print:text-black/60">Digital Bill</p>
          <h1 className="text-3xl font-black text-amber-100 print:text-black">Desi Vesi RMS</h1>
          <p className="text-sm text-stone-300 print:text-black/70">Order invoice for a served customer order.</p>
        </div>

        <div className="space-y-3 text-right">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 print:border-black/10 print:bg-transparent">
            <p className="text-xs font-bold uppercase tracking-wide text-stone-400 print:text-black/60">Invoice No.</p>
            <p className="mt-1 text-sm font-bold text-stone-100 print:text-black">#{order.id.slice(0, 8).toUpperCase()}</p>
          </div>
          <div className="flex justify-end gap-3 print:hidden">
            <Link
              href="/dashboard/orders"
              className="inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-bold text-stone-100 transition-colors hover:bg-white/10"
            >
              Back to Orders
            </Link>
            <PrintInvoiceButton />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 print:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 print:border-black/10 print:bg-transparent">
          <p className="text-xs font-bold uppercase tracking-wide text-stone-400 print:text-black/60">Customer</p>
          <p className="mt-2 text-lg font-black text-amber-100 print:text-black">{order.customerName}</p>
          <p className="text-sm text-stone-300 print:text-black/70">{order.customerPhone}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 print:border-black/10 print:bg-transparent">
          <p className="text-xs font-bold uppercase tracking-wide text-stone-400 print:text-black/60">Status</p>
          <p className="mt-2 text-lg font-black text-amber-100 capitalize print:text-black">{order.status}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 print:border-black/10 print:bg-transparent">
          <p className="text-xs font-bold uppercase tracking-wide text-stone-400 print:text-black/60">Date & Time</p>
          <p className="mt-2 text-lg font-black text-amber-100 print:text-black">{formatDateTime(order.createdAt)}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 print:border-black/10">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-[#2a1b18] text-stone-200 print:bg-black/5 print:text-black">
            <tr>
              <th className="px-4 py-3 font-bold">Item</th>
              <th className="px-4 py-3 font-bold">Qty</th>
              <th className="px-4 py-3 font-bold">Rate</th>
              <th className="px-4 py-3 font-bold text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="bg-[#1b1311] text-stone-100 print:bg-transparent print:text-black">
            {order.items.map((item) => (
              <tr key={item.id} className="border-t border-white/10 print:border-black/10">
                <td className="px-4 py-3 font-semibold">{item.itemName}</td>
                <td className="px-4 py-3">{item.quantity}</td>
                <td className="px-4 py-3">{formatPkr(item.itemPricePkr)}</td>
                <td className="px-4 py-3 text-right font-semibold">{formatPkr(item.lineTotalPkr)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="ml-auto w-full max-w-sm space-y-3 rounded-2xl border border-white/10 bg-white/5 p-5 print:border-black/10 print:bg-transparent">
        <div className="flex items-center justify-between gap-3 text-sm text-stone-300 print:text-black/70">
          <span>Subtotal</span>
          <span>{formatPkr(order.subtotalPkr)}</span>
        </div>
        <div className="flex items-center justify-between gap-3 text-sm text-stone-300 print:text-black/70">
          <span>Tax</span>
          <span>{formatPkr(order.taxPkr)}</span>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-3 text-lg font-black text-amber-100 print:border-black/10 print:text-black">
          <span>Total</span>
          <span>{formatPkr(order.totalPkr)}</span>
        </div>
      </div>
    </section>
  );
}

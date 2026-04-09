export default function OrdersPage() {
  return (
    <section className="space-y-4 rounded-2xl border border-white/10 bg-[#211715] p-6">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">Orders</p>
      <h1 className="text-3xl font-black text-amber-100 md:text-4xl">Orders Tab</h1>
      <p className="max-w-3xl text-stone-300">
        Use this tab for online/in-store order management. You can connect it to Supabase tables
        like orders and order_items.
      </p>
    </section>
  );
}
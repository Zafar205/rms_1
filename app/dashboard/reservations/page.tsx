const reservationRows = [
  {
    id: "RSV-1021",
    guestName: "Ayesha Khan",
    guests: 4,
    datetime: "Fri, 8:30 PM",
    status: "Confirmed",
  },
  {
    id: "RSV-1022",
    guestName: "Hamza Ali",
    guests: 2,
    datetime: "Sat, 7:00 PM",
    status: "Pending",
  },
  {
    id: "RSV-1023",
    guestName: "Sara Ahmed",
    guests: 6,
    datetime: "Sat, 9:15 PM",
    status: "Confirmed",
  },
];

export default function ReservationsPage() {
  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-white/10 bg-[#211715] p-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">
          Reservations
        </p>
        <h1 className="mt-2 text-3xl font-black text-amber-100 md:text-4xl">Reservations Tab</h1>
        <p className="mt-2 text-stone-300">
          This section is ready for your reservation workflow and Supabase integration.
        </p>
      </header>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#211715]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#2a1b18] text-stone-200">
            <tr>
              <th className="px-4 py-3 font-bold">Reservation ID</th>
              <th className="px-4 py-3 font-bold">Guest</th>
              <th className="px-4 py-3 font-bold">Guests</th>
              <th className="px-4 py-3 font-bold">Date & Time</th>
              <th className="px-4 py-3 font-bold">Status</th>
            </tr>
          </thead>
          <tbody>
            {reservationRows.map((row) => (
              <tr key={row.id} className="border-t border-white/10 text-stone-300">
                <td className="px-4 py-3 font-semibold text-stone-100">{row.id}</td>
                <td className="px-4 py-3">{row.guestName}</td>
                <td className="px-4 py-3">{row.guests}</td>
                <td className="px-4 py-3">{row.datetime}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-amber-400/15 px-2.5 py-1 text-xs font-bold text-amber-100">
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
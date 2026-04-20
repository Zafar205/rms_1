import { updateReservationStatusAction } from "@/app/reservations/actions";
import { getReservations, type ReservationStatus } from "@/lib/reservations-data";

export const dynamic = "force-dynamic";

const statusBadgeClassName: Record<ReservationStatus, string> = {
  pending: "bg-amber-400/20 text-amber-100",
  confirmed: "bg-emerald-400/20 text-emerald-100",
  rejected: "bg-red-400/20 text-red-100",
};

const formatReservationCode = (value: string) => `RSV-${value.slice(0, 8).toUpperCase()}`;

const formatReservationDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));

const formatReservationTime = (value: string) => {
  const normalizedTime = value.length === 5 ? `${value}:00` : value;
  const parsed = new Date(`1970-01-01T${normalizedTime}`);

  if (Number.isNaN(parsed.valueOf())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(parsed);
};

const formatReviewedAt = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

export default async function ReservationsPage() {
  const reservations = await getReservations();

  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-white/10 bg-[#211715] p-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">
          Reservations
        </p>
        <h1 className="mt-2 text-3xl font-black text-amber-100 md:text-4xl">Reservation Requests</h1>
        <p className="mt-2 text-stone-300">
          New reservations arrive as pending. Confirm or reject requests to trigger guest email updates.
        </p>
      </header>

      {reservations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/20 bg-[#211715] p-10 text-center">
          <h2 className="text-2xl font-black text-amber-100">No reservation requests yet</h2>
          <p className="mt-2 text-sm text-stone-300">Public reservation submissions will show up here.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#211715]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-[#2a1b18] text-stone-200">
                <tr>
                  <th className="px-4 py-3 font-bold">Reservation ID</th>
                  <th className="px-4 py-3 font-bold">Guest</th>
                  <th className="px-4 py-3 font-bold">Guests</th>
                  <th className="px-4 py-3 font-bold">Date & Time</th>
                  <th className="px-4 py-3 font-bold">Status</th>
                  <th className="px-4 py-3 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((reservation) => (
                  <tr key={reservation.id} className="border-t border-white/10 text-stone-300">
                    <td className="px-4 py-3 font-semibold text-stone-100">
                      {formatReservationCode(reservation.id)}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-stone-100">{reservation.fullName}</p>
                      <p className="text-xs text-stone-400">{reservation.email}</p>
                    </td>
                    <td className="px-4 py-3">{reservation.guestCount}</td>
                    <td className="px-4 py-3">
                      <p>{formatReservationDate(reservation.reservationDate)}</p>
                      <p className="text-xs text-stone-400">{formatReservationTime(reservation.reservationTime)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${
                          statusBadgeClassName[reservation.status]
                        }`}
                      >
                        {reservation.status}
                      </span>
                      {reservation.statusNote ? (
                        <p className="mt-1 text-xs text-stone-400">{reservation.statusNote}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      {reservation.status === "pending" ? (
                        <div className="flex flex-wrap gap-2">
                          <form action={updateReservationStatusAction}>
                            <input type="hidden" name="id" value={reservation.id} />
                            <input type="hidden" name="status" value="confirmed" />
                            <input
                              type="hidden"
                              name="statusNote"
                              value="Your table is reserved. Please arrive 10 minutes early."
                            />
                            <button
                              type="submit"
                              className="inline-flex items-center rounded-md border border-emerald-300/40 bg-emerald-300/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-emerald-100 transition-colors hover:bg-emerald-300/20"
                            >
                              Confirm
                            </button>
                          </form>

                          <form action={updateReservationStatusAction}>
                            <input type="hidden" name="id" value={reservation.id} />
                            <input type="hidden" name="status" value="rejected" />
                            <input
                              type="hidden"
                              name="statusNote"
                              value="This slot is unavailable. Please submit another request for a different time."
                            />
                            <button
                              type="submit"
                              className="inline-flex items-center rounded-md border border-red-300/40 bg-red-300/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-red-100 transition-colors hover:bg-red-300/20"
                            >
                              Reject
                            </button>
                          </form>
                        </div>
                      ) : (
                        <p className="text-xs text-stone-400">
                          Reviewed
                          {reservation.reviewedAt ? ` on ${formatReviewedAt(reservation.reviewedAt)}` : ""}
                        </p>
                      )}
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
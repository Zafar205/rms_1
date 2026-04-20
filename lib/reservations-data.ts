import { createSupabaseServerAuthClient } from "@/lib/supabase/auth";

export type ReservationStatus = "pending" | "confirmed" | "rejected";

export type Reservation = {
  id: string;
  fullName: string;
  email: string;
  reservationDate: string;
  reservationTime: string;
  guestCount: number;
  status: ReservationStatus;
  statusNote: string;
  reviewedAt: string | null;
  createdAt: string;
};

type ReservationRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  reservation_date: string;
  reservation_time: string;
  guest_count: number;
  status: string;
  status_note: string | null;
  reviewed_at: string | null;
  created_at: string;
};

const parseReservationStatus = (value: string): ReservationStatus => {
  if (value === "confirmed" || value === "rejected") {
    return value;
  }

  return "pending";
};

const mapReservationRow = (row: ReservationRow): Reservation => ({
  id: row.id,
  fullName: row.full_name?.trim() || "Guest",
  email: row.email?.trim() || "",
  reservationDate: row.reservation_date,
  reservationTime: row.reservation_time,
  guestCount: Number(row.guest_count),
  status: parseReservationStatus(row.status),
  statusNote: row.status_note?.trim() || "",
  reviewedAt: row.reviewed_at,
  createdAt: row.created_at,
});

export async function getReservations(): Promise<Reservation[]> {
  const supabase = await createSupabaseServerAuthClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("reservations")
    .select(
      "id, full_name, email, reservation_date, reservation_time, guest_count, status, status_note, reviewed_at, created_at"
    )
    .order("created_at", { ascending: false });

  if (error) {
    return [];
  }

  return (data as ReservationRow[] | null)?.map(mapReservationRow) ?? [];
}

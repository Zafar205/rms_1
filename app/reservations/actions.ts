"use server";

import { revalidatePath } from "next/cache";
import { requireAuthenticatedUser } from "@/lib/auth/server";
import { sendReservationStatusEmail } from "@/lib/reservations-email";
import { createSupabaseServerAuthClient } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ReservationActionState = {
  error?: string;
  success?: string;
};

type ReservationDecisionStatus = "confirmed" | "rejected";

type ReservationEmailRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  reservation_date: string;
  reservation_time: string;
  guest_count: number;
  status: string;
};

const getTextValue = (value: FormDataEntryValue | null) =>
  typeof value === "string" ? value.trim() : "";

const isUuidValue = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const getGuestCount = (value: FormDataEntryValue | null) => {
  const parsed = Number(getTextValue(value));

  if (!Number.isFinite(parsed)) {
    return null;
  }

  const rounded = Math.round(parsed);
  return rounded > 0 && rounded <= 20 ? rounded : null;
};

const getNormalizedTimeValue = (value: FormDataEntryValue | null) => {
  const raw = getTextValue(value);
  const matched = raw.match(/^(\d{2}):(\d{2})(?::\d{2})?$/);

  if (!matched) {
    return null;
  }

  const hour = Number(matched[1]);
  const minute = Number(matched[2]);

  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return null;
  }

  return `${matched[1]}:${matched[2]}`;
};

const isFutureReservation = (date: string, time: string) => {
  const reservationDateTime = new Date(`${date}T${time}:00`);

  if (Number.isNaN(reservationDateTime.valueOf())) {
    return false;
  }

  return reservationDateTime.getTime() >= Date.now();
};

const getDecisionStatus = (value: FormDataEntryValue | null): ReservationDecisionStatus | null => {
  const normalized = getTextValue(value).toLowerCase();

  if (normalized === "confirmed" || normalized === "rejected") {
    return normalized;
  }

  return null;
};

export async function submitReservationAction(
  _previousState: ReservationActionState,
  formData: FormData
): Promise<ReservationActionState> {
  const fullName = getTextValue(formData.get("fullName"));
  const email = getTextValue(formData.get("email")).toLowerCase();
  const reservationDate = getTextValue(formData.get("date"));
  const reservationTime = getNormalizedTimeValue(formData.get("time"));
  const guestCount = getGuestCount(formData.get("guests"));

  if (!fullName || fullName.length < 2) {
    return {
      error: "Enter your full name.",
    };
  }

  if (!email || !isValidEmail(email)) {
    return {
      error: "Enter a valid email address.",
    };
  }

  if (!reservationDate || !/^\d{4}-\d{2}-\d{2}$/.test(reservationDate)) {
    return {
      error: "Select a valid reservation date.",
    };
  }

  if (!reservationTime) {
    return {
      error: "Select a valid reservation time.",
    };
  }

  if (!isFutureReservation(reservationDate, reservationTime)) {
    return {
      error: "Reservation date and time must be in the future.",
    };
  }

  if (guestCount === null) {
    return {
      error: "Select a valid guest count.",
    };
  }

  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return {
      error:
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY.",
    };
  }

  const { error } = await supabase.from("reservations").insert({
    full_name: fullName,
    email,
    reservation_date: reservationDate,
    reservation_time: reservationTime,
    guest_count: guestCount,
    status: "pending",
  });

  if (error) {
    return {
      error: `Unable to submit reservation: ${error.message}`,
    };
  }

  revalidatePath("/dashboard/reservations");

  return {
    success: "Reservation request submitted. We will email you after review.",
  };
}

export async function updateReservationStatusAction(formData: FormData) {
  const user = await requireAuthenticatedUser();
  const supabase = await createSupabaseServerAuthClient();

  if (!supabase) {
    throw new Error(
      "Supabase auth configuration missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY."
    );
  }

  const reservationId = getTextValue(formData.get("id"));
  const nextStatus = getDecisionStatus(formData.get("status"));
  const statusNote = getTextValue(formData.get("statusNote"));

  if (!reservationId || !isUuidValue(reservationId)) {
    throw new Error("A valid reservation id is required.");
  }

  if (!nextStatus) {
    throw new Error("Reservation status must be confirmed or rejected.");
  }

  const { data: reservation, error: reservationError } = await supabase
    .from("reservations")
    .select("id, full_name, email, reservation_date, reservation_time, guest_count, status")
    .eq("id", reservationId)
    .maybeSingle<ReservationEmailRow>();

  if (reservationError) {
    throw new Error(`Unable to load reservation: ${reservationError.message}`);
  }

  if (!reservation) {
    throw new Error("Reservation not found.");
  }

  const { error: updateError } = await supabase
    .from("reservations")
    .update({
      status: nextStatus,
      status_note: statusNote || null,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", reservationId);

  if (updateError) {
    throw new Error(`Failed to update reservation: ${updateError.message}`);
  }

  if (reservation.email && (nextStatus === "confirmed" || nextStatus === "rejected")) {
    try {
      await sendReservationStatusEmail({
        toEmail: reservation.email,
        guestName: reservation.full_name?.trim() || "Guest",
        reservationDate: reservation.reservation_date,
        reservationTime: reservation.reservation_time,
        guestCount: Number(reservation.guest_count),
        status: nextStatus,
        note: statusNote || undefined,
      });
    } catch (error) {
      console.error("Failed to send reservation status email", {
        reservationId,
        email: reservation.email,
        error,
      });
    }
  }

  revalidatePath("/dashboard/reservations");
}

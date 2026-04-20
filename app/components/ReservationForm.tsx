"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { submitReservationAction, type ReservationActionState } from "@/app/reservations/actions";

const initialState: ReservationActionState = {};

const timeOptions = [
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
  "21:00",
  "21:30",
];

const guestOptions = [1, 2, 3, 4, 5, 6, 8, 10];

const getTodayLocalDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export default function ReservationForm() {
  const [state, formAction, isPending] = useActionState(submitReservationAction, initialState);
  const [isFeedbackVisible, setIsFeedbackVisible] = useState(false);
  const minimumDate = useMemo(() => getTodayLocalDate(), []);

  useEffect(() => {
    if (!state.error && !state.success) {
      return;
    }

    setIsFeedbackVisible(true);

    const timeoutId = window.setTimeout(() => {
      setIsFeedbackVisible(false);
    }, 5000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [state]);

  return (
    <form action={formAction} className="space-y-8">
      {state.error && isFeedbackVisible ? (
        <p className="rounded-lg border border-red-300/40 bg-red-300/10 px-3 py-2 text-sm font-medium text-black">
          {state.error}
        </p>
      ) : null}

      {state.success && isFeedbackVisible ? (
        <p className="rounded-lg border border-emerald-300/40 bg-emerald-300/10 px-3 py-2 text-sm font-medium text-black">
          {state.success}
        </p>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="block px-1 text-sm font-bold uppercase tracking-tight text-on-surface-variant">
            Full Name
          </label>
          <input
            name="fullName"
            type="text"
            required
            maxLength={120}
            placeholder="Enter your name"
            className="w-full rounded-lg border-none bg-surface-container-low px-4 py-4 outline-none transition-all focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <div className="space-y-2">
          <label className="block px-1 text-sm font-bold uppercase tracking-tight text-on-surface-variant">
            Email Address
          </label>
          <input
            name="email"
            type="email"
            required
            maxLength={160}
            placeholder="name@example.com"
            className="w-full rounded-lg border-none bg-surface-container-low px-4 py-4 outline-none transition-all focus:ring-2 focus:ring-primary/40"
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-2">
          <label className="block px-1 text-sm font-bold uppercase tracking-tight text-on-surface-variant">
            Date
          </label>
          <input
            name="date"
            type="date"
            required
            min={minimumDate}
            className="w-full appearance-none rounded-lg border-none bg-surface-container-low px-4 py-4 outline-none transition-all focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <div className="space-y-2">
          <label className="block px-1 text-sm font-bold uppercase tracking-tight text-on-surface-variant">
            Time
          </label>
          <select
            name="time"
            required
            defaultValue={timeOptions[0]}
            className="w-full rounded-lg border-none bg-surface-container-low px-4 py-4 outline-none transition-all focus:ring-2 focus:ring-primary/40"
          >
            {timeOptions.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block px-1 text-sm font-bold uppercase tracking-tight text-on-surface-variant">
            Guests
          </label>
          <select
            name="guests"
            required
            defaultValue="2"
            className="w-full rounded-lg border-none bg-surface-container-low px-4 py-4 outline-none transition-all focus:ring-2 focus:ring-primary/40"
          >
            {guestOptions.map((value) => (
              <option key={value} value={value}>
                {value} {value === 1 ? "Person" : "Persons"}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="bg-flame-gradient w-full rounded-lg py-5 text-xl font-black text-on-primary shadow-xl transition-all hover:shadow-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Submitting..." : "Confirm Reservation"}
      </button>
    </form>
  );
}

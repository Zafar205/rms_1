import "server-only";

import { Resend } from "resend";

export type ReservationEmailStatus = "confirmed" | "rejected";

type SendReservationStatusEmailInput = {
  toEmail: string;
  guestName: string;
  reservationDate: string;
  reservationTime: string;
  guestCount: number;
  status: ReservationEmailStatus;
  note?: string | null;
};

let resendClient: Resend | null = null;

const getFromEmail = () => {
  const fromEmail = process.env.RESEND_FROM_EMAIL?.trim();

  if (!fromEmail) {
    throw new Error("RESEND_FROM_EMAIL is missing. Set a verified sender email for Resend.");
  }

  return fromEmail;
};

const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is missing.");
  }

  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }

  return resendClient;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

const formatReservationDate = (value: string) => {
  const parsedDate = new Date(`${value}T00:00:00`);

  if (Number.isNaN(parsedDate.valueOf())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsedDate);
};

const formatReservationTime = (value: string) => {
  const normalized = value.length === 5 ? `${value}:00` : value;
  const parsedTime = new Date(`1970-01-01T${normalized}`);

  if (Number.isNaN(parsedTime.valueOf())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(parsedTime);
};

export async function sendReservationStatusEmail(input: SendReservationStatusEmailInput) {
  const resend = getResendClient();
  const from = getFromEmail();
  const replyTo = process.env.RESEND_REPLY_TO?.trim();
  const statusText = input.status === "confirmed" ? "confirmed" : "rejected";
  const statusTitle = input.status === "confirmed" ? "Reservation Confirmed" : "Reservation Update";
  const introLine =
    input.status === "confirmed"
      ? "Great news, your reservation request has been confirmed."
      : "We are sorry, we are unable to accommodate your reservation at the selected time.";
  const dateLabel = formatReservationDate(input.reservationDate);
  const timeLabel = formatReservationTime(input.reservationTime);
  const noteLabel = input.note?.trim();
  const safeGuestName = escapeHtml(input.guestName);
  const safeDateLabel = escapeHtml(dateLabel);
  const safeTimeLabel = escapeHtml(timeLabel);
  const safeNote = noteLabel ? escapeHtml(noteLabel) : "";

  const subject = `${statusTitle} - ${dateLabel} ${timeLabel}`;
  const textLines = [
    `Hello ${input.guestName},`,
    "",
    introLine,
    "",
    `Status: ${statusText}`,
    `Date: ${dateLabel}`,
    `Time: ${timeLabel}`,
    `Guests: ${input.guestCount}`,
    ...(noteLabel ? ["", `Note: ${noteLabel}`] : []),
    "",
    "If you have any questions, just reply to this email.",
  ];

  const html = [
    `<div style=\"font-family:Arial,sans-serif;line-height:1.6;color:#1f2937;max-width:560px;margin:0 auto;padding:24px;\">`,
    `<h2 style=\"margin:0 0 12px;\">${escapeHtml(statusTitle)}</h2>`,
    `<p style=\"margin:0 0 12px;\">Hello ${safeGuestName},</p>`,
    `<p style=\"margin:0 0 16px;\">${escapeHtml(introLine)}</p>`,
    `<div style=\"border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin-bottom:16px;background:#f9fafb;\">`,
    `<p style=\"margin:0 0 6px;\"><strong>Status:</strong> ${escapeHtml(statusText)}</p>`,
    `<p style=\"margin:0 0 6px;\"><strong>Date:</strong> ${safeDateLabel}</p>`,
    `<p style=\"margin:0 0 6px;\"><strong>Time:</strong> ${safeTimeLabel}</p>`,
    `<p style=\"margin:0;\"><strong>Guests:</strong> ${input.guestCount}</p>`,
    `</div>`,
    ...(noteLabel
      ? [`<p style=\"margin:0 0 16px;\"><strong>Note:</strong> ${safeNote}</p>`]
      : []),
    `<p style=\"margin:0;\">If you have any questions, just reply to this email.</p>`,
    `</div>`,
  ].join("");

  const { data, error } = await resend.emails.send({
    from,
    to: [input.toEmail],
    subject,
    html,
    text: textLines.join("\n"),
    ...(replyTo ? { replyTo } : {}),
  });

  if (error) {
    throw new Error(error.message || "Failed to send reservation status email.");
  }

  return data?.id ?? null;
}

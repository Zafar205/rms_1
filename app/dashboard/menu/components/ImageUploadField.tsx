/* eslint-disable @next/next/no-img-element */

"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";

type ImageUploadFieldProps = {
  inputId: string;
  name?: string;
  label: string;
  helperText: string;
  initialPreviewSrc?: string;
  emptyPreviewText?: string;
};

export default function ImageUploadField({
  inputId,
  name = "imageFile",
  label,
  helperText,
  initialPreviewSrc,
  emptyPreviewText = "No file selected.",
}: ImageUploadFieldProps) {
  const [previewSrc, setPreviewSrc] = useState<string | null>(initialPreviewSrc ?? null);
  const currentBlobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (currentBlobUrlRef.current) {
        URL.revokeObjectURL(currentBlobUrlRef.current);
      }
    };
  }, []);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (currentBlobUrlRef.current) {
      URL.revokeObjectURL(currentBlobUrlRef.current);
      currentBlobUrlRef.current = null;
    }

    const file = event.currentTarget.files?.[0];

    if (!file) {
      setPreviewSrc(initialPreviewSrc ?? null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    currentBlobUrlRef.current = objectUrl;
    setPreviewSrc(objectUrl);
  };

  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className="text-xs font-bold uppercase tracking-wide">
        {label}
      </label>
      <input
        id={inputId}
        name={name}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="w-full rounded-lg border border-white/20 bg-[#120d0c] px-3 py-2.5 text-sm text-stone-300 file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-on-primary"
      />
      <p className="text-xs text-stone-400">{helperText}</p>

      <div className="overflow-hidden rounded-lg border border-white/10 bg-[#0f0b0a]">
        {previewSrc ? (
          <img
            src={previewSrc}
            alt="Menu image preview"
            className="h-40 w-full object-cover"
          />
        ) : (
          <div className="flex h-40 items-center justify-center px-4 text-center text-xs text-stone-500">
            {emptyPreviewText}
          </div>
        )}
      </div>
    </div>
  );
}
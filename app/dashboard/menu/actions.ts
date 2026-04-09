"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { requireAdminUser } from "@/lib/auth/server";
import { createSupabaseServerAuthClient } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { resolveMenuImageSource } from "@/lib/menu-image";

const menuImageBucket = process.env.NEXT_PUBLIC_SUPABASE_MENU_BUCKET ?? "menu-images";
const menuImageFolder = process.env.SUPABASE_MENU_IMAGE_FOLDER ?? "menu-items";
const maxMenuImageUploadBytes = 8 * 1024 * 1024;
const allowedMenuImageMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];

const getTextValue = (value: FormDataEntryValue | null) => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
};

const parsePriceValue = (value: FormDataEntryValue | null) => {
  const normalized = getTextValue(value);

  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return Math.round(parsed);
};

const normalizeImageValue = (value: FormDataEntryValue | null) => {
  return resolveMenuImageSource(getTextValue(value));
};

const getImageFileExtension = (file: File) => {
  const filenameExtension = file.name.trim().toLowerCase().split(".").pop();
  const allowedByName = new Set(["jpg", "jpeg", "png", "webp", "gif", "avif"]);

  if (filenameExtension && allowedByName.has(filenameExtension)) {
    return filenameExtension;
  }

  const mimeToExtension: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/avif": "avif",
  };

  return mimeToExtension[file.type] ?? "jpg";
};

const sanitizeFileBaseName = (name: string) => {
  const nameWithoutExtension = name.replace(/\.[^.]+$/, "").trim().toLowerCase();
  const sanitized = nameWithoutExtension.replace(/[^a-z0-9-_]+/g, "-").replace(/-+/g, "-");

  return sanitized.replace(/^-|-$/g, "") || "menu-item";
};

const toImageFileOrNull = (value: FormDataEntryValue | null) => {
  if (typeof File === "undefined") {
    return null;
  }

  if (!(value instanceof File)) {
    return null;
  }

  if (value.size === 0) {
    return null;
  }

  return value;
};

const isBucketNotFoundError = (errorMessage: string | undefined) => {
  if (!errorMessage) {
    return false;
  }

  return errorMessage.toLowerCase().includes("bucket not found");
};

const ensureMenuImageBucket = async (
  supabase: NonNullable<ReturnType<typeof createSupabaseServerClient>>
) => {
  const { error } = await supabase.storage.createBucket(menuImageBucket, {
    public: true,
    fileSizeLimit: `${maxMenuImageUploadBytes}`,
    allowedMimeTypes: allowedMenuImageMimeTypes,
  });

  if (!error) {
    return;
  }

  const message = error.message.toLowerCase();
  const alreadyExists = message.includes("already exists") || message.includes("duplicate");

  if (alreadyExists) {
    return;
  }

  throw new Error(
    `Image upload failed: Could not create storage bucket "${menuImageBucket}". ${error.message}`
  );
};

const uploadMenuImageFile = async (
  supabase: NonNullable<ReturnType<typeof createSupabaseServerClient>>,
  file: File
) => {
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files are allowed for menu uploads.");
  }

  if (file.size > maxMenuImageUploadBytes) {
    throw new Error("Image too large. Max allowed size is 8 MB.");
  }

  const extension = getImageFileExtension(file);
  const baseName = sanitizeFileBaseName(file.name);
  const filename = `${Date.now()}-${randomUUID().slice(0, 8)}-${baseName}.${extension}`;
  const objectPath = `${menuImageFolder}/${filename}`.replace(/^\/+/, "");
  const fileBytes = new Uint8Array(await file.arrayBuffer());

  const uploadFile = async () =>
    supabase.storage.from(menuImageBucket).upload(objectPath, fileBytes, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || undefined,
    });

  let { error } = await uploadFile();

  if (error && isBucketNotFoundError(error.message)) {
    await ensureMenuImageBucket(supabase);
    ({ error } = await uploadFile());
  }

  if (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  }

  return resolveMenuImageSource(`${menuImageBucket}/${objectPath}`);
};

const resolveMenuImageInput = async (
  supabase: NonNullable<ReturnType<typeof createSupabaseServerClient>>,
  formData: FormData
) => {
  const imageFile = toImageFileOrNull(formData.get("imageFile"));

  if (imageFile) {
    return uploadMenuImageFile(supabase, imageFile);
  }

  return normalizeImageValue(formData.get("image"));
};

const getSupabaseServiceOrThrow = () => {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    throw new Error(
      "Supabase configuration missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY."
    );
  }

  return supabase;
};

const getSupabaseAuthOrThrow = async () => {
  const supabase = await createSupabaseServerAuthClient();

  if (!supabase) {
    throw new Error(
      "Supabase auth configuration missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY."
    );
  }

  return supabase;
};

const revalidateMenuPages = () => {
  revalidatePath("/dashboard/menu");
  revalidatePath("/menu");
};

export async function createMenuItemAction(formData: FormData) {
  await requireAdminUser();

  const supabase = await getSupabaseAuthOrThrow();
  const storageSupabase = getSupabaseServiceOrThrow();
  const name = getTextValue(formData.get("name"));
  const category = getTextValue(formData.get("category"));
  const description = getTextValue(formData.get("description"));
  const alt = getTextValue(formData.get("alt"));
  const pricePkr = parsePriceValue(formData.get("pricePkr"));
  const image = await resolveMenuImageInput(storageSupabase, formData);
  const isAvailable = formData.get("isAvailable") === "on";

  if (!name || !category || !description || pricePkr === null) {
    throw new Error("Name, category, description, and a valid price are required.");
  }

  const { error } = await supabase.from("menu_items").insert({
    name,
    category,
    description,
    price_pkr: pricePkr,
    image,
    alt: alt || `Menu image for ${name}`,
    is_available: isAvailable,
  });

  if (error) {
    throw new Error(`Failed to create menu item: ${error.message}`);
  }

  revalidateMenuPages();
}

export async function updateMenuItemAction(formData: FormData) {
  await requireAdminUser();

  const supabase = await getSupabaseAuthOrThrow();
  const storageSupabase = getSupabaseServiceOrThrow();
  const id = getTextValue(formData.get("id"));
  const name = getTextValue(formData.get("name"));
  const category = getTextValue(formData.get("category"));
  const description = getTextValue(formData.get("description"));
  const alt = getTextValue(formData.get("alt"));
  const pricePkr = parsePriceValue(formData.get("pricePkr"));
  const image = await resolveMenuImageInput(storageSupabase, formData);
  const isAvailable = formData.get("isAvailable") === "on";

  if (!id || !name || !category || !description || pricePkr === null) {
    throw new Error("Missing fields. Ensure id, name, category, description, and price are valid.");
  }

  const { error } = await supabase
    .from("menu_items")
    .update({
      name,
      category,
      description,
      price_pkr: pricePkr,
      image,
      alt: alt || `Menu image for ${name}`,
      is_available: isAvailable,
    })
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to update menu item: ${error.message}`);
  }

  revalidateMenuPages();
}

export async function deleteMenuItemAction(formData: FormData) {
  await requireAdminUser();

  const supabase = await getSupabaseAuthOrThrow();
  const id = getTextValue(formData.get("id"));

  if (!id) {
    throw new Error("Menu item id is required.");
  }

  const { error } = await supabase.from("menu_items").delete().eq("id", id);

  if (error) {
    throw new Error(`Failed to delete menu item: ${error.message}`);
  }

  revalidateMenuPages();
}
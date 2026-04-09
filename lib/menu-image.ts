const fallbackMenuImage = "/biryani.jpeg";

const getSupabaseBaseUrl = () => process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "");

const buildSupabasePublicUrlFromObjectPath = (objectPath: string) => {
  const baseUrl = getSupabaseBaseUrl();

  if (!baseUrl) {
    return null;
  }

  const normalizedObjectPath = objectPath.replace(/^\/+/, "");

  if (!normalizedObjectPath) {
    return null;
  }

  if (normalizedObjectPath.startsWith("storage/v1/object/public/")) {
    return `${baseUrl}/${normalizedObjectPath}`;
  }

  return `${baseUrl}/storage/v1/object/public/${normalizedObjectPath}`;
};

export function resolveMenuImageSource(value: string | null | undefined) {
  const normalized = value?.trim();

  if (!normalized) {
    return fallbackMenuImage;
  }

  if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
    return normalized;
  }

  if (normalized.startsWith("/")) {
    return normalized;
  }

  if (normalized.includes("/")) {
    return buildSupabasePublicUrlFromObjectPath(normalized) ?? `/${normalized}`;
  }

  return `/${normalized}`;
}
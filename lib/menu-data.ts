import { createSupabaseServerClient } from "@/lib/supabase/server";
import { resolveMenuImageSource } from "@/lib/menu-image";

export type MenuItem = {
  id: string;
  name: string;
  category: string;
  pricePkr: number;
  description: string;
  image: string;
  alt: string;
  isAvailable: boolean;
};

type MenuItemRow = {
  id: string;
  name: string;
  category: string;
  price_pkr: number;
  description: string;
  image: string | null;
  alt: string | null;
  is_available: boolean | null;
};

export const fallbackMenuItems: MenuItem[] = [
  {
    id: "royal-chicken-biryani",
    name: "Royal Chicken Biryani",
    category: "Biryani",
    pricePkr: 1850,
    description:
      "Aromatic basmati rice layered with saffron, tender chicken, caramelized onions, and fresh mint.",
    image: "/biryani.jpeg",
    alt: "A serving of chicken biryani topped with fried onions and herbs",
    isAvailable: true,
  },
  {
    id: "sindhi-beef-biryani",
    name: "Sindhi Beef Biryani",
    category: "Biryani",
    pricePkr: 2150,
    description:
      "Long-grain rice, bold red masala, and slow-cooked beef finished with green chilies.",
    image: "/biryani.jpeg",
    alt: "Spiced beef biryani served in a traditional bowl",
    isAvailable: true,
  },
  {
    id: "prawn-dum-biryani",
    name: "Prawn Dum Biryani",
    category: "Biryani",
    pricePkr: 2450,
    description:
      "Coastal-style prawns layered with saffron rice, coriander, and house biryani masala.",
    image: "/biryani.jpeg",
    alt: "Prawn biryani with fresh herbs and saffron rice",
    isAvailable: true,
  },
  {
    id: "smoked-seekh-kebab",
    name: "Smoked Seekh Kebab",
    category: "Kebab",
    pricePkr: 1450,
    description:
      "Juicy minced kebabs grilled over charcoal, served with mint chutney and pickled onions.",
    image: "/kebab.jpeg",
    alt: "Chargrilled seekh kebabs plated with lemon wedges and chutney",
    isAvailable: true,
  },
  {
    id: "peshawari-chapli-kebab",
    name: "Peshawari Chapli Kebab",
    category: "Kebab",
    pricePkr: 1350,
    description:
      "Hand-pressed kebabs with crushed coriander and pomegranate seeds, seared on iron tawa.",
    image: "/kebab.jpeg",
    alt: "Chapli kebabs served with naan and onions",
    isAvailable: true,
  },
  {
    id: "mutton-boti-kebab",
    name: "Mutton Boti Kebab",
    category: "Kebab",
    pricePkr: 2250,
    description:
      "Tender mutton cubes marinated overnight in yogurt, garlic, and warming whole spices.",
    image: "/kebab.jpeg",
    alt: "Mutton boti kebabs with smoky char and herbs",
    isAvailable: true,
  },
  {
    id: "tandoori-chicken-tikka",
    name: "Tandoori Chicken Tikka",
    category: "Tikka",
    pricePkr: 1650,
    description:
      "Yogurt-marinated chicken roasted in the tandoor with a bold blend of desi spices.",
    image: "/tikka.jpeg",
    alt: "Tandoori chicken tikka pieces with smoky edges and fresh garnish",
    isAvailable: true,
  },
  {
    id: "creamy-malai-tikka",
    name: "Creamy Malai Tikka",
    category: "Tikka",
    pricePkr: 1750,
    description:
      "Mild, creamy chicken tikka with cheese and cardamom, finished with coal smoke.",
    image: "/tikka.jpeg",
    alt: "Creamy malai tikka with a charred finish",
    isAvailable: true,
  },
  {
    id: "afghani-chicken-tikka",
    name: "Afghani Chicken Tikka",
    category: "Tikka",
    pricePkr: 1950,
    description:
      "Rich and smoky tikka in a cashew cream marinade, served with grilled vegetables.",
    image: "/tikka.jpeg",
    alt: "Afghani style chicken tikka platter",
    isAvailable: true,
  },
];

const filterAvailableItems = (items: MenuItem[]) => items.filter((item) => item.isAvailable);

const mapRowToMenuItem = (row: MenuItemRow): MenuItem => ({
  id: row.id,
  name: row.name,
  category: row.category,
  pricePkr: Number(row.price_pkr),
  description: row.description,
  image: resolveMenuImageSource(row.image),
  alt: row.alt?.trim() || `Menu image for ${row.name}`,
  isAvailable: row.is_available ?? true,
});

type GetMenuItemsOptions = {
  includeUnavailable?: boolean;
  fallbackOnError?: boolean;
};

export async function getMenuItems(options: GetMenuItemsOptions = {}): Promise<MenuItem[]> {
  const { includeUnavailable = false, fallbackOnError = true } = options;
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return includeUnavailable ? fallbackMenuItems : filterAvailableItems(fallbackMenuItems);
  }

  let query = supabase
    .from("menu_items")
    .select("id, name, category, price_pkr, description, image, alt, is_available")
    .order("category", { ascending: true })
    .order("name", { ascending: true });

  if (!includeUnavailable) {
    query = query.eq("is_available", true);
  }

  const { data, error } = await query;

  if (error) {
    if (!fallbackOnError) {
      return [];
    }

    return includeUnavailable ? fallbackMenuItems : filterAvailableItems(fallbackMenuItems);
  }

  const mappedItems = (data ?? []).map(mapRowToMenuItem);
  return includeUnavailable ? mappedItems : filterAvailableItems(mappedItems);
}
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type MenuCategory = {
  id: string;
  name: string;
};

type MenuCategoryRow = {
  id: string;
  name: string;
};

const normalizeCategoryName = (value: string) => value.trim().toUpperCase();

const sortByCategoryName = (left: MenuCategory, right: MenuCategory) => left.name.localeCompare(right.name);

export async function getMenuCategories(): Promise<MenuCategory[]> {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase.from("menu_categories").select("id, name").order("name", {
    ascending: true,
  });

  if (error) {
    return [];
  }

  const normalizedRows = (data ?? []).reduce<MenuCategory[]>((categories, row) => {
    const category = normalizeCategoryName((row as MenuCategoryRow).name);

    if (!category) {
      return categories;
    }

    categories.push({
      id: (row as MenuCategoryRow).id,
      name: category,
    });

    return categories;
  }, []);

  const deduplicated = [...new Map(normalizedRows.map((category) => [category.name, category])).values()];
  return deduplicated.sort(sortByCategoryName);
}

import { getMenuItems } from "@/lib/menu-data";
import { getMenuCategories } from "@/lib/menu-categories";
import MenuClient from "./MenuClient";

export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const [menuItems, menuCategories] = await Promise.all([getMenuItems(), getMenuCategories()]);

  return <MenuClient menuItems={menuItems} menuCategories={menuCategories} />;
}
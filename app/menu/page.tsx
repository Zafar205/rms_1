import { getMenuItems } from "@/lib/menu-data";
import MenuClient from "./MenuClient";

export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const menuItems = await getMenuItems();

  return <MenuClient menuItems={menuItems} />;
}
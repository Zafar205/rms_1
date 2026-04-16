import { getMenuCategories } from "@/lib/menu-categories";
import { getMenuItems } from "@/lib/menu-data";
import { createOrderAction } from "./actions";
import PosTerminal from "./components/PosTerminal";

export const dynamic = "force-dynamic";

export default async function PosPage() {
  const [menuItems, menuCategories] = await Promise.all([getMenuItems(), getMenuCategories()]);

  return (
    <PosTerminal
      menuItems={menuItems}
      menuCategories={menuCategories}
      createOrderAction={createOrderAction}
    />
  );
}

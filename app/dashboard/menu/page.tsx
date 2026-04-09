import { getMenuItems } from "@/lib/menu-data";
import { requireAdminUser } from "@/lib/auth/server";
import { hasSupabaseConfiguration } from "@/lib/supabase/server";
import { createMenuItemAction, deleteMenuItemAction, updateMenuItemAction } from "./actions";
import MenuItemsManager from "./components/MenuItemsManager";

export const dynamic = "force-dynamic";

export default async function MenuDashboardPage() {
  await requireAdminUser();

  const menuItems = await getMenuItems({ includeUnavailable: true, fallbackOnError: false });
  const supabaseConfigured = hasSupabaseConfiguration();

  return (
    <section className="space-y-6">
      {!supabaseConfigured ? (
        <div className="rounded-xl border border-amber-400/30 bg-amber-300/10 px-5 py-4 text-sm text-amber-100">
          Supabase environment variables are missing. Set NEXT_PUBLIC_SUPABASE_URL and
          NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY in your .env file before using dashboard
          updates.
        </div>
      ) : null}

      <MenuItemsManager
        menuItems={menuItems}
        createAction={createMenuItemAction}
        updateAction={updateMenuItemAction}
        deleteAction={deleteMenuItemAction}
      />
    </section>
  );
}
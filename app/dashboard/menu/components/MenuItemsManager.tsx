/* eslint-disable @next/next/no-img-element */

"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { MdAdd, MdClose, MdDelete, MdEdit, MdSave } from "react-icons/md";
import type { MenuItem } from "@/lib/menu-data";
import ImageUploadField from "./ImageUploadField";

type MenuAction = (formData: FormData) => Promise<void>;

type MenuItemsManagerProps = {
  menuItems: MenuItem[];
  createAction: MenuAction;
  updateAction: MenuAction;
  deleteAction: MenuAction;
};

type ModalShellProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
};

function ModalShell({ title, onClose, children }: ModalShellProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close modal"
        onClick={onClose}
        className="absolute inset-0 bg-black/65 backdrop-blur-[2px]"
      />

      <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl border border-white/10 bg-[#211715] text-stone-100 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h3 className="text-2xl font-black tracking-tight">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 bg-[#120d0c] text-lg text-stone-300 transition-colors hover:bg-white/10"
          >
            <MdClose />
          </button>
        </div>

        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export default function MenuItemsManager({
  menuItems,
  createAction,
  updateAction,
  deleteAction,
}: MenuItemsManagerProps) {
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [createError, setCreateError] = useState("");
  const [editError, setEditError] = useState("");

  const editingItem = useMemo(
    () => menuItems.find((item) => item.id === editingItemId) ?? null,
    [menuItems, editingItemId]
  );

  const handleCreateAction = async (formData: FormData) => {
    setCreateError("");

    try {
      await createAction(formData);
      setCreateModalOpen(false);
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : "Failed to create menu item.");
    }
  };

  const handleUpdateAction = async (formData: FormData) => {
    setEditError("");

    try {
      await updateAction(formData);
      setEditingItemId(null);
    } catch (error) {
      setEditError(error instanceof Error ? error.message : "Failed to update menu item.");
    }
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-[#211715] p-5 md:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-amber-100">Menu Items</h2>
          <p className="mt-1 text-sm text-stone-300">Manage your restaurant menu</p>
        </div>

        <div className="flex items-center gap-2">
          <p className="rounded-md border border-white/15 bg-[#1a1312] px-3 py-2 text-xs font-bold uppercase tracking-wide text-stone-300">
            {menuItems.length} items
          </p>
          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-on-primary transition-transform hover:scale-[0.98]"
          >
            <MdAdd className="text-lg" />
            Add Item
          </button>
        </div>
      </div>

      {menuItems.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/20 bg-[#120d0c] p-8 text-center">
          <h3 className="mb-2 text-xl font-black text-amber-100">No Menu Items Found</h3>
          <p className="text-sm text-stone-300">Click Add Item to create your first dish.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {menuItems.map((item) => (
            <article
              key={item.id}
              className="overflow-hidden rounded-xl border border-white/10 bg-[#120d0c] shadow-sm"
            >
              <div className="h-36 bg-[#3a2a24]">
                {item.image ? (
                  <img src={item.image} alt={item.alt || item.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-stone-400">
                    No image
                  </div>
                )}
              </div>

              <div className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="line-clamp-1 text-lg font-black text-stone-100">{item.name}</h3>
                  <p className="shrink-0 text-base font-black text-primary">PKR {item.pricePkr}</p>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="rounded-md bg-white/10 px-2 py-1 font-semibold text-stone-200">
                    {item.category}
                  </span>
                  <span
                    className={`rounded-md px-2 py-1 font-semibold ${
                      item.isAvailable
                        ? "bg-emerald-300/20 text-emerald-200"
                        : "bg-red-300/20 text-red-200"
                    }`}
                  >
                    {item.isAvailable ? "Visible" : "Hidden"}
                  </span>
                </div>

                <p className="min-h-12 text-sm text-stone-300">{item.description}</p>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setEditError("");
                      setEditingItemId(item.id);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-xs font-bold uppercase tracking-wide text-stone-100 transition-colors hover:bg-white/10"
                  >
                    <MdEdit className="text-base" />
                    Edit
                  </button>

                  <form action={deleteAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <button
                      type="submit"
                      onClick={(event) => {
                        const confirmed = window.confirm(
                          `Delete ${item.name}? This action cannot be undone.`
                        );

                        if (!confirmed) {
                          event.preventDefault();
                        }
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-300/40 bg-red-300/10 px-3 py-2 text-xs font-bold uppercase tracking-wide text-red-100 transition-colors hover:bg-red-300/20"
                    >
                      <MdDelete className="text-base" />
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {isCreateModalOpen ? (
        <ModalShell title="Add New Item" onClose={() => setCreateModalOpen(false)}>
          <form action={handleCreateAction} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="new-name" className="text-xs font-bold uppercase tracking-wide">
                Dish Name
              </label>
              <input
                id="new-name"
                name="name"
                required
                placeholder="Smoky Mutton Karahi"
                className="w-full rounded-lg border border-white/20 bg-[#120d0c] px-3 py-2.5 text-sm text-stone-100 outline-none ring-primary/50 transition placeholder:text-stone-500 focus:ring-2"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="new-category" className="text-xs font-bold uppercase tracking-wide">
                  Category
                </label>
                <input
                  id="new-category"
                  name="category"
                  required
                  placeholder="Main Course"
                  className="w-full rounded-lg border border-white/20 bg-[#120d0c] px-3 py-2.5 text-sm text-stone-100 outline-none ring-primary/50 transition placeholder:text-stone-500 focus:ring-2"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="new-price" className="text-xs font-bold uppercase tracking-wide">
                  Price (PKR)
                </label>
                <input
                  id="new-price"
                  name="pricePkr"
                  type="number"
                  min={1}
                  required
                  placeholder="1850"
                  className="w-full rounded-lg border border-white/20 bg-[#120d0c] px-3 py-2.5 text-sm text-stone-100 outline-none ring-primary/50 transition placeholder:text-stone-500 focus:ring-2"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="new-description" className="text-xs font-bold uppercase tracking-wide">
                Description
              </label>
              <textarea
                id="new-description"
                name="description"
                required
                rows={4}
                placeholder="Hand-ground spices, slow-cooked gravy, and tandoor-finished meat."
                className="w-full rounded-lg border border-white/20 bg-[#120d0c] px-3 py-2.5 text-sm text-stone-100 outline-none ring-primary/50 transition placeholder:text-stone-500 focus:ring-2"
              />
            </div>

            <ImageUploadField
              inputId="new-image-file"
              label="Upload From Device"
              helperText="Choose an image from your device."
              emptyPreviewText="Select a file to preview the menu image."
            />

            <div className="space-y-1.5">
              <label htmlFor="new-alt" className="text-xs font-bold uppercase tracking-wide">
                Image Alt Text
              </label>
              <input
                id="new-alt"
                name="alt"
                placeholder="Closeup of mutton karahi served in handi"
                className="w-full rounded-lg border border-white/20 bg-[#120d0c] px-3 py-2.5 text-sm text-stone-100 outline-none ring-primary/50 transition placeholder:text-stone-500 focus:ring-2"
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-stone-300">
              <input
                type="checkbox"
                name="isAvailable"
                defaultChecked
                className="h-4 w-4 rounded border-white/30 bg-transparent text-primary"
              />
              Show item on public menu
            </label>

            {createError ? (
              <p className="rounded-lg border border-red-300/40 bg-red-300/10 px-3 py-2 text-sm text-red-100">
                {createError}
              </p>
            ) : null}

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-semibold text-stone-200 transition-colors hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-on-primary transition-transform hover:scale-[0.98]"
              >
                <MdSave className="text-base" />
                Create Item
              </button>
            </div>
          </form>
        </ModalShell>
      ) : null}

      {editingItem ? (
        <ModalShell title={`Edit ${editingItem.name}`} onClose={() => setEditingItemId(null)}>
          <form action={handleUpdateAction} className="space-y-4">
            <input type="hidden" name="id" value={editingItem.id} />
            <input type="hidden" name="image" value={editingItem.image} />

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wide">Name</label>
              <input
                name="name"
                defaultValue={editingItem.name}
                required
                className="w-full rounded-lg border border-white/20 bg-[#120d0c] px-3 py-2.5 text-sm text-stone-100 outline-none ring-primary/50 transition placeholder:text-stone-500 focus:ring-2"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wide">Category</label>
                <input
                  name="category"
                  defaultValue={editingItem.category}
                  required
                  className="w-full rounded-lg border border-white/20 bg-[#120d0c] px-3 py-2.5 text-sm text-stone-100 outline-none ring-primary/50 transition placeholder:text-stone-500 focus:ring-2"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wide">Price (PKR)</label>
                <input
                  name="pricePkr"
                  type="number"
                  min={1}
                  defaultValue={editingItem.pricePkr}
                  required
                  className="w-full rounded-lg border border-white/20 bg-[#120d0c] px-3 py-2.5 text-sm text-stone-100 outline-none ring-primary/50 transition placeholder:text-stone-500 focus:ring-2"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wide">Description</label>
              <textarea
                name="description"
                defaultValue={editingItem.description}
                rows={3}
                required
                className="w-full rounded-lg border border-white/20 bg-[#120d0c] px-3 py-2.5 text-sm text-stone-100 outline-none ring-primary/50 transition placeholder:text-stone-500 focus:ring-2"
              />
            </div>

            <ImageUploadField
              inputId={`edit-image-file-${editingItem.id}`}
              label="Upload New Image"
              helperText="Leave empty to keep the current image."
              initialPreviewSrc={editingItem.image}
              emptyPreviewText="No preview available for this item yet."
            />

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wide">Alt Text</label>
              <input
                name="alt"
                defaultValue={editingItem.alt}
                className="w-full rounded-lg border border-white/20 bg-[#120d0c] px-3 py-2.5 text-sm text-stone-100 outline-none ring-primary/50 transition placeholder:text-stone-500 focus:ring-2"
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-stone-300">
              <input
                type="checkbox"
                name="isAvailable"
                defaultChecked={editingItem.isAvailable}
                className="h-4 w-4 rounded border-white/30 bg-transparent text-primary"
              />
              Visible on public menu
            </label>

            {editError ? (
              <p className="rounded-lg border border-red-300/40 bg-red-300/10 px-3 py-2 text-sm text-red-100">
                {editError}
              </p>
            ) : null}

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingItemId(null)}
                className="rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-semibold text-stone-200 transition-colors hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-on-primary transition-transform hover:scale-[0.98]"
              >
                <MdSave className="text-base" />
                Save Changes
              </button>
            </div>
          </form>
        </ModalShell>
      ) : null}
    </section>
  );
}
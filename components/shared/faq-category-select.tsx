"use client";

import {
  Check,
  ChevronsUpDown,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { DeleteAlert } from "@/components/shared/delete-alert";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover/popover";
import { apiClient } from "@/lib/axios";
import { cn } from "@/lib/utils";

export interface FaqCategoryOption {
  _id: string;
  name: string;
  slug: string;
  usageCount: number;
}

interface FaqCategorySelectProps {
  /** Selected category id */
  value?: string;
  /** Fallback label (e.g. the group's stored category name) */
  valueLabel?: string;
  onChange: (category: { _id: string; name: string } | null) => void;
  /** The FAQ group being edited is already counted in usageCount for its category */
  editingGroupCategoryId?: string;
  id?: string;
}

function apiError(err: any, fallback: string) {
  const msg = err?.response?.data?.message;
  return Array.isArray(msg) ? msg.join(", ") : msg || fallback;
}

/**
 * Dropdown of managed FAQ category names with inline create / rename / delete.
 * Edge cases handled:
 * - duplicate names (case-insensitive) -> backend 409, shown as a toast
 * - renaming the selected category updates the selected label
 * - deleting a category still used by FAQ groups -> blocked with usage count
 * - deleting the currently selected (unsaved) category clears the selection
 */
export function FaqCategorySelect({
  value,
  valueLabel,
  onChange,
  editingGroupCategoryId,
  id,
}: FaqCategorySelectProps) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<FaqCategoryOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get("/faq-categories/admin");
      setOptions(res.data?.data ?? []);
    } catch (err) {
      toast.error(apiError(err, "Failed to load FAQ categories"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 0);
    else {
      setEditingId(null);
      setSearch("");
    }
  }, [open]);

  const selected = options.find((o) => o._id === value);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q
      ? options.filter((o) => o.name.toLowerCase().includes(q))
      : options;
  }, [options, search]);
  const exact = options.some(
    (o) => o.name.toLowerCase() === search.trim().toLowerCase()
  );

  const sortByName = (list: FaqCategoryOption[]) =>
    [...list].sort((a, b) => a.name.localeCompare(b.name));

  const handleCreate = async () => {
    const name = search.replace(/\s+/g, " ").trim();
    if (!name) return;
    try {
      setIsCreating(true);
      const res = await apiClient.post("/faq-categories", { name });
      const created = res.data?.data;
      const opt: FaqCategoryOption = { ...created, usageCount: 0 };
      setOptions((prev) => sortByName([...prev, opt]));
      onChange({ _id: opt._id, name: opt.name });
      toast.success(`Category "${opt.name}" created`);
      setOpen(false);
    } catch (err) {
      toast.error(apiError(err, "Failed to create category"));
    } finally {
      setIsCreating(false);
    }
  };

  const handleRename = async (opt: FaqCategoryOption) => {
    const name = editName.replace(/\s+/g, " ").trim();
    if (!name) {
      toast.error("Category name cannot be empty");
      return;
    }
    if (name === opt.name) {
      setEditingId(null);
      return;
    }
    try {
      setBusyId(opt._id);
      const res = await apiClient.patch(`/faq-categories/${opt._id}`, { name });
      const updated = res.data?.data;
      setOptions((prev) =>
        sortByName(
          prev.map((o) =>
            o._id === opt._id
              ? { ...o, name: updated.name, slug: updated.slug }
              : o
          )
        )
      );
      if (value === opt._id) onChange({ _id: opt._id, name: updated.name });
      toast.success(
        opt.usageCount > 0
          ? `Renamed to "${updated.name}" (${opt.usageCount} FAQ group(s) updated)`
          : `Renamed to "${updated.name}"`
      );
      setEditingId(null);
    } catch (err) {
      toast.error(apiError(err, "Failed to rename category"));
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (opt: FaqCategoryOption) => {
    try {
      setBusyId(opt._id);
      await apiClient.delete(`/faq-categories/${opt._id}`);
      setOptions((prev) => prev.filter((o) => o._id !== opt._id));
      if (value === opt._id) onChange(null);
      toast.success(`Category "${opt.name}" deleted`);
    } catch (err) {
      toast.error(apiError(err, "Failed to delete category"));
    } finally {
      setBusyId(null);
    }
  };

  const label = selected?.name || valueLabel || "";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          <span className={cn("truncate", !label && "text-muted-foreground")}>
            {label || (isLoading ? "Loading categories…" : "Select category")}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] min-w-[300px] p-0"
        align="start"
      >
        <div className="flex items-center gap-2 border-b px-3">
          <Search className="h-4 w-4 shrink-0 opacity-50" />
          <input
            ref={searchRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (filtered.length === 1 && exact) {
                  onChange({ _id: filtered[0]._id, name: filtered[0].name });
                  setOpen(false);
                } else if (search.trim() && !exact) handleCreate();
              }
            }}
            placeholder="Search or type a new category…"
            className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        <div className="max-h-64 overflow-y-auto p-1">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </div>
          ) : filtered.length === 0 && !search.trim() ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No categories yet. Type a name above to create one.
            </p>
          ) : (
            filtered.map((opt) => {
              const isSelected = value === opt._id;
              const busy = busyId === opt._id;
              // The group being edited counts toward usage but doesn't block switching away later
              const otherUsage =
                opt.usageCount - (editingGroupCategoryId === opt._id ? 1 : 0);

              if (editingId === opt._id) {
                return (
                  <div
                    key={opt._id}
                    className="flex items-center gap-1 px-1 py-1"
                  >
                    <Input
                      autoFocus
                      value={editName}
                      maxLength={60}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleRename(opt);
                        }
                        if (e.key === "Escape") {
                          e.preventDefault();
                          e.stopPropagation();
                          setEditingId(null);
                        }
                      }}
                      className="h-8 text-sm"
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 shrink-0"
                      disabled={busy}
                      onClick={() => handleRename(opt)}
                      title="Save name"
                    >
                      {busy ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 shrink-0"
                      onClick={() => setEditingId(null)}
                      title="Cancel"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                );
              }

              return (
                <div
                  key={opt._id}
                  className={cn(
                    "group flex items-center gap-1 rounded-sm px-2 py-1.5 text-sm hover:bg-accent",
                    isSelected && "bg-accent/60"
                  )}
                >
                  <button
                    type="button"
                    className="flex flex-1 min-w-0 items-center gap-2 text-left"
                    onClick={() => {
                      onChange({ _id: opt._id, name: opt.name });
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "h-4 w-4 shrink-0",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="truncate">{opt.name}</span>
                    <span className="ml-auto pl-2 text-[10px] text-muted-foreground shrink-0">
                      {opt.usageCount} group{opt.usageCount === 1 ? "" : "s"}
                    </span>
                  </button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 shrink-0 opacity-60 group-hover:opacity-100"
                    title="Rename"
                    onClick={() => {
                      setEditingId(opt._id);
                      setEditName(opt.name);
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  {otherUsage > 0 ? (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 shrink-0 opacity-40 cursor-not-allowed"
                      title={`Used by ${opt.usageCount} FAQ group(s); move or delete them first`}
                      onClick={() =>
                        toast.error(
                          `"${opt.name}" is used by ${opt.usageCount} FAQ group(s). Move or delete those groups first.`
                        )
                      }
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  ) : (
                    <DeleteAlert
                      title="Delete FAQ category?"
                      description={
                        opt.usageCount > 0
                          ? `"${opt.name}" is used by the FAQ group you're editing. Save it under another category first, otherwise deletion will be refused.`
                          : `"${opt.name}" will be removed from the category list. This cannot be undone.`
                      }
                      onConfirm={() => handleDelete(opt)}
                    >
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        disabled={busy}
                        className="h-7 w-7 shrink-0 text-destructive opacity-60 group-hover:opacity-100"
                        title="Delete"
                      >
                        {busy ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </DeleteAlert>
                  )}
                </div>
              );
            })
          )}

          {!isLoading && search.trim() && !exact && (
            <button
              type="button"
              disabled={isCreating}
              onClick={handleCreate}
              className="mt-1 flex w-full items-center gap-2 rounded-sm px-2 py-2 text-sm text-primary hover:bg-accent disabled:opacity-60"
            >
              {isCreating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Create &ldquo;{search.replace(/\s+/g, " ").trim()}&rdquo;
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

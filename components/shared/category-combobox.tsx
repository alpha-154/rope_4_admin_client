"use client";

import { Check, ChevronsUpDown, Loader2, Plus } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog/dialog";
import { Input } from "@/components/ui/input/input";
import { Label } from "@/components/ui/label/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover/popover";
import { apiClient } from "@/lib/axios";
import { cn } from "@/lib/utils";

export interface CategoryOption {
  _id: string;
  name: string;
  slug: string;
  programCount?: number;
}

interface CategoryComboboxProps {
  /** Selected category id */
  value?: string;
  /** Fallback label while options load (e.g. program.category name) */
  valueLabel?: string;
  onChange: (category: CategoryOption) => void;
  id?: string;
}

/** Same rules as the backend slug validator: lowercase, digits, single hyphens. */
export function slugifyCategory(text: string) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Searchable category picker with inline "create category" modal.
 * Loads org categories from GET /categories/admin, creates via POST /categories.
 */
export function CategoryCombobox({
  value,
  valueLabel,
  onChange,
  id,
}: CategoryComboboxProps) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<CategoryOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Create modal
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get("/categories/admin", {
        params: { limit: 200 },
      });
      setOptions(res.data?.data ?? []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load categories");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const selected = useMemo(
    () => options.find((o) => o._id === value),
    [options, value]
  );
  const exactMatch = useMemo(
    () =>
      options.some((o) => o.name.toLowerCase() === search.trim().toLowerCase()),
    [options, search]
  );

  const openCreate = (prefill = "") => {
    setNewName(prefill);
    setNewSlug(slugifyCategory(prefill));
    setSlugTouched(false);
    setOpen(false);
    setCreateOpen(true);
  };

  const handleCreate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const name = newName.trim();
    const slug = slugifyCategory(newSlug || name);
    if (!name) {
      toast.error("Category name is required");
      return;
    }
    if (!slug) {
      toast.error("Slug must contain letters or numbers");
      return;
    }
    try {
      setIsCreating(true);
      const res = await apiClient.post("/categories", { name, slug });
      const created: CategoryOption = res.data?.data;
      setOptions((prev) =>
        [...prev, { ...created, programCount: 0 }].sort((a, b) =>
          a.name.localeCompare(b.name)
        )
      );
      onChange(created);
      setCreateOpen(false);
      setSearch("");
      toast.success(`Category "${created.name}" created`);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      toast.error(
        Array.isArray(msg) ? msg.join(", ") : msg || "Failed to create category"
      );
    } finally {
      setIsCreating(false);
    }
  };

  const triggerLabel = selected?.name || valueLabel || "";

  return (
    <>
      <div className="flex gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              id={id}
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="flex-1 min-w-0 justify-between font-normal"
            >
              <span
                className={cn(
                  "truncate",
                  !triggerLabel && "text-muted-foreground"
                )}
              >
                {triggerLabel ||
                  (isLoading ? "Loading categories…" : "Select category")}
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[--radix-popover-trigger-width] min-w-[240px] p-0"
            align="start"
          >
            <Command>
              <CommandInput
                placeholder="Search categories…"
                value={search}
                onValueChange={setSearch}
              />
              <CommandList>
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading…
                  </div>
                ) : (
                  <>
                    <CommandEmpty>
                      <div className="space-y-2 px-2 py-1 text-sm">
                        <p className="text-muted-foreground">
                          No category found.
                        </p>
                      </div>
                    </CommandEmpty>
                    <CommandGroup>
                      {options.map((opt) => (
                        <CommandItem
                          key={opt._id}
                          value={`${opt.name} ${opt.slug}`}
                          onSelect={() => {
                            onChange(opt);
                            setOpen(false);
                            setSearch("");
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              value === opt._id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <span className="flex-1 truncate">{opt.name}</span>
                          {typeof opt.programCount === "number" && (
                            <span className="ml-2 text-[10px] text-muted-foreground">
                              {opt.programCount}
                            </span>
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                    {search.trim() && !exactMatch && (
                      <CommandGroup>
                        <CommandItem
                          value={`__create__ ${search}`}
                          onSelect={() => openCreate(search.trim())}
                          className="text-primary"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Create &ldquo;{search.trim()}&rdquo;
                        </CommandItem>
                      </CommandGroup>
                    )}
                  </>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => openCreate(search.trim())}
          title="Add new category"
          aria-label="Add new category"
          className="shrink-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleCreate} className="space-y-4">
            <DialogHeader>
              <DialogTitle>New Program Category</DialogTitle>
              <DialogDescription>
                The slug is used in the website URL: /category/&lt;slug&gt;.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-1.5">
              <Label htmlFor="new-category-name">Category Name *</Label>
              <Input
                id="new-category-name"
                autoFocus
                value={newName}
                maxLength={80}
                placeholder="e.g. Summer Camp"
                onChange={(e) => {
                  setNewName(e.target.value);
                  if (!slugTouched) setNewSlug(slugifyCategory(e.target.value));
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-category-slug">URL Slug</Label>
              <Input
                id="new-category-slug"
                value={newSlug}
                maxLength={100}
                placeholder="summer-camp"
                className="font-mono text-xs"
                onChange={(e) => {
                  setSlugTouched(true);
                  setNewSlug(e.target.value.toLowerCase());
                }}
                onBlur={() => setNewSlug((s) => slugifyCategory(s))}
              />
              <p className="text-[11px] text-muted-foreground">
                Auto-generated from the name. A number is appended if the slug
                is taken.
              </p>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating || !newName.trim()}>
                {isCreating && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Category
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

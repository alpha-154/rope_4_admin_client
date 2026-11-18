"use client";

import { Button } from "@/components/ui/button/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select/select";
import { Switch } from "@/components/ui/switch/switch";
import { Textarea } from "@/components/ui/textarea/textarea";
import { apiClient } from "@/lib/axios";
import {
  HIGHLIGHT_ICONS,
  HIGHLIGHT_VALUE_SIGNS,
  formatHighlightValue,
} from "@/lib/highlight-options";
import { Plus, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

export interface HighlightItemForm {
  label: string;
  description?: string;
  /** Kept as a string while editing; sent as a number */
  value?: string;
  valueSign?: string;
  icon?: string;
}

export interface HighlightFormData {
  _id?: string;
  badge?: string;
  sectionTitle?: string;
  sectionDescription?: string;
  items: HighlightItemForm[];
  isActive?: boolean;
  isPublic?: boolean;
}

/** Shape coming back from the API (value is numeric there). */
export interface HighlightApiData {
  _id?: string;
  badge?: string;
  sectionTitle?: string;
  sectionDescription?: string;
  items?: {
    label: string;
    description?: string;
    value?: number | null;
    valueSign?: string;
    icon?: string;
  }[];
  isActive?: boolean;
  isPublic?: boolean;
}

interface HighlightDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: HighlightApiData | null;
  onSuccess: () => void;
}

const NONE = "__none__";
const emptyItem = (): HighlightItemForm => ({
  label: "",
  description: "",
  value: "",
  valueSign: "+",
  icon: "trophy",
});
const emptyForm = (): HighlightFormData => ({
  badge: "",
  sectionTitle: "",
  sectionDescription: "",
  items: [emptyItem()],
  isActive: true,
  isPublic: true,
});

export function HighlightDialog({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}: HighlightDialogProps) {
  const isEditing = Boolean(initialData?._id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<HighlightFormData>(emptyForm);

  useEffect(() => {
    if (!open) return;
    if (initialData) {
      setFormData({
        _id: initialData._id,
        badge: initialData.badge || "",
        sectionTitle: initialData.sectionTitle || "",
        sectionDescription: initialData.sectionDescription || "",
        items:
          initialData.items && initialData.items.length > 0
            ? initialData.items.map((it) => ({
                label: it.label || "",
                description: it.description || "",
                value:
                  it.value === null || it.value === undefined
                    ? ""
                    : String(it.value),
                valueSign: it.valueSign ?? "",
                icon: it.icon || "",
              }))
            : [emptyItem()],
        isActive: initialData.isActive !== false,
        isPublic: initialData.isPublic !== false,
      });
    } else {
      setFormData(emptyForm());
    }
  }, [initialData, open]);

  const updateItem = (index: number, patch: Partial<HighlightItemForm>) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((it, i) =>
        i === index ? { ...it, ...patch } : it
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const items = formData.items.filter((it) => it.label.trim() !== "");
    if (items.length === 0) {
      toast.error("Add at least one highlight card with a title.");
      return;
    }
    const badValue = items.find(
      (it) => it.value?.trim() && !Number.isFinite(Number(it.value))
    );
    if (badValue) {
      toast.error(`"${badValue.label}": value must be a number`);
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading(
      isEditing
        ? "Updating highlight section..."
        : "Creating highlight section..."
    );

    try {
      const payload = {
        badge: formData.badge?.trim() || "",
        sectionTitle: formData.sectionTitle?.trim() || "",
        sectionDescription: formData.sectionDescription?.trim() || "",
        isActive: formData.isActive,
        isPublic: formData.isPublic,
        items: items.map((it) => ({
          label: it.label.trim(),
          description: it.description?.trim() || "",
          value: it.value?.trim() ? Number(it.value) : null,
          valueSign: it.valueSign ?? "",
          icon: it.icon || "",
        })),
      };

      if (isEditing && formData._id) {
        await apiClient.patch(`/highlights/${formData._id}`, payload);
        toast.success("Highlight section updated successfully", {
          id: toastId,
        });
      } else {
        await apiClient.post("/highlights", payload);
        toast.success("Highlight section created successfully", {
          id: toastId,
        });
      }

      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      toast.error(
        Array.isArray(msg)
          ? msg.join(", ")
          : msg || "Failed to save highlight section",
        { id: toastId }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Highlight Section" : "Create Highlight Section"}
          </DialogTitle>
          <DialogDescription>
            Shown as the stats section on the website homepage.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Section header: badge -> title -> description */}
          <div className="space-y-1">
            <Label htmlFor="badge">Badge / Tagline</Label>
            <Input
              id="badge"
              placeholder="e.g. Wilderness Safety & Instruction"
              value={formData.badge}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, badge: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="sectionTitle">Section Title</Label>
            <Input
              id="sectionTitle"
              placeholder="e.g. Why Learn & Trek With Rope4?"
              value={formData.sectionTitle}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  sectionTitle: e.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="sectionDescription">Section Description</Label>
            <Textarea
              id="sectionDescription"
              rows={2}
              placeholder="Brief introductory paragraph..."
              value={formData.sectionDescription}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  sectionDescription: e.target.value,
                }))
              }
            />
          </div>

          {/* Cards */}
          <div className="space-y-3 pt-2 border-t">
            <div className="flex items-center justify-between">
              <Label className="font-semibold text-base">
                Highlight Cards / Stats
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    items: [...prev.items, emptyItem()],
                  }))
                }
                className="gap-1.5"
              >
                <Plus className="h-4 w-4" /> Add Card
              </Button>
            </div>

            {formData.items.map((item, idx) => {
              const PreviewIcon = item.icon
                ? HIGHLIGHT_ICONS[item.icon]?.Icon
                : undefined;
              const preview = formatHighlightValue(
                item.value?.trim() ? Number(item.value) : null,
                item.valueSign
              );
              return (
                <div
                  key={idx}
                  className="relative p-3.5 border rounded-lg bg-muted/20 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                      Card #{idx + 1}
                      {(PreviewIcon || preview) && (
                        <span className="inline-flex items-center gap-1 rounded bg-background px-1.5 py-0.5 text-foreground border">
                          {PreviewIcon && (
                            <PreviewIcon className="h-3.5 w-3.5 text-emerald-700" />
                          )}
                          {preview}
                        </span>
                      )}
                    </span>
                    {formData.items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            items: prev.items.filter((_, i) => i !== idx),
                          }))
                        }
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Label / Title *</Label>
                    <Input
                      placeholder="e.g. Alpine Experience"
                      value={item.label}
                      onChange={(e) =>
                        updateItem(idx, { label: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Description</Label>
                    <Textarea
                      rows={2}
                      placeholder="e.g. Led by NIM certified chief instructors & Himalayan summitteers."
                      value={item.description || ""}
                      onChange={(e) =>
                        updateItem(idx, { description: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Value</Label>
                      <Input
                        type="number"
                        inputMode="decimal"
                        step="any"
                        placeholder="e.g. 16"
                        value={item.value || ""}
                        onChange={(e) =>
                          updateItem(idx, { value: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Sign</Label>
                      <Select
                        value={item.valueSign ? item.valueSign : NONE}
                        onValueChange={(v) =>
                          updateItem(idx, { valueSign: v === NONE ? "" : v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sign" />
                        </SelectTrigger>
                        <SelectContent>
                          {HIGHLIGHT_VALUE_SIGNS.map((s) => (
                            <SelectItem
                              key={s.value || NONE}
                              value={s.value || NONE}
                            >
                              <span className="inline-flex items-center gap-2">
                                <span className="inline-flex h-5 min-w-[1.75rem] items-center justify-center rounded bg-muted px-1 font-mono text-xs font-bold">
                                  {s.value || "∅"}
                                </span>
                                {s.label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Icon</Label>
                      <Select
                        value={item.icon ? item.icon : NONE}
                        onValueChange={(v) =>
                          updateItem(idx, { icon: v === NONE ? "" : v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Icon" />
                        </SelectTrigger>
                        <SelectContent className="max-h-72">
                          <SelectItem value={NONE}>No icon</SelectItem>
                          {Object.entries(HIGHLIGHT_ICONS).map(
                            ([key, { label, Icon }]) => (
                              <SelectItem key={key} value={key}>
                                <span className="inline-flex items-center gap-2">
                                  <Icon className="h-4 w-4 text-emerald-700" />
                                  {label}
                                </span>
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-3 border-t">
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isActive: checked }))
                }
              />
              <Label htmlFor="isActive" className="text-sm cursor-pointer">
                Active
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isPublic"
                checked={formData.isPublic}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isPublic: checked }))
                }
              />
              <Label htmlFor="isPublic" className="text-sm cursor-pointer">
                Public (Website Visible)
              </Label>
            </div>
            <p className="w-full text-[11px] text-muted-foreground">
              The website shows a section only when it is both Active and
              Public.
            </p>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : isEditing
                  ? "Save Changes"
                  : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

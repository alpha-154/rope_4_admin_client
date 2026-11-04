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
import { Switch } from "@/components/ui/switch/switch";
import { Textarea } from "@/components/ui/textarea/textarea";
import { apiClient } from "@/lib/axios";
import { Plus, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

export interface HighlightItemForm {
  icon?: string;
  value?: string;
  label: string;
  sublabel?: string;
  richText?: string;
}

export interface HighlightFormData {
  _id?: string;
  sectionKey: string;
  slug: string;
  badge?: string;
  sectionTitle?: string;
  sectionDescription?: string;
  items: HighlightItemForm[];
  isActive?: boolean;
  isPublic?: boolean;
}

interface HighlightDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: HighlightFormData | null;
  onSuccess: () => void;
}

export function HighlightDialog({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}: HighlightDialogProps) {
  const isEditing = Boolean(initialData?._id);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<HighlightFormData>({
    sectionKey: "why-choose-us",
    slug: "why-choose-us",
    badge: "",
    sectionTitle: "",
    sectionDescription: "",
    items: [{ label: "", value: "", icon: "", sublabel: "" }],
    isActive: true,
    isPublic: true,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        _id: initialData._id,
        sectionKey: initialData.sectionKey || "",
        slug: initialData.slug || "",
        badge: initialData.badge || "",
        sectionTitle: initialData.sectionTitle || "",
        sectionDescription: initialData.sectionDescription || "",
        items:
          initialData.items && initialData.items.length > 0
            ? initialData.items
            : [{ label: "", value: "", icon: "", sublabel: "" }],
        isActive: initialData.isActive !== false,
        isPublic: initialData.isPublic !== false,
      });
    } else {
      setFormData({
        sectionKey: "why-choose-us",
        slug: "why-choose-us",
        badge: "",
        sectionTitle: "",
        sectionDescription: "",
        items: [{ label: "", value: "", icon: "", sublabel: "" }],
        isActive: true,
        isPublic: true,
      });
    }
  }, [initialData, open]);

  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { label: "", value: "", icon: "", sublabel: "" }],
    }));
  };

  const handleRemoveItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, idx) => idx !== index),
    }));
  };

  const handleItemChange = (
    index: number,
    field: keyof HighlightItemForm,
    val: string
  ) => {
    setFormData((prev) => {
      const updated = [...prev.items];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, items: updated };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.sectionKey.trim()) {
      toast.error("Section key is required");
      return;
    }
    if (!formData.slug.trim()) {
      toast.error("Slug is required");
      return;
    }

    const validItems = formData.items.filter((item) => item.label.trim() !== "");
    if (validItems.length === 0) {
      toast.error("Please add at least one highlight item with a label.");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading(
      isEditing ? "Updating highlight section..." : "Creating highlight section..."
    );

    try {
      const payload = {
        ...formData,
        items: validItems,
      };

      if (isEditing && formData._id) {
        await apiClient.patch(`/highlights/${formData._id}`, payload);
        toast.dismiss(toastId);
        toast.success("Highlight section updated successfully");
      } else {
        await apiClient.post("/highlights", payload);
        toast.dismiss(toastId);
        toast.success("Highlight section created successfully");
      }

      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      toast.dismiss(toastId);
      const msg = err.response?.data?.message || "Failed to save highlight section";
      toast.error(msg);
      console.error(err);
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
            Configure stats, feature cards, or award summaries for display on the website.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="sectionKey">Section Key *</Label>
              <Input
                id="sectionKey"
                placeholder="e.g. why-choose-us"
                value={formData.sectionKey}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    sectionKey: e.target.value,
                    slug: prev.slug || e.target.value.toLowerCase().replace(/\s+/g, "-"),
                  }))
                }
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                placeholder="e.g. why-choose-us"
                value={formData.slug}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, slug: e.target.value }))
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="badge">Badge / Tagline</Label>
              <Input
                id="badge"
                placeholder="e.g. Why Choose Us"
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
                placeholder="e.g. 16+ Years Leading Wilderness Expeditions"
                value={formData.sectionTitle}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, sectionTitle: e.target.value }))
                }
              />
            </div>
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

          {/* Items Repeater */}
          <div className="space-y-3 pt-2 border-t">
            <div className="flex items-center justify-between">
              <Label className="font-semibold text-base">Highlight Cards / Stats</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddItem}
                className="gap-1.5"
              >
                <Plus className="h-4 w-4" /> Add Item
              </Button>
            </div>

            {formData.items.map((item, idx) => (
              <div
                key={idx}
                className="relative p-3.5 border rounded-lg bg-muted/20 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">
                    Item #{idx + 1}
                  </span>
                  {formData.items.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive"
                      onClick={() => handleRemoveItem(idx)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Value / Metric (Optional)</Label>
                    <Input
                      placeholder="e.g. 500,000+ or 16+"
                      value={item.value || ""}
                      onChange={(e) => handleItemChange(idx, "value", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <Label className="text-xs">Label / Title *</Label>
                    <Input
                      placeholder="e.g. Trekkers Guided"
                      value={item.label}
                      onChange={(e) => handleItemChange(idx, "label", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Icon Name / Image URL</Label>
                    <Input
                      placeholder="e.g. award, compass, users"
                      value={item.icon || ""}
                      onChange={(e) => handleItemChange(idx, "icon", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Sublabel / Note</Label>
                    <Input
                      placeholder="e.g. Across 20 countries"
                      value={item.sublabel || ""}
                      onChange={(e) => handleItemChange(idx, "sublabel", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-6 pt-3 border-t">
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
              {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


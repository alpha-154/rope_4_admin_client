"use client";

import { UploadFiles } from "@/components/shared/upload-files";
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
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

export interface PopoverFormData {
  _id?: string;
  type: string;
  title: string;
  body: string;
  cta?: {
    label: string;
    url: string;
  };
  image?: string;
  pageTargeting: string;
  triggerDelay: number;
  displayFrequency: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
}

const POPOVER_TYPES = [
  { label: "Modal Popup (Centered Overlay)", value: "modal" },
  { label: "Side Floating Tab", value: "side-tab" },
  { label: "Help / Chat Bubble", value: "help-bubble" },
  { label: "Top Notification Banner", value: "banner" },
];

const FREQUENCIES = [
  { label: "Always (Every Page Visit)", value: "always" },
  { label: "Once Per Session", value: "once_per_session" },
  { label: "Once (Until Cleared)", value: "once" },
];

interface PopoverDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: PopoverFormData | null;
  onSuccess: () => void;
}

export function PopoverDialog({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}: PopoverDialogProps) {
  const isEditing = Boolean(initialData?._id);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<PopoverFormData>({
    type: "modal",
    title: "",
    body: "",
    cta: { label: "Explore Programs", url: "/programs" },
    image: "",
    pageTargeting: "all",
    triggerDelay: 3,
    displayFrequency: "always",
    startDate: "",
    endDate: "",
    isActive: true,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        _id: initialData._id,
        type: initialData.type || "modal",
        title: initialData.title || "",
        body: initialData.body || "",
        cta: initialData.cta || { label: "", url: "" },
        image: initialData.image || "",
        pageTargeting: initialData.pageTargeting || "all",
        triggerDelay: initialData.triggerDelay ?? 3,
        displayFrequency: initialData.displayFrequency || "always",
        startDate: initialData.startDate ? initialData.startDate.split("T")[0] : "",
        endDate: initialData.endDate ? initialData.endDate.split("T")[0] : "",
        isActive: initialData.isActive !== false,
      });
    } else {
      setFormData({
        type: "modal",
        title: "",
        body: "",
        cta: { label: "Explore Programs", url: "/programs" },
        image: "",
        pageTargeting: "all",
        triggerDelay: 3,
        displayFrequency: "always",
        startDate: "",
        endDate: "",
        isActive: true,
      });
    }
  }, [initialData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Widget title is required");
      return;
    }
    if (!formData.body.trim()) {
      toast.error("Widget body text is required");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading(
      isEditing ? "Updating popover..." : "Creating popover..."
    );

    try {
      const payload = {
        ...formData,
        triggerDelay: Number(formData.triggerDelay),
        startDate: formData.startDate ? new Date(formData.startDate) : undefined,
        endDate: formData.endDate ? new Date(formData.endDate) : undefined,
      };

      if (isEditing && formData._id) {
        await apiClient.patch(`/popovers/${formData._id}`, payload);
        toast.dismiss(toastId);
        toast.success("Popover updated successfully");
      } else {
        await apiClient.post("/popovers", payload);
        toast.dismiss(toastId);
        toast.success("Popover created successfully");
      }

      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.error(err.response?.data?.message || "Failed to save popover");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Popover Widget" : "Create Popover Widget"}
          </DialogTitle>
          <DialogDescription>
            Configure marketing modal popups, floating quick-tabs, or top alert banners.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="type">Widget Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(val) =>
                  setFormData((prev) => ({ ...prev, type: val }))
                }
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {POPOVER_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pageTargeting">Target Page *</Label>
              <Input
                id="pageTargeting"
                placeholder="all, home, programs, shop, /about"
                value={formData.pageTargeting}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, pageTargeting: e.target.value }))
                }
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="title">Headline / Title *</Label>
            <Input
              id="title"
              placeholder="e.g. Winter Treks 2026: Early Bird 15% OFF"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="body">Message Body *</Label>
            <Textarea
              id="body"
              rows={3}
              placeholder="Book your slot before seats fill up. Includes complete safety gear and certified guides."
              value={formData.body}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, body: e.target.value }))
              }
              required
            />
          </div>

          {/* CTA Settings */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
            <div className="space-y-1.5">
              <Label htmlFor="ctaLabel">CTA Button Label</Label>
              <Input
                id="ctaLabel"
                placeholder="e.g. Claim Discount"
                value={formData.cta?.label || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    cta: { ...prev.cta, label: e.target.value, url: prev.cta?.url || "" },
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ctaUrl">CTA Link URL</Label>
              <Input
                id="ctaUrl"
                placeholder="e.g. /programs?season=Winter"
                value={formData.cta?.url || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    cta: { label: prev.cta?.label || "", url: e.target.value },
                  }))
                }
              />
            </div>
          </div>

          {/* Timing & Frequency */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
            <div className="space-y-1.5">
              <Label htmlFor="triggerDelay">Trigger Delay (Seconds)</Label>
              <Input
                id="triggerDelay"
                type="number"
                min="0"
                value={formData.triggerDelay}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    triggerDelay: Number(e.target.value),
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="displayFrequency">Display Frequency</Label>
              <Select
                value={formData.displayFrequency}
                onValueChange={(val) =>
                  setFormData((prev) => ({ ...prev, displayFrequency: val }))
                }
              >
                <SelectTrigger id="displayFrequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FREQUENCIES.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Scheduled Active Dates */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
            <div className="space-y-1.5">
              <Label htmlFor="startDate">Start Date (Optional)</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, startDate: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="endDate">End Date (Optional)</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, endDate: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t">
            <Label>Graphic / Image (Optional)</Label>
            <UploadFiles
              value={formData.image || ""}
              onChange={(url) =>
                setFormData((prev) => ({
                  ...prev,
                  image: Array.isArray(url) ? url[0] : url,
                }))
              }
              folder="popovers"
            />
          </div>

          <div className="flex items-center space-x-2 pt-2 border-t">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, isActive: checked }))
              }
            />
            <Label htmlFor="isActive" className="cursor-pointer text-sm">
              Active (Display to Site Visitors)
            </Label>
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
              {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Create Popover"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

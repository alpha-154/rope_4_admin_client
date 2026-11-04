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

export interface FaqItemForm {
  question: string;
  answer: string;
}

export interface FaqFormData {
  _id?: string;
  category: string;
  slug: string;
  index?: string;
  faqs: FaqItemForm[];
  isActive?: boolean;
}

interface FaqDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: FaqFormData | null;
  onSuccess: () => void;
}

export function FaqDialog({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}: FaqDialogProps) {
  const isEditing = Boolean(initialData?._id);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<FaqFormData>({
    category: "",
    slug: "",
    faqs: [{ question: "", answer: "" }],
    isActive: true,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        _id: initialData._id,
        category: initialData.category || "",
        slug: initialData.slug || "",
        faqs:
          initialData.faqs && initialData.faqs.length > 0
            ? initialData.faqs
            : [{ question: "", answer: "" }],
        isActive: initialData.isActive !== false,
      });
    } else {
      setFormData({
        category: "",
        slug: "",
        faqs: [{ question: "", answer: "" }],
        isActive: true,
      });
    }
  }, [initialData, open]);

  const handleAddFaq = () => {
    setFormData((prev) => ({
      ...prev,
      faqs: [...prev.faqs, { question: "", answer: "" }],
    }));
  };

  const handleRemoveFaq = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((_, idx) => idx !== index),
    }));
  };

  const handleFaqChange = (
    index: number,
    field: keyof FaqItemForm,
    val: string
  ) => {
    setFormData((prev) => {
      const updated = [...prev.faqs];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, faqs: updated };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.category.trim()) {
      toast.error("Category name is required");
      return;
    }

    const validFaqs = formData.faqs.filter(
      (item) => item.question.trim() !== "" && item.answer.trim() !== ""
    );

    if (validFaqs.length === 0) {
      toast.error("Please add at least one complete Question and Answer item.");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading(
      isEditing ? "Updating FAQ category..." : "Creating FAQ category..."
    );

    try {
      const {
        _id,
        id,
        organizationId,
        createdAt,
        updatedAt,
        __v,
        index,
        ...cleanData
      } = formData as any;

      const payload = {
        ...cleanData,
        faqs: validFaqs.map((f: any) => {
          const { _id: _fId, id: _fId2, ...fRest } = f;
          return fRest;
        }),
      };

      if (isEditing && formData._id) {
        await apiClient.patch(`/faqs/${formData._id}`, payload);
        toast.dismiss(toastId);
        toast.success("FAQ category updated successfully");
      } else {
        await apiClient.post("/faqs", payload);
        toast.dismiss(toastId);
        toast.success("FAQ category created successfully");
      }

      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      toast.dismiss(toastId);
      const msg = err.response?.data?.message || "Failed to save FAQ category";
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
            {isEditing ? "Edit FAQ Category" : "Create FAQ Category"}
          </DialogTitle>
          <DialogDescription>
            Group questions by topic (e.g. Beginners Guide, Booking & Cancellation, Fitness & Medical).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="category">Category Name *</Label>
              <Input
                id="category"
                placeholder="e.g. Beginners Guide"
                value={formData.category}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    category: e.target.value,
                    slug: prev.slug || e.target.value.toLowerCase().replace(/\s+/g, "-"),
                  }))
                }
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="slug">Slug (Optional)</Label>
              <Input
                id="slug"
                placeholder="e.g. beginners-guide"
                value={formData.slug}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, slug: e.target.value }))
                }
              />
            </div>
          </div>

          {/* Q&A Items Repeater */}
          <div className="space-y-3 pt-2 border-t">
            <div className="flex items-center justify-between">
              <Label className="font-semibold text-base">Questions & Answers</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddFaq}
                className="gap-1.5"
              >
                <Plus className="h-4 w-4" /> Add Question
              </Button>
            </div>

            {formData.faqs.map((faq, idx) => (
              <div
                key={idx}
                className="relative p-3.5 border rounded-lg bg-muted/20 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">
                    Question #{idx + 1}
                  </span>
                  {formData.faqs.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive"
                      onClick={() => handleRemoveFaq(idx)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Question *</Label>
                  <Input
                    placeholder="e.g. What fitness level is required for high altitude treks?"
                    value={faq.question}
                    onChange={(e) => handleFaqChange(idx, "question", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Answer *</Label>
                  <Textarea
                    rows={3}
                    placeholder="Clear and detailed explanation for prospective adventurers..."
                    value={faq.answer}
                    onChange={(e) => handleFaqChange(idx, "answer", e.target.value)}
                    required
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center space-x-2 pt-3 border-t">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, isActive: checked }))
              }
            />
            <Label htmlFor="isActive" className="text-sm cursor-pointer">
              Active (Visible on Website)
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
              {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


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
import { Loader2, Plus, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

interface FormDefinitionDialogProps {
  form: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function FormDefinitionDialog({
  form,
  open,
  onOpenChange,
  onSuccess,
}: FormDefinitionDialogProps) {
  const isEditing = Boolean(form?._id);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<any>({
    name: "",
    slug: "",
    description: "",
    notificationEmails: "support@rope4.org",
    confirmationSubject: "We received your message - Rope4",
    confirmationMessage: "Thank you for reaching out! We will contact you soon.",
    isActive: true,
    fields: [
      {
        name: "fullName",
        label: "Full Name",
        type: "text",
        placeholder: "Your Name",
        required: true,
      },
      {
        name: "email",
        label: "Email Address",
        type: "email",
        placeholder: "you@example.com",
        required: true,
      },
      {
        name: "message",
        label: "Message",
        type: "textarea",
        placeholder: "Your inquiry...",
        required: true,
      },
    ],
  });

  useEffect(() => {
    if (form) {
      setFormData({
        name: form.name || "",
        slug: form.slug || "",
        description: form.description || "",
        notificationEmails: Array.isArray(form.notificationEmails)
          ? form.notificationEmails.join(", ")
          : form.notificationEmails || "",
        confirmationSubject: form.confirmationSubject || "",
        confirmationMessage: form.confirmationMessage || "",
        isActive: form.isActive !== undefined ? form.isActive : true,
        fields: form.fields || [],
      });
    } else {
      setFormData({
        name: "",
        slug: "",
        description: "",
        notificationEmails: "support@rope4.org",
        confirmationSubject: "We received your message - Rope4",
        confirmationMessage: "Thank you for reaching out! We will contact you soon.",
        isActive: true,
        fields: [
          {
            name: "fullName",
            label: "Full Name",
            type: "text",
            placeholder: "Your Name",
            required: true,
          },
          {
            name: "email",
            label: "Email Address",
            type: "email",
            placeholder: "you@example.com",
            required: true,
          },
          {
            name: "message",
            label: "Message",
            type: "textarea",
            placeholder: "Your inquiry...",
            required: true,
          },
        ],
      });
    }
  }, [form, open]);

  const addField = () => {
    setFormData((prev: any) => ({
      ...prev,
      fields: [
        ...prev.fields,
        {
          name: `field_${Date.now().toString().slice(-4)}`,
          label: "New Field",
          type: "text",
          placeholder: "",
          required: false,
          options: [],
        },
      ],
    }));
  };

  const removeField = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      fields: prev.fields.filter((_: any, i: number) => i !== index),
    }));
  };

  const updateField = (index: number, updates: any) => {
    setFormData((prev: any) => {
      const updated = [...prev.fields];
      updated[index] = { ...updated[index], ...updates };
      return { ...prev, fields: updated };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Form name is required");
      return;
    }
    if (formData.fields.length === 0) {
      toast.error("Please add at least one form field");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading(isEditing ? "Updating form..." : "Creating form...");

    try {
      const emailList = formData.notificationEmails
        .split(",")
        .map((e: string) => e.trim())
        .filter((e: string) => e.length > 0);

      const cleanFields = formData.fields.map((f: any, idx: number) => {
        const { _id, id, ...fRest } = f;
        return {
          ...fRest,
          order: idx + 1,
          name: fRest.name.trim().replace(/[^a-zA-Z0-9_]/g, "_"),
          options: Array.isArray(fRest.options)
            ? fRest.options
            : typeof fRest.options === "string"
            ? fRest.options.split(",").map((o: string) => o.trim()).filter((o: string) => o.length > 0)
            : [],
        };
      });

      const payload = {
        name: formData.name.trim(),
        slug: formData.slug ? formData.slug.trim().toLowerCase() : undefined,
        description: formData.description,
        notificationEmails: emailList,
        confirmationSubject: formData.confirmationSubject,
        confirmationMessage: formData.confirmationMessage,
        isActive: formData.isActive,
        fields: cleanFields,
      };

      if (isEditing && form._id) {
        await apiClient.patch(`/admin/forms/${form._id}`, payload);
        toast.dismiss(toastId);
        toast.success("Form definition updated successfully");
      } else {
        await apiClient.post("/admin/forms", payload);
        toast.dismiss(toastId);
        toast.success("Form definition created successfully");
      }

      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.error(err.response?.data?.message || "Failed to save form definition");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Form Definition" : "Create New Inquiry Form"}
            </DialogTitle>
            <DialogDescription>
              Configure dynamic fields, required validations, and staff email notifications.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Form Title</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Expedition Inquiry"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Form Slug (URL Key)</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="e.g. trek-inquiry"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description / Usage Note</Label>
              <Input
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Where this form is embedded on the site"
              />
            </div>

            <div className="space-y-2">
              <Label>Staff Notification Emails (Comma separated)</Label>
              <Input
                value={formData.notificationEmails}
                onChange={(e) =>
                  setFormData({ ...formData, notificationEmails: e.target.value })
                }
                placeholder="expeditions@rope4.org, support@rope4.org"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Auto-Reply Email Subject</Label>
                <Input
                  value={formData.confirmationSubject}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmationSubject: e.target.value })
                  }
                  placeholder="We received your request - Rope4"
                />
              </div>
              <div className="flex items-center justify-between pt-6">
                <div>
                  <Label>Form Active Status</Label>
                  <p className="text-xs text-muted-foreground">Accept submissions</p>
                </div>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Customer Confirmation Message</Label>
              <Textarea
                rows={2}
                value={formData.confirmationMessage}
                onChange={(e) =>
                  setFormData({ ...formData, confirmationMessage: e.target.value })
                }
                placeholder="Message displayed and emailed to traveler upon submission..."
              />
            </div>

            {/* Dynamic Fields Repeater */}
            <div className="space-y-3 pt-3 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-semibold">Form Fields ({formData.fields.length})</Label>
                  <p className="text-xs text-muted-foreground">Customize inputs presented to visitors.</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addField} className="gap-1">
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Field</span>
                </Button>
              </div>

              <div className="space-y-3">
                {formData.fields.map((field: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border border-border bg-muted/20 space-y-3"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
                      <div className="sm:col-span-2 space-y-1">
                        <Label className="text-xs">Field Label</Label>
                        <Input
                          value={field.label}
                          onChange={(e) => updateField(idx, { label: e.target.value })}
                          placeholder="e.g. Target Trek"
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Field Type</Label>
                        <Select
                          value={field.type}
                          onValueChange={(val) => updateField(idx, { type: val })}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Text</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="tel">Phone</SelectItem>
                            <SelectItem value="textarea">Textarea</SelectItem>
                            <SelectItem value="select">Dropdown Select</SelectItem>
                            <SelectItem value="number">Number</SelectItem>
                            <SelectItem value="date">Date</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between pt-4">
                        <div className="flex items-center gap-1.5">
                          <Switch
                            checked={field.required}
                            onCheckedChange={(checked) =>
                              updateField(idx, { required: checked })
                            }
                          />
                          <Label className="text-xs">Required</Label>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeField(idx)}
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {field.type === "select" && (
                      <div className="space-y-1 pt-1">
                        <Label className="text-[11px] text-muted-foreground">
                          Dropdown Options (Comma separated)
                        </Label>
                        <Input
                          value={
                            Array.isArray(field.options)
                              ? field.options.join(", ")
                              : field.options || ""
                          }
                          onChange={(e) => updateField(idx, { options: e.target.value })}
                          placeholder="Option 1, Option 2, Option 3"
                          className="h-8 text-xs"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>{isEditing ? "Save Changes" : "Create Form"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


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
import { Star } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

export interface ReviewFormData {
  _id?: string;
  author: string;
  avatar?: string;
  rating: number;
  date?: string;
  text: string;
  source: string;
  videoUrl?: string;
  programTitle?: string;
  isFeatured?: boolean;
  status: string;
}

const SOURCES = [
  { label: "Google Reviews", value: "google" },
  { label: "Video Review", value: "video" },
  { label: "Award / Accolade", value: "award" },
  { label: "Trusted By / Partner", value: "trusted-by" },
  { label: "Ambassador", value: "ambassador" },
];

interface ReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: ReviewFormData | null;
  onSuccess: () => void;
}

export function ReviewDialog({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}: ReviewDialogProps) {
  const isEditing = Boolean(initialData?._id);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<ReviewFormData>({
    author: "",
    avatar: "",
    rating: 5,
    text: "",
    source: "google",
    videoUrl: "",
    programTitle: "",
    isFeatured: false,
    status: "approved",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        _id: initialData._id,
        author: initialData.author || "",
        avatar: initialData.avatar || "",
        rating: initialData.rating || 5,
        text: initialData.text || "",
        source: initialData.source || "google",
        videoUrl: initialData.videoUrl || "",
        programTitle: initialData.programTitle || "",
        isFeatured: Boolean(initialData.isFeatured),
        status: initialData.status || "approved",
      });
    } else {
      setFormData({
        author: "",
        avatar: "",
        rating: 5,
        text: "",
        source: "google",
        videoUrl: "",
        programTitle: "",
        isFeatured: false,
        status: "approved",
      });
    }
  }, [initialData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.author.trim()) {
      toast.error("Author name is required");
      return;
    }
    if (!formData.text.trim()) {
      toast.error("Review content is required");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading(
      isEditing ? "Updating review..." : "Adding review..."
    );

    try {
      if (isEditing && formData._id) {
        await apiClient.patch(`/reviews/${formData._id}`, formData);
        toast.dismiss(toastId);
        toast.success("Review updated successfully");
      } else {
        await apiClient.post("/reviews", formData);
        toast.dismiss(toastId);
        toast.success("Review created successfully");
      }

      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.error(err.response?.data?.message || "Failed to save review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Review" : "Add Review / Testimonial"}</DialogTitle>
          <DialogDescription>
            Curate traveler feedback, Google ratings, awards, or video testimonials.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="author">Author Name *</Label>
              <Input
                id="author"
                placeholder="e.g. Sarah Jenkins"
                value={formData.author}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, author: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="source">Source *</Label>
              <Select
                value={formData.source}
                onValueChange={(val) =>
                  setFormData((prev) => ({ ...prev, source: val }))
                }
              >
                <SelectTrigger id="source">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SOURCES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Star Rating *</Label>
              <div className="flex items-center gap-1 pt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, rating: star }))
                    }
                    className="p-1 text-muted-foreground hover:text-amber-500 focus:outline-none transition-colors"
                  >
                    <Star
                      className={`h-5 w-5 ${
                        star <= formData.rating
                          ? "fill-amber-400 text-amber-500"
                          : "text-muted-foreground/40"
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs text-muted-foreground ml-2">
                  {formData.rating} out of 5
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="status">Approval Status</Label>
              <Select
                value={formData.status}
                onValueChange={(val) =>
                  setFormData((prev) => ({ ...prev, status: val }))
                }
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="programTitle">Related Adventure Program (Optional)</Label>
            <Input
              id="programTitle"
              placeholder="e.g. Kedarkantha Winter Summit Trek"
              value={formData.programTitle || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, programTitle: e.target.value }))
              }
            />
          </div>

          {formData.source === "video" && (
            <div className="space-y-1.5">
              <Label htmlFor="videoUrl">Video URL (YouTube / Vimeo)</Label>
              <Input
                id="videoUrl"
                placeholder="https://www.youtube.com/watch?v=..."
                value={formData.videoUrl || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, videoUrl: e.target.value }))
                }
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="text">Review Content / Quote *</Label>
            <Textarea
              id="text"
              rows={4}
              placeholder="What did the trekker say about their experience with Rope4?"
              value={formData.text}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, text: e.target.value }))
              }
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label>Author Avatar / Photo</Label>
            <UploadFiles
              value={formData.avatar || ""}
              onChange={(url) =>
                setFormData((prev) => ({
                  ...prev,
                  avatar: Array.isArray(url) ? url[0] : url,
                }))
              }
              folder="reviews/avatars"
            />
          </div>

          <div className="flex items-center space-x-2 pt-2 border-t">
            <Switch
              id="isFeatured"
              checked={formData.isFeatured}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, isFeatured: checked }))
              }
            />
            <Label htmlFor="isFeatured" className="cursor-pointer text-sm">
              Featured on Homepage Testimonials
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
              {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Save Review"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

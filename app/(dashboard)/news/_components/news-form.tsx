"use client";

import { TipTapEditor } from "@/components/shared/tiptap-editor";
import { UploadFiles } from "@/components/shared/upload-files";
import { Button } from "@/components/ui/button/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card/card";
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
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";

export interface NewsFormData {
  _id?: string;
  type: string;
  title: string;
  slug: string;
  cover: string;
  excerpt: string;
  content: string;
  videoUrl?: string;
  tags: string[];
  publishedAt?: string;
  isFeatured: boolean;
  status: string;
  seo?: {
    title?: string;
    description?: string;
    ogImage?: string;
  };
}

const defaultNewsData: NewsFormData = {
  type: "article",
  title: "",
  slug: "",
  cover: "",
  excerpt: "",
  content: "",
  videoUrl: "",
  tags: ["mountaineering", "guide"],
  publishedAt: new Date().toISOString().split("T")[0],
  isFeatured: false,
  status: "draft",
  seo: {
    title: "",
    description: "",
  },
};

interface NewsFormProps {
  initialData?: NewsFormData;
  isEditing?: boolean;
}

export function NewsForm({ initialData, isEditing = false }: NewsFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<NewsFormData>(
    initialData ? { ...defaultNewsData, ...initialData } : defaultNewsData
  );
  const [tagsInput, setTagsInput] = useState<string>(
    initialData?.tags?.join(", ") || "mountaineering, guide"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Article title is required");
      return;
    }
    if (!formData.excerpt.trim()) {
      toast.error("Summary excerpt is required");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading(
      isEditing ? "Updating story..." : "Publishing story..."
    );

    try {
      const parsedTags = tagsInput
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0);

      const {
        _id,
        id,
        organizationId,
        createdAt,
        updatedAt,
        __v,
        ...cleanData
      } = formData as any;

      const payload = {
        ...cleanData,
        tags: parsedTags,
      };

      if (isEditing && formData._id) {
        await apiClient.patch(`/news/${formData._id}`, payload);
        toast.dismiss(toastId);
        toast.success("Article updated successfully");
      } else {
        await apiClient.post("/news", payload);
        toast.dismiss(toastId);
        toast.success("Article published successfully");
      }

      router.push("/news");
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.error(err.response?.data?.message || "Failed to save article");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEditing ? `Edit: ${formData.title || "Story"}` : "Write Article or Update"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Share trek dispatches, educational guides, gear reviews, and video stories.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/news")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="gap-2">
            <Save className="h-4 w-4" />
            {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Publish Story"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content (2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Article Details</CardTitle>
              <CardDescription>Primary headline, slug, and content body.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="title">Headline / Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g. 5 Critical Winter Survival Lessons from Himalayan Summits"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      title: e.target.value,
                      slug: prev.slug || e.target.value.toLowerCase().replace(/\s+/g, "-"),
                    }))
                  }
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="slug">URL Slug *</Label>
                <Input
                  id="slug"
                  placeholder="e.g. 5-critical-winter-survival-lessons"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, slug: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="excerpt">Excerpt / Subtitle *</Label>
                <Textarea
                  id="excerpt"
                  rows={2}
                  placeholder="A short punchy teaser that appears in search and card feeds..."
                  value={formData.excerpt}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, excerpt: e.target.value }))
                  }
                  required
                />
              </div>

              {formData.type === "video" && (
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
                <Label>Full Content Body (Rich Text)</Label>
                <TipTapEditor
                  value={formData.content}
                  onChange={(html) =>
                    setFormData((prev) => ({ ...prev, content: html }))
                  }
                  minHeight="320px"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Settings (1 Column) */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Publication Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="type">Content Type</Label>
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
                    <SelectItem value="article">Long-form Article</SelectItem>
                    <SelectItem value="update">Field Update / Notice</SelectItem>
                    <SelectItem value="video">Video Story</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="status">Status</Label>
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
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="publishedAt">Publication Date</Label>
                <Input
                  id="publishedAt"
                  type="date"
                  value={formData.publishedAt ? formData.publishedAt.split("T")[0] : ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, publishedAt: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  placeholder="winter, gear, himalayas"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
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
                  Featured Story (Homepage Carousel)
                </Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cover Image</CardTitle>
            </CardHeader>
            <CardContent>
              <UploadFiles
                value={formData.cover || ""}
                onChange={(url) =>
                  setFormData((prev) => ({
                    ...prev,
                    cover: Array.isArray(url) ? url[0] : url,
                  }))
                }
                folder="news/covers"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}


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
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { ProductData } from "./columns";

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: ProductData | null;
  onSuccess: () => void;
}

const CATEGORIES = [
  "Apparel",
  "Footwear",
  "Climbing Gear",
  "Camping & Backpacking",
  "Accessories",
  "Navigation & Safety",
  "Other",
];

export function ProductDialog({
  open,
  onOpenChange,
  product,
  onSuccess,
}: ProductDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    sku: "",
    category: "Camping & Backpacking",
    brand: "Rope4",
    price: 0,
    compareAtPrice: 0,
    costPrice: 0,
    stockQuantity: 10,
    lowStockThreshold: 5,
    shortDescription: "",
    description: "",
    images: [] as string[],
    isPublished: true,
    isFeatured: false,
  });

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title || "",
        sku: product.sku || "",
        category: product.category || "Camping & Backpacking",
        brand: product.brand || "Rope4",
        price: product.price || 0,
        compareAtPrice: product.compareAtPrice || 0,
        costPrice: 0,
        stockQuantity: product.stockQuantity ?? 10,
        lowStockThreshold: product.lowStockThreshold ?? 5,
        shortDescription: (product as any).shortDescription || "",
        description: (product as any).description || "",
        images: product.images || [],
        isPublished: product.isPublished ?? true,
        isFeatured: product.isFeatured ?? false,
      });
    } else {
      setFormData({
        title: "",
        sku: `R4-GEAR-${Math.floor(100 + Math.random() * 900)}`,
        category: "Camping & Backpacking",
        brand: "Rope4",
        price: 2500,
        compareAtPrice: 0,
        costPrice: 0,
        stockQuantity: 15,
        lowStockThreshold: 5,
        shortDescription: "",
        description: "",
        images: [],
        isPublished: true,
        isFeatured: false,
      });
    }
  }, [product, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Product title is required");
      return;
    }
    if (!formData.sku.trim()) {
      toast.error("Product SKU is required");
      return;
    }
    if (formData.price < 0) {
      toast.error("Price must be 0 or greater");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Record<string, any> = {
        title: formData.title.trim(),
        sku: formData.sku.trim().toUpperCase(),
        category: formData.category,
        brand: formData.brand.trim() || "Rope4",
        price: Number(formData.price),
        compareAtPrice:
          formData.compareAtPrice > 0 ? Number(formData.compareAtPrice) : null,
        costPrice: formData.costPrice > 0 ? Number(formData.costPrice) : null,
        stockQuantity: Number(formData.stockQuantity),
        lowStockThreshold: Number(formData.lowStockThreshold),
        shortDescription: formData.shortDescription.trim(),
        description: formData.description.trim(),
        images: formData.images,
        isPublished: formData.isPublished,
        isFeatured: formData.isFeatured,
      };

      if (product) {
        await apiClient.patch(`/admin/products/${product._id}`, payload);
        toast.success("Product updated successfully");
      } else {
        await apiClient.post("/admin/products", payload);
        toast.success("Product created successfully");
      }

      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? "Edit Gear Product" : "Add New Gear Product"}
          </DialogTitle>
          <DialogDescription>
            Configure product catalog details, pricing, inventory stock, and media images.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title & SKU */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="title">Product Title *</Label>
              <Input
                id="title"
                required
                placeholder="e.g. Alpine Pro Technical Backpack 45L"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sku">SKU Code *</Label>
              <Input
                id="sku"
                required
                className="font-mono uppercase"
                placeholder="e.g. R4-BPK-45L"
                value={formData.sku}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, sku: e.target.value }))
                }
              />
            </div>
          </div>

          {/* Category & Brand */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(val) =>
                  setFormData((prev) => ({ ...prev, category: val }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                placeholder="e.g. Rope4, Petzl, Black Diamond"
                value={formData.brand}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, brand: e.target.value }))
                }
              />
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-muted/40 p-3.5 rounded-lg border">
            <div className="space-y-1.5">
              <Label htmlFor="price">Price (BDT) *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                required
                value={formData.price}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    price: Number(e.target.value),
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="comparePrice">Compare Price</Label>
              <Input
                id="comparePrice"
                type="number"
                min="0"
                placeholder="Strike price"
                value={formData.compareAtPrice || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    compareAtPrice: Number(e.target.value),
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="stock">Initial Stock *</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                required
                value={formData.stockQuantity}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    stockQuantity: Number(e.target.value),
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lowThreshold">Low Alert Stock</Label>
              <Input
                id="lowThreshold"
                type="number"
                min="0"
                value={formData.lowStockThreshold}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    lowStockThreshold: Number(e.target.value),
                  }))
                }
              />
            </div>
          </div>

          {/* Product Images Upload */}
          <div className="space-y-1.5">
            <Label>Product Gallery Images</Label>
            <UploadFiles
              value={formData.images}
              onChange={(urls) =>
                setFormData((prev) => ({
                  ...prev,
                  images: Array.isArray(urls) ? urls : [urls],
                }))
              }
              multiple
              folder="products"
            />
          </div>

          {/* Short Description */}
          <div className="space-y-1.5">
            <Label htmlFor="shortDesc">Brief Summary / Headline</Label>
            <Input
              id="shortDesc"
              placeholder="e.g. Ultralight weatherproof 45L pack with ergonomic hip support"
              value={formData.shortDescription}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  shortDescription: e.target.value,
                }))
              }
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="desc">Full Description & Specifications</Label>
            <Textarea
              id="desc"
              rows={4}
              placeholder="Technical specs, material composition, volume, recommended usage..."
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
            />
          </div>

          {/* Published & Featured Toggles */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-3">
              <Switch
                id="isPublished"
                checked={formData.isPublished}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isPublished: checked }))
                }
              />
              <Label htmlFor="isPublished" className="cursor-pointer text-sm">
                Publish to Gear Store
              </Label>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="isFeatured"
                checked={formData.isFeatured}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isFeatured: checked }))
                }
              />
              <Label htmlFor="isFeatured" className="cursor-pointer text-sm">
                Featured Product
              </Label>
            </div>
          </div>

          <DialogFooter className="pt-4">
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
              <span>{product ? "Save Changes" : "Create Product"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

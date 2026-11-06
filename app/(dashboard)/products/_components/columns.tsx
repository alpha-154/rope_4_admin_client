"use client";

import { Badge } from "@/components/ui/badge/badge";
import { Button } from "@/components/ui/button/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/drop-down/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { Edit2, MoreHorizontal, Package, Trash2 } from "lucide-react";
import React from "react";

export interface ProductData {
  _id: string;
  title: string;
  slug: string;
  sku: string;
  category: string;
  brand: string;
  price: number;
  compareAtPrice?: number;
  stockQuantity: number;
  lowStockThreshold: number;
  images: string[];
  isPublished: boolean;
  isFeatured: boolean;
  createdAt: string;
}

export function getProductColumns(
  onEdit: (product: ProductData) => void,
  onDelete: (id: string) => void
): ColumnDef<any>[] {
  return [
    {
      accessorKey: "images",
      header: "Product",
      cell: ({ row }) => {
        const product = row.original;
        const mainImage = product.images?.[0];

        return (
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden border shrink-0">
              {mainImage ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={mainImage}
                  alt={product.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Package className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div className="max-w-[220px]">
              <div className="font-semibold text-sm truncate text-foreground">
                {product.title}
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-2">
                <span className="font-mono">{product.sku}</span>
                <span>•</span>
                <span>{product.brand}</span>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <Badge variant="outline" className="font-medium text-xs">
          {row.original.category}
        </Badge>
      ),
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => {
        const { price, compareAtPrice } = row.original;
        return (
          <div className="space-y-0.5">
            <div className="font-semibold text-sm">
              {price.toLocaleString()} BDT
            </div>
            {compareAtPrice && compareAtPrice > price && (
              <div className="text-xs text-muted-foreground line-through">
                {compareAtPrice.toLocaleString()} BDT
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "stockQuantity",
      header: "Inventory",
      cell: ({ row }) => {
        const { stockQuantity, lowStockThreshold } = row.original;
        if (stockQuantity <= 0) {
          return (
            <Badge variant="destructive" className="font-medium text-xs">
              Out of Stock (0)
            </Badge>
          );
        }
        if (stockQuantity <= lowStockThreshold) {
          return (
            <Badge
              variant="outline"
              className="bg-amber-500/15 text-amber-700 border-amber-300 font-medium text-xs"
            >
              Low Stock ({stockQuantity})
            </Badge>
          );
        }
        return (
          <Badge
            variant="outline"
            className="bg-emerald-500/15 text-emerald-700 border-emerald-300 font-medium text-xs"
          >
            In Stock ({stockQuantity})
          </Badge>
        );
      },
    },
    {
      accessorKey: "isPublished",
      header: "Status",
      cell: ({ row }) => {
        const isPublished = row.original.isPublished;
        return (
          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                isPublished ? "bg-emerald-500" : "bg-muted-foreground"
              }`}
            />
            <span className="text-xs font-medium">
              {isPublished ? "Published" : "Draft"}
            </span>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={() => onEdit(product)}
                className="cursor-pointer gap-2"
              >
                <Edit2 className="h-4 w-4 text-primary" />
                <span>Edit Product</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(product._id)}
                className="cursor-pointer gap-2 text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}

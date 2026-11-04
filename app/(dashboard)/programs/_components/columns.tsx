"use client";

import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header";
import { DeleteAlert } from "@/components/shared/delete-alert";
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
import { ExternalLink, MoreHorizontal, Pencil, Sparkles, Trash } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { ProgramFormData } from "./program-form";

export const getProgramColumns = (
  onDelete: (id: string) => void
): ColumnDef<ProgramFormData>[] => [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Program / Trek" />
    ),
    cell: ({ row }) => {
      const item = row.original;
      const heroImage = item.heroImages?.[0] || item.gallery?.[0];
      const baseApi = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
      const origin = baseApi.replace(/\/api\/v1\/?$/, "");
      const fullUrl = heroImage
        ? heroImage.startsWith("http")
          ? heroImage
          : `${origin}${heroImage.startsWith("/") ? "" : "/"}${heroImage}`
        : null;

      return (
        <div className="flex items-center gap-3 py-1">
          <div className="relative h-12 w-16 shrink-0 rounded overflow-hidden bg-muted border">
            {fullUrl ? (
              <Image
                src={fullUrl}
                alt={item.title}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-[10px] text-muted-foreground font-medium">
                No image
              </div>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <Link
              href={`/programs/edit/${item._id}`}
              className="font-semibold text-sm hover:underline truncate text-foreground"
            >
              {item.title}
            </Link>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
              <span>{item.category}</span>
              <span>•</span>
              <span>{item.region}, {item.country}</span>
              {item.isFeatured && (
                <span className="flex items-center gap-0.5 text-amber-600 font-medium ml-1">
                  <Sparkles className="h-3 w-3" /> Featured
                </span>
              )}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "duration",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Duration & Grade" />
    ),
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="flex flex-col text-xs">
          <span className="font-medium text-foreground">{item.duration} Days</span>
          <span className="text-muted-foreground">{item.difficulty}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "price",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Price" />
    ),
    cell: ({ row }) => {
      const price = row.original.price;
      return (
        <div className="flex flex-col text-xs">
          <span className="font-semibold text-foreground">
            {price.currency} {price.amount?.toLocaleString()}
          </span>
          {price.taxNote && (
            <span className="text-muted-foreground">{price.taxNote}</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "departures",
    header: "Batches",
    cell: ({ row }) => {
      const count = row.original.departures?.length || 0;
      return (
        <Badge variant="outline" className="font-normal text-xs">
          {count} departure{count !== 1 ? "s" : ""}
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status");
      if (status === "published") {
        return (
          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20">
            Published
          </Badge>
        );
      }
      if (status === "archived") {
        return <Badge variant="secondary">Archived</Badge>;
      }
      return (
        <Badge variant="outline" className="text-amber-600 border-amber-300">
          Draft
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const item = row.original;
      const websiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:3000";

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/programs/edit/${item._id}`} className="gap-2">
                <Pencil className="h-3.5 w-3.5" /> Edit Program
              </Link>
            </DropdownMenuItem>
            {item.status === "published" && (
              <DropdownMenuItem asChild>
                <a
                  href={`${websiteUrl}/programs/${item.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gap-2"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> View on Website
                </a>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DeleteAlert onConfirm={() => onDelete(item._id!)}>
              <DropdownMenuItem
                onSelect={(e) => e.preventDefault()}
                className="text-destructive gap-2"
              >
                <Trash className="h-3.5 w-3.5" /> Delete
              </DropdownMenuItem>
            </DeleteAlert>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

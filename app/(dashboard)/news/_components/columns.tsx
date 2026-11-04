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
import { NewsFormData } from "./news-form";

export const getNewsColumns = (
  onDelete: (id: string) => void
): ColumnDef<NewsFormData>[] => [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Headline & Details" />
    ),
    cell: ({ row }) => {
      const item = row.original;
      const baseApi = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
      const origin = baseApi.replace(/\/api\/v1\/?$/, "");
      const fullCover = item.cover
        ? item.cover.startsWith("http")
          ? item.cover
          : `${origin}${item.cover.startsWith("/") ? "" : "/"}${item.cover}`
        : null;

      return (
        <div className="flex items-center gap-3 py-1">
          <div className="relative h-12 w-16 shrink-0 rounded overflow-hidden bg-muted border">
            {fullCover ? (
              <Image
                src={fullCover}
                alt={item.title}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-[10px] text-muted-foreground font-medium">
                No cover
              </div>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <Link
              href={`/news/edit/${item._id}`}
              className="font-semibold text-sm hover:underline truncate text-foreground"
            >
              {item.title}
            </Link>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
              <span className="capitalize">{item.type}</span>
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
    accessorKey: "type",
    header: "Format",
    cell: ({ row }) => {
      const type = row.original.type;
      return (
        <Badge variant="outline" className="capitalize text-xs">
          {type}
        </Badge>
      );
    },
  },
  {
    accessorKey: "publishedAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => {
      const date = row.original.publishedAt;
      return (
        <span className="text-xs text-muted-foreground">
          {date ? new Date(date).toLocaleDateString() : "—"}
        </span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      if (status === "published") {
        return (
          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20">
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
              <Link href={`/news/edit/${item._id}`} className="gap-2">
                <Pencil className="h-3.5 w-3.5" /> Edit Story
              </Link>
            </DropdownMenuItem>
            {item.status === "published" && (
              <DropdownMenuItem asChild>
                <a
                  href={`${websiteUrl}/news/${item.slug}`}
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

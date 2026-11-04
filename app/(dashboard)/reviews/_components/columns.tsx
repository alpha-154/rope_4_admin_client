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
import { CheckCircle2, MoreHorizontal, Pencil, Star, Trash, XCircle } from "lucide-react";
import Image from "next/image";
import React from "react";
import { ReviewFormData } from "./review-dialog";

export const getReviewColumns = (
  onEdit: (item: ReviewFormData) => void,
  onStatusChange: (id: string, status: string) => void,
  onDelete: (id: string) => void
): ColumnDef<ReviewFormData>[] => [
  {
    accessorKey: "author",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Author" />
    ),
    cell: ({ row }) => {
      const item = row.original;
      const baseApi = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
      const origin = baseApi.replace(/\/api\/v1\/?$/, "");
      const fullAvatar = item.avatar
        ? item.avatar.startsWith("http")
          ? item.avatar
          : `${origin}${item.avatar.startsWith("/") ? "" : "/"}${item.avatar}`
        : null;

      return (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full overflow-hidden bg-muted flex items-center justify-center shrink-0 border">
            {fullAvatar ? (
              <Image
                src={fullAvatar}
                alt={item.author}
                width={36}
                height={36}
                className="object-cover h-full w-full"
                unoptimized
              />
            ) : (
              <span className="text-xs font-bold text-muted-foreground">
                {item.author.charAt(0)}
              </span>
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm text-foreground">{item.author}</span>
            {item.programTitle && (
              <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                {item.programTitle}
              </span>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "rating",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Rating" />
    ),
    cell: ({ row }) => {
      const rating = row.original.rating;
      return (
        <div className="flex items-center gap-1">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
          <span className="font-medium text-xs">{rating}.0</span>
        </div>
      );
    },
  },
  {
    accessorKey: "source",
    header: "Source",
    cell: ({ row }) => {
      const source = row.original.source;
      return (
        <Badge variant="outline" className="capitalize text-xs">
          {source.replace("-", " ")}
        </Badge>
      );
    },
  },
  {
    accessorKey: "text",
    header: "Feedback",
    cell: ({ row }) => {
      const text = row.original.text;
      return (
        <p className="text-xs text-muted-foreground line-clamp-2 max-w-[320px]">
          &ldquo;{text}&rdquo;
        </p>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      if (status === "approved") {
        return (
          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20">
            Approved
          </Badge>
        );
      }
      if (status === "rejected") {
        return (
          <Badge variant="destructive" className="text-xs">
            Rejected
          </Badge>
        );
      }
      return (
        <Badge variant="outline" className="text-amber-600 border-amber-300">
          Pending
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const item = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(item)} className="gap-2">
              <Pencil className="h-3.5 w-3.5" /> Edit
            </DropdownMenuItem>
            {item.status !== "approved" && (
              <DropdownMenuItem
                onClick={() => onStatusChange(item._id!, "approved")}
                className="gap-2 text-emerald-600"
              >
                <CheckCircle2 className="h-3.5 w-3.5" /> Approve
              </DropdownMenuItem>
            )}
            {item.status !== "rejected" && (
              <DropdownMenuItem
                onClick={() => onStatusChange(item._id!, "rejected")}
                className="gap-2 text-amber-600"
              >
                <XCircle className="h-3.5 w-3.5" /> Reject
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

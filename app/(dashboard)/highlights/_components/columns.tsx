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
import { DeleteAlert } from "@/components/shared/delete-alert";
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import React from "react";
import { HighlightFormData } from "./highlight-dialog";

export const getHighlightColumns = (
  onEdit: (highlight: HighlightFormData) => void,
  onDelete: (id: string) => void
): ColumnDef<HighlightFormData>[] => [
  {
    accessorKey: "sectionKey",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Section Key" />
    ),
    cell: ({ row }) => (
      <div className="font-medium text-foreground">
        {row.getValue("sectionKey")}
      </div>
    ),
  },
  {
    accessorKey: "sectionTitle",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title / Badge" />
    ),
    cell: ({ row }) => {
      const title = row.original.sectionTitle;
      const badge = row.original.badge;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{title || "—"}</span>
          {badge && (
            <span className="text-xs text-muted-foreground">{badge}</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "items",
    header: "Cards / Stats",
    cell: ({ row }) => {
      const count = row.original.items?.length || 0;
      return (
        <Badge variant="secondary" className="font-normal text-xs">
          {count} item{count !== 1 ? "s" : ""}
        </Badge>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const active = row.getValue("isActive");
      return active ? (
        <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20">
          Active
        </Badge>
      ) : (
        <Badge variant="outline" className="text-muted-foreground">
          Inactive
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

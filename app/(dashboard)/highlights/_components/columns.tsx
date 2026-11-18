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
import { HighlightApiData } from "./highlight-dialog";
import { formatHighlightValue } from "@/lib/highlight-options";

export const getHighlightColumns = (
  onEdit: (highlight: HighlightApiData) => void,
  onDelete: (id: string) => void
): ColumnDef<HighlightApiData>[] => [
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
      const items = row.original.items || [];
      return (
        <div className="flex flex-wrap gap-1 max-w-md">
          {items.length === 0 && <span className="text-xs text-muted-foreground">No cards</span>}
          {items.slice(0, 4).map((it, i) => (
            <Badge key={i} variant="secondary" className="font-normal text-xs">
              {formatHighlightValue(it.value, it.valueSign) && (
                <strong className="mr-1">{formatHighlightValue(it.value, it.valueSign)}</strong>
              )}
              {it.label}
            </Badge>
          ))}
          {items.length > 4 && (
            <Badge variant="outline" className="font-normal text-xs">
              +{items.length - 4} more
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Visibility",
    cell: ({ row }) => {
      const { isActive, isPublic } = row.original;
      const live = isActive !== false && isPublic !== false;
      return (
        <div className="flex flex-col gap-1 items-start">
          {live ? (
            <Badge variant="success">Live on website</Badge>
          ) : (
            <Badge variant="secondary">Hidden</Badge>
          )}
          <span className="text-[11px] text-muted-foreground">
            {isActive !== false ? "Active" : "Inactive"} · {isPublic !== false ? "Public" : "Private"}
          </span>
        </div>
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


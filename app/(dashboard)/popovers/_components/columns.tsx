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
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import React from "react";
import { PopoverFormData } from "./popover-dialog";

export const getPopoverColumns = (
  onEdit: (item: PopoverFormData) => void,
  onDelete: (id: string) => void
): ColumnDef<PopoverFormData>[] => [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Headline & Message" />
    ),
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="flex flex-col py-1">
          <span className="font-semibold text-sm text-foreground">{item.title}</span>
          <span className="text-xs text-muted-foreground truncate max-w-[280px]">
            {item.body}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.original.type;
      return (
        <Badge variant="outline" className="capitalize text-xs font-normal">
          {type.replace("-", " ")}
        </Badge>
      );
    },
  },
  {
    accessorKey: "pageTargeting",
    header: "Target Pages",
    cell: ({ row }) => {
      const target = row.original.pageTargeting;
      return (
        <code className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">
          {target}
        </code>
      );
    },
  },
  {
    accessorKey: "triggerDelay",
    header: "Delay & Frequency",
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="flex flex-col text-xs text-muted-foreground">
          <span>{item.triggerDelay}s delay</span>
          <span className="capitalize">{item.displayFrequency.replace(/_/g, " ")}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const active = row.original.isActive;
      return active ? (
        <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20">
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


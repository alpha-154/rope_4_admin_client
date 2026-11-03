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
import { ArrowDown, ArrowUp, MoreHorizontal, Pencil, Trash } from "lucide-react";
import React from "react";
import { FaqFormData } from "./faq-dialog";

export const getFaqColumns = (
  onEdit: (faq: FaqFormData) => void,
  onDelete: (id: string) => void,
  onMoveUp: (index: number) => void,
  onMoveDown: (index: number) => void,
  totalItems: number
): ColumnDef<FaqFormData>[] => [
  {
    id: "order",
    header: "Order",
    cell: ({ row }) => {
      const idx = row.index;
      const isFirst = idx === 0;
      const isLast = idx === totalItems - 1;

      return (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            disabled={isFirst}
            onClick={() => onMoveUp(idx)}
            title="Move Up"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            disabled={isLast}
            onClick={() => onMoveDown(idx)}
            title="Move Down"
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </Button>
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Category Name" />
    ),
    cell: ({ row }) => (
      <div className="font-semibold text-foreground">
        {row.getValue("category")}
      </div>
    ),
  },
  {
    accessorKey: "slug",
    header: "Slug",
    cell: ({ row }) => (
      <code className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">
        {row.getValue("slug")}
      </code>
    ),
  },
  {
    accessorKey: "faqs",
    header: "Q&A Items",
    cell: ({ row }) => {
      const count = row.original.faqs?.length || 0;
      return (
        <Badge variant="secondary" className="font-normal text-xs">
          {count} question{count !== 1 ? "s" : ""}
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

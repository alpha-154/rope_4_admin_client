"use client";

import { Badge } from "@/components/ui/badge/badge";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ArrowDownRight, ArrowUpRight, RefreshCw } from "lucide-react";
import React from "react";

export interface StockMovementData {
  _id: string;
  productId: string;
  productTitle: string;
  sku: string;
  type: string;
  quantityChange: number;
  quantityBefore: number;
  quantityAfter: number;
  referenceId?: string;
  reason: string;
  performedBy: string;
  createdAt: string;
}

export const movementColumns: ColumnDef<any>[] = [
  {
    accessorKey: "createdAt",
    header: "Date & Time",
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);
      return (
        <div className="text-xs">
          <div className="font-medium text-foreground">
            {format(date, "MMM dd, yyyy")}
          </div>
          <div className="text-muted-foreground">{format(date, "hh:mm a")}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "productTitle",
    header: "Product / SKU",
    cell: ({ row }) => {
      const m = row.original;
      return (
        <div>
          <div className="font-semibold text-sm">{m.productTitle}</div>
          <div className="text-xs font-mono text-muted-foreground">{m.sku}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Movement Type",
    cell: ({ row }) => {
      const type = row.original.type;
      switch (type) {
        case "ORDER_REDUCTION":
          return (
            <Badge variant="destructive" className="gap-1">
              <ArrowDownRight className="h-3 w-3" />
              Order Checkout
            </Badge>
          );
        case "PURCHASE_RECEIPT":
          return (
            <Badge variant="success" className="gap-1">
              <ArrowUpRight className="h-3 w-3" />
              Stock Receipt
            </Badge>
          );
        case "RETURN_RESTOCK":
          return (
            <Badge variant="info" className="gap-1">
              <RefreshCw className="h-3 w-3" />
              Return Restock
            </Badge>
          );
        case "DAMAGE_DISCARD":
          return (
            <Badge variant="destructive" className="gap-1">
              <ArrowDownRight className="h-3 w-3" />
              Damaged / Discard
            </Badge>
          );
        default:
          return (
            <Badge variant="secondary">
              Manual Adjustment
            </Badge>
          );
      }
    },
  },
  {
    accessorKey: "quantityChange",
    header: "Quantity Delta",
    cell: ({ row }) => {
      const delta = row.original.quantityChange;
      const isPositive = delta > 0;
      return (
        <span
          className={`font-mono font-semibold text-sm ${
            isPositive ? "text-emerald-600" : "text-rose-600"
          }`}
        >
          {isPositive ? `+${delta}` : delta}
        </span>
      );
    },
  },
  {
    accessorKey: "quantityAfter",
    header: "Stock Level",
    cell: ({ row }) => {
      const { quantityBefore, quantityAfter } = row.original;
      return (
        <div className="text-xs">
          <span className="text-muted-foreground">{quantityBefore}</span>
          <span className="mx-1.5 text-muted-foreground">→</span>
          <span className="font-semibold text-foreground">{quantityAfter}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "referenceId",
    header: "Ref / Reason",
    cell: ({ row }) => {
      const { referenceId, reason } = row.original;
      return (
        <div className="max-w-[200px] text-xs">
          {referenceId && (
            <div className="font-mono font-medium text-primary">
              {referenceId}
            </div>
          )}
          <div className="text-muted-foreground truncate">{reason}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "performedBy",
    header: "User / Performer",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {row.original.performedBy}
      </span>
    ),
  },
];

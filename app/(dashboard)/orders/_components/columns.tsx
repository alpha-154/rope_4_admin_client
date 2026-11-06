"use client";

import { Badge } from "@/components/ui/badge/badge";
import { Button } from "@/components/ui/button/button";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Eye } from "lucide-react";
import React from "react";

export interface OrderItemData {
  productId: string;
  productTitle: string;
  sku: string;
  variant?: { size?: string; color?: string };
  quantity: number;
  unitPrice: number;
  subtotal: number;
  image?: string;
}

export interface OrderData {
  _id: string;
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: {
    street: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
  };
  items: OrderItemData[];
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  paymentMethod: string;
  status: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  statusHistory: Array<{
    status: string;
    timestamp: string;
    note?: string;
    changedBy?: string;
  }>;
  customerNotes?: string;
  adminNotes?: string;
  createdAt: string;
}

export function getOrderColumns(
  onView: (order: OrderData) => void
): ColumnDef<any>[] {
  return [
    {
      accessorKey: "orderNumber",
      header: "Order #",
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <div className="font-mono font-bold text-sm text-primary">
            {row.original.orderNumber}
          </div>
          <div className="text-[11px] text-muted-foreground">
            {format(new Date(row.original.createdAt), "MMM dd, yyyy hh:mm a")}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "customerName",
      header: "Customer",
      cell: ({ row }) => {
        const o = row.original;
        return (
          <div className="space-y-0.5 max-w-[200px]">
            <div className="font-semibold text-sm truncate">{o.customerName}</div>
            <div className="text-xs text-muted-foreground truncate">{o.customerEmail}</div>
            <div className="text-[11px] text-muted-foreground">{o.customerPhone}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "items",
      header: "Items",
      cell: ({ row }) => {
        const items = row.original.items || [];
        const totalUnits = items.reduce((acc: number, it: any) => acc + (it.quantity || 1), 0);
        return (
          <div className="text-xs space-y-0.5">
            <span className="font-medium text-foreground">
              {totalUnits} {totalUnits === 1 ? "unit" : "units"}
            </span>
            <div className="text-muted-foreground truncate max-w-[180px]">
              {items.map((i: any) => `${i.productTitle} (${i.quantity})`).join(", ")}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "totalAmount",
      header: "Total",
      cell: ({ row }) => {
        const o = row.original;
        return (
          <div className="space-y-0.5">
            <div className="font-bold text-sm">
              {o.totalAmount.toLocaleString()} BDT
            </div>
            <div className="text-[11px] font-mono text-muted-foreground uppercase">
              {o.paymentMethod}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "paymentStatus",
      header: "Payment",
      cell: ({ row }) => {
        const pStatus = row.original.paymentStatus;
        switch (pStatus) {
          case "PAID":
            return (
              <Badge
                variant="outline"
                className="bg-emerald-500/15 text-emerald-700 border-emerald-300 text-xs"
              >
                Paid
              </Badge>
            );
          case "FAILED":
            return (
              <Badge variant="destructive" className="text-xs">
                Failed
              </Badge>
            );
          case "REFUNDED":
            return (
              <Badge variant="secondary" className="text-xs">
                Refunded
              </Badge>
            );
          default:
            return (
              <Badge
                variant="outline"
                className="bg-amber-500/15 text-amber-700 border-amber-300 text-xs"
              >
                Unpaid / Pending
              </Badge>
            );
        }
      },
    },
    {
      accessorKey: "status",
      header: "Order Status",
      cell: ({ row }) => {
        const status = row.original.status;
        switch (status) {
          case "CONFIRMED":
            return (
              <Badge
                variant="outline"
                className="bg-sky-500/15 text-sky-700 border-sky-300 text-xs font-semibold"
              >
                Confirmed
              </Badge>
            );
          case "SHIPPED":
            return (
              <Badge
                variant="outline"
                className="bg-indigo-500/15 text-indigo-700 border-indigo-300 text-xs font-semibold"
              >
                Shipped
              </Badge>
            );
          case "DELIVERED":
            return (
              <Badge
                variant="outline"
                className="bg-emerald-500/15 text-emerald-700 border-emerald-300 text-xs font-semibold"
              >
                Delivered
              </Badge>
            );
          case "CANCELLED":
            return (
              <Badge variant="destructive" className="text-xs font-semibold">
                Cancelled
              </Badge>
            );
          default:
            return (
              <Badge
                variant="outline"
                className="bg-amber-500/15 text-amber-700 border-amber-300 text-xs font-semibold"
              >
                Pending
              </Badge>
            );
        }
      },
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onView(row.original)}
          className="gap-1.5 h-8 text-xs font-medium"
        >
          <Eye className="h-3.5 w-3.5" />
          <span>Details</span>
        </Button>
      ),
    },
  ];
}

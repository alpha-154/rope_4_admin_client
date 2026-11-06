"use client";

import { Badge } from "@/components/ui/badge/badge";
import { Button } from "@/components/ui/button/button";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Eye, User } from "lucide-react";
import React from "react";

export interface CustomerData {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  shippingAddresses: Array<{
    id: string;
    label: string;
    street: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
  }>;
  wishlist: string[];
  totalOrders: number;
  totalSpent: number;
  isActive: boolean;
  isBlocked: boolean;
  createdAt: string;
}

export function getCustomerColumns(
  onView: (customer: CustomerData) => void
): ColumnDef<any>[] {
  return [
    {
      accessorKey: "firstName",
      header: "Traveler / Customer",
      cell: ({ row }) => {
        const c = row.original;
        const fullName = `${c.firstName} ${c.lastName}`.trim();
        return (
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
              {c.avatar ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={c.avatar}
                  alt={fullName}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <User className="h-4 w-4" />
              )}
            </div>
            <div>
              <div className="font-semibold text-sm text-foreground">
                {fullName}
              </div>
              <div className="text-xs text-muted-foreground">{c.email}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => (
        <span className="text-xs font-mono text-muted-foreground">
          {row.original.phone || "—"}
        </span>
      ),
    },
    {
      accessorKey: "totalOrders",
      header: "Orders",
      cell: ({ row }) => (
        <span className="font-semibold text-sm">
          {row.original.totalOrders || 0}
        </span>
      ),
    },
    {
      accessorKey: "totalSpent",
      header: "Total Spent",
      cell: ({ row }) => (
        <span className="font-bold text-sm text-foreground">
          {(row.original.totalSpent || 0).toLocaleString()} BDT
        </span>
      ),
    },
    {
      accessorKey: "isBlocked",
      header: "Status",
      cell: ({ row }) => {
        const isBlocked = row.original.isBlocked;
        return isBlocked ? (
          <Badge variant="destructive" className="text-xs font-medium">
            Suspended
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="bg-emerald-500/15 text-emerald-700 border-emerald-300 text-xs font-medium"
          >
            Active Traveler
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Joined",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {format(new Date(row.original.createdAt), "MMM dd, yyyy")}
        </span>
      ),
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
          <span>View</span>
        </Button>
      ),
    },
  ];
}

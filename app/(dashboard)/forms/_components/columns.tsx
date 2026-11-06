"use client";

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
import { Eye, Mail, MoreHorizontal, Phone, Trash, User } from "lucide-react";
import React from "react";

const statusConfig: Record<string, { label: string; className: string }> = {
  new: {
    label: "New",
    className:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border-emerald-300",
  },
  in_progress: {
    label: "In Progress",
    className:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 border-amber-300",
  },
  responded: {
    label: "Responded",
    className:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 border-blue-300",
  },
  archived: {
    label: "Archived",
    className:
      "bg-slate-100 text-slate-800 dark:bg-slate-800/80 dark:text-slate-300 border-slate-300",
  },
};

export const getSubmissionColumns = (
  onView: (submission: any) => void,
  onDelete: (id: string) => void
): ColumnDef<any>[] => [
  {
    id: "submitter",
    header: "Contact / Submitter",
    cell: ({ row }) => {
      const sub = row.original;
      return (
        <div className="space-y-1">
          <div className="font-semibold text-sm text-foreground flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{sub.submitterName || "Anonymous"}</span>
          </div>
          <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-2">
            {sub.submitterEmail && (
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {sub.submitterEmail}
              </span>
            )}
            {sub.submitterPhone && (
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {sub.submitterPhone}
              </span>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "formName",
    header: "Form",
    cell: ({ row }) => (
      <div>
        <div className="font-medium text-xs text-foreground">{row.original.formName}</div>
        <div className="text-[11px] text-muted-foreground font-mono">{row.original.formSlug}</div>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status || "new";
      const config = statusConfig[status] || statusConfig.new;
      return (
        <Badge variant="outline" className={`text-xs font-semibold ${config.className}`}>
          {config.label}
        </Badge>
      );
    },
  },
  {
    id: "emailStatus",
    header: "Brevo Delivery",
    cell: ({ row }) => {
      const sub = row.original;
      return (
        <div className="flex items-center gap-1.5 text-xs">
          <span
            className={`h-2 w-2 rounded-full ${
              sub.emailSent ? "bg-emerald-500" : "bg-muted-foreground"
            }`}
          />
          <span className="text-muted-foreground">
            {sub.emailSent ? "Alert Sent" : "Logged"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => {
      const d = new Date(row.original.createdAt);
      return (
        <div className="text-xs text-muted-foreground whitespace-nowrap">
          {d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          <div className="text-[10px] text-muted-foreground/70">
            {d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const sub = row.original;
      return (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(sub)}
            className="h-8 gap-1 text-xs text-primary hover:bg-primary/10"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Review</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(sub)} className="gap-2 cursor-pointer">
                <Eye className="h-3.5 w-3.5" />
                <span>View Full Details</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DeleteAlert
                onConfirm={() => onDelete(sub._id)}
                title="Delete Inquiry Submission?"
                description="This action cannot be undone. All submitted traveler data will be permanently removed."
              >
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  className="gap-2 text-destructive cursor-pointer"
                >
                  <Trash className="h-3.5 w-3.5" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DeleteAlert>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];


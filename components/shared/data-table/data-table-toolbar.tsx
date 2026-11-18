"use client";

import type { Table } from "@tanstack/react-table";
import { X } from "lucide-react";
import React, { useEffect, useState } from "react";

import { Button, Input } from "@/components/ui";
import { useDebounced } from "@/hooks/use-debounced";
import { DataTableViewOptions } from "./data-table-view-options";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  actions?: React.ReactNode;
}

export function DataTableToolbar<TData>({
  table,
  searchPlaceholder = "Search...",
  onSearchChange,
  actions,
}: DataTableToolbarProps<TData>) {
  const isFiltered = (table.getState().columnFilters?.length ?? 0) > 0;
  const [searchKey, setSearchKey] = useState<string>("");
  const debouncedTerm = useDebounced({ string: searchKey, delay: 500 });

  useEffect(() => {
    if (onSearchChange) {
      onSearchChange(debouncedTerm);
    }
  }, [debouncedTerm, onSearchChange]);

  return (
    <div className="flex flex-wrap items-center justify-between gap-y-2">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <Input
          placeholder={searchPlaceholder}
          value={searchKey}
          onChange={(e) => setSearchKey(e.target.value)}
          className="h-9 min-w-[200px] sm:w-[260px] lg:w-[320px] bg-white border-slate-200 text-xs rounded-xl shadow-xs placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500/10 text-slate-900"
        />
        {(isFiltered || searchKey) && (
          <Button
            variant="ghost"
            onClick={() => {
              setSearchKey("");
              table.resetColumnFilters();
            }}
            className="h-9 px-2.5 lg:px-3 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl"
          >
            Reset
            <X className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        {actions}
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}


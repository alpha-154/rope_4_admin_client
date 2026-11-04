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
  const isFiltered = table.getState().columnFilters.length > 0;
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
          className="h-8 min-w-[180px] sm:w-[250px] lg:w-[320px]"
        />
        {(isFiltered || searchKey) && (
          <Button
            variant="ghost"
            onClick={() => {
              setSearchKey("");
              table.resetColumnFilters();
            }}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
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


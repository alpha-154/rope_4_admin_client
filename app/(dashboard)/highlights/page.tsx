"use client";

import { Button } from "@/components/ui/button/button";
import { DataTable } from "@/components/shared/data-table/data-table";
import { dataTablePaginationDefaultState } from "@/constants/data-table";
import { apiClient } from "@/lib/axios";
import { PaginationState, SortingState } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { getHighlightColumns } from "./_components/columns";
import { HighlightDialog, HighlightFormData } from "./_components/highlight-dialog";

export default function HighlightsPage() {
  const [data, setData] = useState<HighlightFormData[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");

  const [pagination, setPagination] = useState<PaginationState>(
    dataTablePaginationDefaultState
  );
  const [sorting, setSorting] = useState<SortingState>([]);

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [selectedHighlight, setSelectedHighlight] =
    useState<HighlightFormData | null>(null);

  const fetchHighlights = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
      };

      if (search) {
        params.search = search;
      }

      if (sorting.length > 0) {
        const sortField = sorting[0].id;
        const sortOrder = sorting[0].desc ? `-${sortField}` : sortField;
        params.sort = sortOrder;
      }

      const res = await apiClient.get("/highlights/admin", { params });
      setData(res.data?.data || []);
      setTotalCount(res.data?.meta?.total || 0);
    } catch (err: any) {
      console.error("Error fetching highlights:", err);
      toast.error(err.response?.data?.message || "Failed to load highlights");
    } finally {
      setIsLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, search, sorting]);

  useEffect(() => {
    fetchHighlights();
  }, [fetchHighlights]);

  const handleEdit = useCallback((highlight: HighlightFormData) => {
    setSelectedHighlight(highlight);
    setDialogOpen(true);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await apiClient.delete(`/highlights/${id}`);
      toast.success("Highlight section deleted successfully");
      fetchHighlights();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to delete highlight section"
      );
    }
  }, [fetchHighlights]);

  const columns = React.useMemo(
    () => getHighlightColumns(handleEdit, handleDelete),
    [handleEdit, handleDelete]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Highlights & Stats</h1>
          <p className="text-sm text-muted-foreground">
            Manage site-wide statistics, trust pillars, and adventure feature cards.
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedHighlight(null);
            setDialogOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" /> Add Section
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data}
        pagination={pagination}
        setPagination={setPagination}
        totalDocumentCount={totalCount}
        sorting={sorting}
        setSorting={setSorting}
        searchPlaceholder="Search highlights..."
        onSearchChange={setSearch}
        isLoading={isLoading}
      />

      <HighlightDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={selectedHighlight}
        onSuccess={fetchHighlights}
      />
    </div>
  );
}

"use client";

import { DataTable } from "@/components/shared/data-table/data-table";
import { Button } from "@/components/ui/button/button";
import { dataTablePaginationDefaultState } from "@/constants/data-table";
import { apiClient } from "@/lib/axios";
import { PaginationState, SortingState } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { getPopoverColumns } from "./_components/columns";
import { PopoverDialog, PopoverFormData } from "./_components/popover-dialog";

export default function PopoversPage() {
  const [data, setData] = useState<PopoverFormData[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");

  const [pagination, setPagination] = useState<PaginationState>(
    dataTablePaginationDefaultState
  );
  const [sorting, setSorting] = useState<SortingState>([]);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [selectedPopover, setSelectedPopover] =
    useState<PopoverFormData | null>(null);

  const fetchPopovers = useCallback(async () => {
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

      const res = await apiClient.get("/popovers/admin", { params });
      setData(res.data?.data || []);
      setTotalCount(res.data?.meta?.total || 0);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load popovers");
    } finally {
      setIsLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, search, sorting]);

  useEffect(() => {
    fetchPopovers();
  }, [fetchPopovers]);

  const handleEdit = useCallback((popover: PopoverFormData) => {
    setSelectedPopover(popover);
    setDialogOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await apiClient.delete(`/popovers/${id}`);
        toast.success("Popover deleted successfully");
        fetchPopovers();
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to delete popover");
      }
    },
    [fetchPopovers]
  );

  const columns = React.useMemo(
    () => getPopoverColumns(handleEdit, handleDelete),
    [handleEdit, handleDelete]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Popovers & Floating Widgets
          </h1>
          <p className="text-sm text-muted-foreground">
            Configure site-wide promotional modals, emergency notice banners, and safety side tabs.
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedPopover(null);
            setDialogOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" /> Add Popover
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
        searchPlaceholder="Search widgets by title, targeting..."
        onSearchChange={setSearch}
        isLoading={isLoading}
      />

      <PopoverDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={selectedPopover}
        onSuccess={fetchPopovers}
      />
    </div>
  );
}

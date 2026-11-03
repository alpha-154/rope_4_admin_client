"use client";

import { Button } from "@/components/ui/button/button";
import { DataTable } from "@/components/shared/data-table/data-table";
import { dataTablePaginationDefaultState } from "@/constants/data-table";
import { apiClient } from "@/lib/axios";
import { PaginationState, SortingState } from "@tanstack/react-table";
import { HelpCircle, Plus } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { getFaqColumns } from "./_components/columns";
import { FaqDialog, FaqFormData } from "./_components/faq-dialog";

export default function FaqsPage() {
  const [data, setData] = useState<FaqFormData[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");

  const [pagination, setPagination] = useState<PaginationState>(
    dataTablePaginationDefaultState
  );
  const [sorting, setSorting] = useState<SortingState>([]);

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [selectedFaq, setSelectedFaq] = useState<FaqFormData | null>(null);

  const fetchFaqs = useCallback(async () => {
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

      const res = await apiClient.get("/faqs/admin", { params });
      setData(res.data?.data || []);
      setTotalCount(res.data?.meta?.total || 0);
    } catch (err: any) {
      console.error("Error fetching FAQs:", err);
      toast.error(err.response?.data?.message || "Failed to load FAQs");
    } finally {
      setIsLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, search, sorting]);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  const handleEdit = useCallback((faq: FaqFormData) => {
    setSelectedFaq(faq);
    setDialogOpen(true);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await apiClient.delete(`/faqs/${id}`);
      toast.success("FAQ category deleted successfully");
      fetchFaqs();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to delete FAQ category"
      );
    }
  }, [fetchFaqs]);

  const handleMoveUp = useCallback(async (index: number) => {
    if (index <= 0) return;
    const target = data[index];
    const prevItem = data[index - 1];
    const prevPrevItem = data[index - 2];

    const prevId = prevPrevItem?._id;
    const nextId = prevItem?._id;

    try {
      await apiClient.patch(`/faqs/${target._id}/reorder`, {
        prevId,
        nextId,
      });
      toast.success(`Moved "${target.category}" up`);
      fetchFaqs();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to reorder category");
    }
  }, [data, fetchFaqs]);

  const handleMoveDown = useCallback(async (index: number) => {
    if (index >= data.length - 1) return;
    const target = data[index];
    const nextItem = data[index + 1];
    const nextNextItem = data[index + 2];

    const prevId = nextItem?._id;
    const nextId = nextNextItem?._id;

    try {
      await apiClient.patch(`/faqs/${target._id}/reorder`, {
        prevId,
        nextId,
      });
      toast.success(`Moved "${target.category}" down`);
      fetchFaqs();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to reorder category");
    }
  }, [data, fetchFaqs]);

  const columns = React.useMemo(
    () =>
      getFaqColumns(
        handleEdit,
        handleDelete,
        handleMoveUp,
        handleMoveDown,
        data.length
      ),
    [handleEdit, handleDelete, handleMoveUp, handleMoveDown, data.length]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage help topics and Q&A accordions. Reorder categories with the arrow controls.
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedFaq(null);
            setDialogOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" /> Add Category
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
        searchPlaceholder="Search questions and categories..."
        onSearchChange={setSearch}
        isLoading={isLoading}
      />

      <FaqDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={selectedFaq}
        onSuccess={fetchFaqs}
      />
    </div>
  );
}

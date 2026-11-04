"use client";

import { DataTable } from "@/components/shared/data-table/data-table";
import { Button } from "@/components/ui/button/button";
import { dataTablePaginationDefaultState } from "@/constants/data-table";
import { apiClient } from "@/lib/axios";
import { PaginationState, SortingState } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { getNewsColumns } from "./_components/columns";
import { NewsFormData } from "./_components/news-form";

export default function NewsPage() {
  const [data, setData] = useState<NewsFormData[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");

  const [pagination, setPagination] = useState<PaginationState>(
    dataTablePaginationDefaultState
  );
  const [sorting, setSorting] = useState<SortingState>([]);

  const fetchNews = useCallback(async () => {
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

      const res = await apiClient.get("/news/admin", { params });
      setData(res.data?.data || []);
      setTotalCount(res.data?.meta?.total || 0);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load stories");
    } finally {
      setIsLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, search, sorting]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await apiClient.delete(`/news/${id}`);
        toast.success("Article deleted successfully");
        fetchNews();
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to delete article");
      }
    },
    [fetchNews]
  );

  const columns = React.useMemo(
    () => getNewsColumns(handleDelete),
    [handleDelete]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            News, Articles & Stories
          </h1>
          <p className="text-sm text-muted-foreground">
            Publish trek updates, mountaineering tutorials, gear guides, and expedition dispatches.
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/news/create">
            <Plus className="h-4 w-4" /> Write Article
          </Link>
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
        searchPlaceholder="Search news by headline, tags..."
        onSearchChange={setSearch}
        isLoading={isLoading}
      />
    </div>
  );
}

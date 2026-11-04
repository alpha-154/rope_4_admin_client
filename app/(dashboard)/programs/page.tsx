"use client";

import { DataTable } from "@/components/shared/data-table/data-table";
import { Button } from "@/components/ui/button/button";
import { dataTablePaginationDefaultState } from "@/constants/data-table";
import { apiClient } from "@/lib/axios";
import { PaginationState, SortingState } from "@tanstack/react-table";
import { Compass, Plus } from "lucide-react";
import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { getProgramColumns } from "./_components/columns";
import { ProgramFormData } from "./_components/program-form";

export default function ProgramsPage() {
  const [data, setData] = useState<ProgramFormData[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");

  const [pagination, setPagination] = useState<PaginationState>(
    dataTablePaginationDefaultState
  );
  const [sorting, setSorting] = useState<SortingState>([]);

  const fetchPrograms = useCallback(async () => {
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

      const res = await apiClient.get("/programs/admin", { params });
      setData(res.data?.data || []);
      setTotalCount(res.data?.meta?.total || 0);
    } catch (err: any) {
      console.error("Error fetching programs:", err);
      toast.error(err.response?.data?.message || "Failed to load programs");
    } finally {
      setIsLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, search, sorting]);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await apiClient.delete(`/programs/${id}`);
        toast.success("Program deleted successfully");
        fetchPrograms();
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to delete program");
      }
    },
    [fetchPrograms]
  );

  const columns = React.useMemo(
    () => getProgramColumns(handleDelete),
    [handleDelete]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Programs & Treks</h1>
          <p className="text-sm text-muted-foreground">
            Manage your outdoor education courses, expeditions, family treks, and fixed departures.
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/programs/create">
            <Plus className="h-4 w-4" /> Add Program
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
        searchPlaceholder="Search programs by title, country, region..."
        onSearchChange={setSearch}
        isLoading={isLoading}
      />
    </div>
  );
}

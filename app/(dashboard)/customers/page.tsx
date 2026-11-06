"use client";

import { DataTable } from "@/components/shared/data-table/data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select/select";
import { dataTablePaginationDefaultState } from "@/constants/data-table";
import { apiClient } from "@/lib/axios";
import { PaginationState, SortingState } from "@tanstack/react-table";
import { Users } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CustomerData, getCustomerColumns } from "./_components/columns";
import { CustomerDetailDialog } from "./_components/customer-detail-dialog";

export default function CustomersPage() {
  const [data, setData] = useState<CustomerData[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [pagination, setPagination] = useState<PaginationState>(
    dataTablePaginationDefaultState
  );
  const [sorting, setSorting] = useState<SortingState>([]);

  // Dialog state
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(
    null
  );
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
      };

      if (search.trim()) {
        params.search = search.trim();
      }

      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      const res = await apiClient.get("/admin/customers", { params });
      setData(res.data?.data?.items || []);
      setTotalCount(res.data?.data?.pagination?.total || 0);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load customers");
    } finally {
      setIsLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, search, statusFilter]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleViewCustomer = useCallback((customer: CustomerData) => {
    setSelectedCustomer(customer);
    setIsDetailOpen(true);
  }, []);

  const columns = useMemo(
    () => getCustomerColumns(handleViewCustomer),
    [handleViewCustomer]
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            <span>Customers & Travelers</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            View registered traveler profiles, track orders volume and lifetime spend, and manage customer access.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Customer Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Travelers</SelectItem>
            <SelectItem value="active">Active Accounts</SelectItem>
            <SelectItem value="blocked">Suspended Accounts</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={data}
        pagination={pagination}
        setPagination={setPagination}
        totalDocumentCount={totalCount}
        sorting={sorting}
        setSorting={setSorting}
        searchPlaceholder="Search traveler by name, email, or phone..."
        onSearchChange={setSearch}
        isLoading={isLoading}
      />

      {/* Customer Detail Dialog */}
      <CustomerDetailDialog
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        customer={selectedCustomer}
        onSuccess={fetchCustomers}
      />
    </div>
  );
}

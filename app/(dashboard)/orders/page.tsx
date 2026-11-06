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
import { ClipboardList } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { getOrderColumns, OrderData } from "./_components/columns";
import { OrderDetailDialog } from "./_components/order-detail-dialog";

export default function OrdersPage() {
  const [data, setData] = useState<OrderData[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");

  const [pagination, setPagination] = useState<PaginationState>(
    dataTablePaginationDefaultState
  );
  const [sorting, setSorting] = useState<SortingState>([]);

  // Dialog state
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);

  const fetchOrders = useCallback(async () => {
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

      if (paymentFilter !== "all") {
        params.paymentStatus = paymentFilter;
      }

      const res = await apiClient.get("/admin/orders", { params });
      setData(res.data?.data?.items || []);
      setTotalCount(res.data?.data?.pagination?.total || 0);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    search,
    statusFilter,
    paymentFilter,
  ]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleViewOrder = useCallback((order: OrderData) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  }, []);

  const columns = useMemo(() => getOrderColumns(handleViewOrder), [handleViewOrder]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-primary" />
            <span>Store Orders & Shipments</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Process customer orders, verify payments, dispatch parcels, and manage fulfillment workflow.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Order Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="PENDING">Pending Approval</SelectItem>
            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
            <SelectItem value="SHIPPED">Shipped / Dispatched</SelectItem>
            <SelectItem value="DELIVERED">Delivered</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Select value={paymentFilter} onValueChange={setPaymentFilter}>
          <SelectTrigger className="w-[170px]">
            <SelectValue placeholder="Payment Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payments</SelectItem>
            <SelectItem value="PENDING">Pending / Unpaid</SelectItem>
            <SelectItem value="PAID">Paid in Full</SelectItem>
            <SelectItem value="FAILED">Payment Failed</SelectItem>
            <SelectItem value="REFUNDED">Refunded</SelectItem>
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
        searchPlaceholder="Search by order number, customer name, email, or phone..."
        onSearchChange={setSearch}
        isLoading={isLoading}
      />

      {/* Order Detail & Workflow Dialog */}
      <OrderDetailDialog
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        order={selectedOrder}
        onSuccess={fetchOrders}
      />
    </div>
  );
}

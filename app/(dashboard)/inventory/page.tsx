"use client";

import { DataTable } from "@/components/shared/data-table/data-table";
import { Badge } from "@/components/ui/badge/badge";
import { Button } from "@/components/ui/button/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs/tabs";
import { dataTablePaginationDefaultState } from "@/constants/data-table";
import { apiClient } from "@/lib/axios";
import { ColumnDef, PaginationState, SortingState } from "@tanstack/react-table";
import {
  AlertTriangle,
  Boxes,
  DollarSign,
  History,
  PackageCheck,
  PackageX,
  SlidersHorizontal,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AdjustStockDialog } from "./_components/adjust-stock-dialog";
import {
  movementColumns,
  StockMovementData,
} from "./_components/movements-columns";

interface InventoryProduct {
  _id: string;
  title: string;
  sku: string;
  category: string;
  price: number;
  stockQuantity: number;
  lowStockThreshold: number;
  images: string[];
}

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<string>("status");

  // Status Tab states
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [metrics, setMetrics] = useState({
    totalSkus: 0,
    totalUnits: 0,
    totalValuation: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
  });
  const [isLoadingStatus, setIsLoadingStatus] = useState<boolean>(true);
  const [statusSearch, setStatusSearch] = useState<string>("");
  const [stockStatusFilter, setStockStatusFilter] = useState<string>("all");
  const [statusPagination, setStatusPagination] = useState<PaginationState>(
    dataTablePaginationDefaultState
  );

  // Movements Tab states
  const [movements, setMovements] = useState<StockMovementData[]>([]);
  const [totalMovements, setTotalMovements] = useState<number>(0);
  const [isLoadingMovements, setIsLoadingMovements] = useState<boolean>(false);
  const [movementSearch, setMovementSearch] = useState<string>("");
  const [movementPagination, setMovementPagination] = useState<PaginationState>(
    dataTablePaginationDefaultState
  );

  // Adjust Dialog state
  const [adjustTarget, setAdjustTarget] = useState<InventoryProduct | null>(null);

  const fetchInventoryStatus = useCallback(async () => {
    setIsLoadingStatus(true);
    try {
      const params: Record<string, any> = {
        page: statusPagination.pageIndex + 1,
        limit: statusPagination.pageSize,
      };
      if (statusSearch.trim()) params.search = statusSearch.trim();
      if (stockStatusFilter !== "all") params.status = stockStatusFilter;

      const res = await apiClient.get("/admin/inventory", { params });
      setProducts(res.data?.data?.items || []);
      setMetrics(
        res.data?.data?.metrics || {
          totalSkus: 0,
          totalUnits: 0,
          totalValuation: 0,
          lowStockCount: 0,
          outOfStockCount: 0,
        }
      );
      setTotalProducts(res.data?.data?.pagination?.total || 0);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load inventory");
    } finally {
      setIsLoadingStatus(false);
    }
  }, [
    statusPagination.pageIndex,
    statusPagination.pageSize,
    statusSearch,
    stockStatusFilter,
  ]);

  const fetchMovements = useCallback(async () => {
    setIsLoadingMovements(true);
    try {
      const params: Record<string, any> = {
        page: movementPagination.pageIndex + 1,
        limit: movementPagination.pageSize,
      };
      if (movementSearch.trim()) params.search = movementSearch.trim();

      const res = await apiClient.get("/admin/inventory/movements", { params });
      setMovements(res.data?.data?.items || []);
      setTotalMovements(res.data?.data?.pagination?.total || 0);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load stock movements");
    } finally {
      setIsLoadingMovements(false);
    }
  }, [movementPagination.pageIndex, movementPagination.pageSize, movementSearch]);

  useEffect(() => {
    fetchInventoryStatus();
  }, [fetchInventoryStatus]);

  useEffect(() => {
    if (activeTab === "movements") {
      fetchMovements();
    }
  }, [activeTab, fetchMovements]);

  // Inventory Table Columns
  const statusColumns: ColumnDef<any>[] = useMemo(
    () => [
      {
        accessorKey: "title",
        header: "Product / SKU",
        cell: ({ row }) => (
          <div>
            <div className="font-semibold text-sm">{row.original.title}</div>
            <div className="text-xs font-mono text-muted-foreground">
              {row.original.sku} • {row.original.category}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "price",
        header: "Unit Price",
        cell: ({ row }) => (
          <span className="text-sm font-medium">
            {row.original.price.toLocaleString()} BDT
          </span>
        ),
      },
      {
        accessorKey: "stockQuantity",
        header: "On-Hand Stock",
        cell: ({ row }) => {
          const qty = row.original.stockQuantity;
          const low = row.original.lowStockThreshold;
          if (qty <= 0) {
            return (
              <Badge variant="destructive" className="font-medium text-xs">
                Out of Stock (0)
              </Badge>
            );
          }
          if (qty <= low) {
            return (
              <Badge
                variant="outline"
                className="bg-amber-500/15 text-amber-700 border-amber-300 font-medium text-xs"
              >
                Low Stock ({qty})
              </Badge>
            );
          }
          return (
            <Badge
              variant="outline"
              className="bg-emerald-500/15 text-emerald-700 border-emerald-300 font-medium text-xs"
            >
              In Stock ({qty})
            </Badge>
          );
        },
      },
      {
        id: "valuation",
        header: "Total Value",
        cell: ({ row }) => {
          const val = row.original.stockQuantity * row.original.price;
          return (
            <span className="font-mono text-xs font-medium text-muted-foreground">
              {val.toLocaleString()} BDT
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "Action",
        cell: ({ row }) => (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAdjustTarget(row.original)}
            className="gap-1.5 h-8 text-xs font-medium"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Adjust Stock</span>
          </Button>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Boxes className="h-6 w-6 text-primary" />
            <span>Inventory & Stock Control</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Monitor real-time warehouse stock, track purchase receipts, and audit inventory movements.
          </p>
        </div>
      </div>

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <Card className="p-4 space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
            <Boxes className="h-4 w-4" />
            <span>Active SKUs</span>
          </div>
          <div className="text-2xl font-bold">{metrics.totalSkus}</div>
        </Card>

        <Card className="p-4 space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
            <PackageCheck className="h-4 w-4" />
            <span>Total Units</span>
          </div>
          <div className="text-2xl font-bold">{metrics.totalUnits}</div>
        </Card>

        <Card className="p-4 space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
            <DollarSign className="h-4 w-4" />
            <span>Stock Valuation</span>
          </div>
          <div className="text-2xl font-bold truncate">
            {metrics.totalValuation.toLocaleString()} <span className="text-xs text-muted-foreground">BDT</span>
          </div>
        </Card>

        <Card className="p-4 space-y-1 border-amber-200 bg-amber-500/5">
          <div className="flex items-center gap-2 text-amber-700 text-xs font-medium">
            <AlertTriangle className="h-4 w-4" />
            <span>Low Stock</span>
          </div>
          <div className="text-2xl font-bold text-amber-700">
            {metrics.lowStockCount}
          </div>
        </Card>

        <Card className="p-4 space-y-1 border-rose-200 bg-rose-500/5 col-span-2 sm:col-span-1">
          <div className="flex items-center gap-2 text-rose-700 text-xs font-medium">
            <PackageX className="h-4 w-4" />
            <span>Out of Stock</span>
          </div>
          <div className="text-2xl font-bold text-rose-700">
            {metrics.outOfStockCount}
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="status" className="gap-2">
            <Boxes className="h-4 w-4" />
            <span>On-Hand Stock</span>
          </TabsTrigger>
          <TabsTrigger value="movements" className="gap-2">
            <History className="h-4 w-4" />
            <span>Stock Movements Log</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: On-Hand Stock */}
        <TabsContent value="status" className="space-y-4">
          <div className="flex items-center gap-3">
            <Select value={stockStatusFilter} onValueChange={setStockStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Stock Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="inStock">In Stock (&gt; 0)</SelectItem>
                <SelectItem value="lowStock">Low Stock Alert</SelectItem>
                <SelectItem value="outOfStock">Out of Stock (0)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DataTable
            columns={statusColumns}
            data={products}
            pagination={statusPagination}
            setPagination={setStatusPagination}
            totalDocumentCount={totalProducts}
            searchPlaceholder="Search product by title, SKU, or category..."
            onSearchChange={setStatusSearch}
            isLoading={isLoadingStatus}
          />
        </TabsContent>

        {/* Tab 2: Stock Movements Audit Trail */}
        <TabsContent value="movements" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Movement Audit Trail</CardTitle>
              <CardDescription>
                Chronological ledger of inventory increments, customer order deductions, and manual recounts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={movementColumns}
                data={movements}
                pagination={movementPagination}
                setPagination={setMovementPagination}
                totalDocumentCount={totalMovements}
                searchPlaceholder="Search by product, SKU, reference ID, or reason..."
                onSearchChange={setMovementSearch}
                isLoading={isLoadingMovements}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Adjust Stock Dialog */}
      <AdjustStockDialog
        open={!!adjustTarget}
        onOpenChange={(open) => !open && setAdjustTarget(null)}
        product={adjustTarget}
        onSuccess={() => {
          fetchInventoryStatus();
          if (activeTab === "movements") fetchMovements();
        }}
      />
    </div>
  );
}

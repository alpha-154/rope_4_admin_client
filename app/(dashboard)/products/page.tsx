"use client";

import { DataTable } from "@/components/shared/data-table/data-table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog/alert-dialog";
import { Button } from "@/components/ui/button/button";
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
import { Package, Plus } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { getProductColumns, ProductData } from "./_components/columns";
import { ProductDialog } from "./_components/product-dialog";

export default function ProductsPage() {
  const [data, setData] = useState<ProductData[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<string>("all");

  const [pagination, setPagination] = useState<PaginationState>(
    dataTablePaginationDefaultState
  );
  const [sorting, setSorting] = useState<SortingState>([]);

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductData | null>(
    null
  );
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
      };

      if (search.trim()) {
        params.search = search.trim();
      }

      if (categoryFilter !== "all") {
        params.category = categoryFilter;
      }

      if (stockFilter !== "all") {
        params.stockStatus = stockFilter;
      }

      const res = await apiClient.get("/admin/products", { params });
      setData(res.data?.data?.items || []);
      setTotalCount(res.data?.data?.pagination?.total || 0);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load products");
    } finally {
      setIsLoading(false);
    }
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    search,
    categoryFilter,
    stockFilter,
  ]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleCreate = () => {
    setSelectedProduct(null);
    setIsDialogOpen(true);
  };

  const handleEdit = useCallback((product: ProductData) => {
    setSelectedProduct(product);
    setIsDialogOpen(true);
  }, []);

  const handleDeleteTrigger = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      await apiClient.delete(`/admin/products/${deleteId}`);
      toast.success("Product deleted successfully");
      fetchProducts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete product");
    } finally {
      setDeleteId(null);
    }
  };

  const columns = useMemo(
    () => getProductColumns(handleEdit, handleDeleteTrigger),
    [handleEdit, handleDeleteTrigger]
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            <span>Gear Store Products</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage adventure gear, outdoor apparel, climbing hardware, and camping equipment.
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          <span>Add Product</span>
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Camping & Backpacking">Camping & Backpacking</SelectItem>
            <SelectItem value="Climbing Gear">Climbing Gear</SelectItem>
            <SelectItem value="Apparel">Apparel</SelectItem>
            <SelectItem value="Footwear">Footwear</SelectItem>
            <SelectItem value="Accessories">Accessories</SelectItem>
            <SelectItem value="Navigation & Safety">Navigation & Safety</SelectItem>
          </SelectContent>
        </Select>

        <Select value={stockFilter} onValueChange={setStockFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Stock Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stock</SelectItem>
            <SelectItem value="inStock">In Stock</SelectItem>
            <SelectItem value="lowStock">Low Stock Alert</SelectItem>
            <SelectItem value="outOfStock">Out of Stock</SelectItem>
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
        searchPlaceholder="Search product by title, SKU, or brand..."
        onSearchChange={setSearch}
        isLoading={isLoading}
      />

      {/* Dialogs */}
      <ProductDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        product={selectedProduct}
        onSuccess={fetchProducts}
      />

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">
              Delete Gear Product
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this product? It will be archived and removed from the public storefront.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

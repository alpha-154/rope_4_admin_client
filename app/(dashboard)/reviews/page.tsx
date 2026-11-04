"use client";

import { DataTable } from "@/components/shared/data-table/data-table";
import { Badge } from "@/components/ui/badge/badge";
import { Button } from "@/components/ui/button/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card/card";
import { dataTablePaginationDefaultState } from "@/constants/data-table";
import { apiClient } from "@/lib/axios";
import { PaginationState, SortingState } from "@tanstack/react-table";
import { CheckCircle2, Clock, Plus, Star } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { getReviewColumns } from "./_components/columns";
import { ReviewDialog, ReviewFormData } from "./_components/review-dialog";

export default function ReviewsPage() {
  const [data, setData] = useState<ReviewFormData[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");

  const [aggregate, setAggregate] = useState<{
    averageRating: number;
    totalReviews: number;
    ratingBreakdown: Record<number, number>;
  }>({
    averageRating: 5.0,
    totalReviews: 0,
    ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });

  const [pagination, setPagination] = useState<PaginationState>(
    dataTablePaginationDefaultState
  );
  const [sorting, setSorting] = useState<SortingState>([]);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [selectedReview, setSelectedReview] = useState<ReviewFormData | null>(
    null
  );

  const fetchAggregate = useCallback(async () => {
    try {
      const res = await apiClient.get("/public/reviews/aggregate");
      if (res.data?.data) {
        setAggregate(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching aggregate rating:", err);
    }
  }, []);

  const fetchReviews = useCallback(async () => {
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

      const res = await apiClient.get("/reviews/admin", { params });
      setData(res.data?.data || []);
      setTotalCount(res.data?.meta?.total || 0);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load reviews");
    } finally {
      setIsLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, search, sorting]);

  useEffect(() => {
    fetchReviews();
    fetchAggregate();
  }, [fetchReviews, fetchAggregate]);

  const handleEdit = useCallback((review: ReviewFormData) => {
    setSelectedReview(review);
    setDialogOpen(true);
  }, []);

  const handleStatusChange = useCallback(
    async (id: string, status: string) => {
      try {
        await apiClient.patch(`/reviews/${id}`, { status });
        toast.success(`Review ${status} successfully`);
        fetchReviews();
        fetchAggregate();
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to update review");
      }
    },
    [fetchReviews, fetchAggregate]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await apiClient.delete(`/reviews/${id}`);
        toast.success("Review deleted successfully");
        fetchReviews();
        fetchAggregate();
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to delete review");
      }
    },
    [fetchReviews, fetchAggregate]
  );

  const columns = React.useMemo(
    () => getReviewColumns(handleEdit, handleStatusChange, handleDelete),
    [handleEdit, handleStatusChange, handleDelete]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Reviews & Accolades
          </h1>
          <p className="text-sm text-muted-foreground">
            Curate Google ratings, video testimonials, ambassador feedback, and partner awards.
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedReview(null);
            setDialogOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" /> Add Review
        </Button>
      </div>

      {/* Aggregate Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              <span>Average Rating</span>
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aggregate.averageRating} / 5.0</div>
            <p className="text-xs text-muted-foreground mt-1">
              Based on {aggregate.totalReviews} approved testimonials
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              <span>5-Star Testimonials</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {aggregate.ratingBreakdown?.[5] || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Top-tier five-star ratings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              <span>Total Reviews</span>
              <Clock className="h-4 w-4 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total managed in database
            </p>
          </CardContent>
        </Card>
      </div>

      <DataTable
        columns={columns}
        data={data}
        pagination={pagination}
        setPagination={setPagination}
        totalDocumentCount={totalCount}
        sorting={sorting}
        setSorting={setSorting}
        searchPlaceholder="Search reviews by author, text, program..."
        onSearchChange={setSearch}
        isLoading={isLoading}
      />

      <ReviewDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={selectedReview}
        onSuccess={() => {
          fetchReviews();
          fetchAggregate();
        }}
      />
    </div>
  );
}

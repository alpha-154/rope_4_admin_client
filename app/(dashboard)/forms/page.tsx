"use client";

import { DataTable } from "@/components/shared/data-table/data-table";
import { DeleteAlert } from "@/components/shared/delete-alert";
import { Badge } from "@/components/ui/badge/badge";
import { Button } from "@/components/ui/button/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { apiClient } from "@/lib/axios";
import {
  FileText,
  Inbox,
  Loader2,
  Mail,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { getSubmissionColumns } from "./_components/columns";
import { FormDefinitionDialog } from "./_components/form-definition-dialog";
import { SubmissionDetailDialog } from "./_components/submission-detail-dialog";

export default function FormsPage() {
  const [activeTab, setActiveTab] = useState<string>("inbox");

  // Inbox State
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [totalSubmissions, setTotalSubmissions] = useState<number>(0);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState<boolean>(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedFormSlug, setSelectedFormSlug] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  // Dialog States
  const [activeSubmission, setActiveSubmission] = useState<any | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);

  // Form Definitions State
  const [definitions, setDefinitions] = useState<any[]>([]);
  const [isLoadingDefinitions, setIsLoadingDefinitions] = useState<boolean>(false);
  const [activeDefinition, setActiveDefinition] = useState<any | null>(null);
  const [isDefDialogOpen, setIsDefDialogOpen] = useState<boolean>(false);

  // Fetch Submissions
  const fetchSubmissions = useCallback(async () => {
    try {
      setIsLoadingSubmissions(true);
      const params: Record<string, any> = {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
      };

      if (selectedStatus !== "all") {
        params.status = selectedStatus;
      }
      if (selectedFormSlug !== "all") {
        params.formSlug = selectedFormSlug;
      }
      if (searchTerm) {
        params.search = searchTerm;
      }

      const res = await apiClient.get("/admin/forms/submissions/inbox", { params });
      setSubmissions(res.data?.data || []);
      setTotalSubmissions(res.data?.meta?.total || 0);
    } catch (err: any) {
      console.error("Fetch submissions error:", err);
      toast.error(err.response?.data?.message || "Failed to load submissions inbox");
    } finally {
      setIsLoadingSubmissions(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, selectedStatus, selectedFormSlug, searchTerm]);

  // Fetch Definitions
  const fetchDefinitions = useCallback(async () => {
    try {
      setIsLoadingDefinitions(true);
      const res = await apiClient.get("/admin/forms");
      setDefinitions(res.data?.data || []);
    } catch (err: any) {
      console.error("Fetch definitions error:", err);
      toast.error(err.response?.data?.message || "Failed to load form definitions");
    } finally {
      setIsLoadingDefinitions(false);
    }
  }, []);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  useEffect(() => {
    fetchDefinitions();
  }, [fetchDefinitions]);

  // Handlers
  const handleViewSubmission = React.useCallback((sub: any) => {
    setActiveSubmission(sub);
    setIsDetailOpen(true);
  }, []);

  const handleDeleteSubmission = React.useCallback(async (id: string) => {
    try {
      await apiClient.delete(`/admin/forms/submissions/${id}`);
      toast.success("Submission deleted successfully");
      fetchSubmissions();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete submission");
    }
  }, [fetchSubmissions]);

  const handleEditDefinition = (def: any) => {
    setActiveDefinition(def);
    setIsDefDialogOpen(true);
  };

  const handleCreateDefinition = () => {
    setActiveDefinition(null);
    setIsDefDialogOpen(true);
  };

  const handleDeleteDefinition = async (id: string) => {
    try {
      await apiClient.delete(`/admin/forms/${id}`);
      toast.success("Form definition deleted");
      fetchDefinitions();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete form");
    }
  };

  const submissionColumns = React.useMemo(
    () => getSubmissionColumns(handleViewSubmission, handleDeleteSubmission),
    [handleViewSubmission, handleDeleteSubmission]
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Forms & Inquiries Inbox</h1>
          <p className="text-sm text-muted-foreground">
            Manage incoming traveler inquiries, booking requests, and custom form schemas.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === "inbox" ? (
            <Button
              variant="outline"
              size="sm"
              onClick={fetchSubmissions}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
          ) : (
            <Button onClick={handleCreateDefinition} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              <span>Create Form</span>
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 w-full max-w-sm">
          <TabsTrigger value="inbox" className="gap-2">
            <Inbox className="h-4 w-4" />
            <span>Inquiries ({totalSubmissions})</span>
          </TabsTrigger>
          <TabsTrigger value="definitions" className="gap-2">
            <FileText className="h-4 w-4" />
            <span>Form Schemas ({definitions.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* ======================================================== */}
        {/* TAB 1: INQUIRIES INBOX */}
        {/* ======================================================== */}
        <TabsContent value="inbox" className="space-y-4">
          {/* Status Filter Chips & Form Selector */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-muted/30 border border-border rounded-lg">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: "all", label: "All" },
                { id: "new", label: "New" },
                { id: "in_progress", label: "In Progress" },
                { id: "responded", label: "Responded" },
                { id: "archived", label: "Archived" },
              ].map((chip) => (
                <Button
                  key={chip.id}
                  variant={selectedStatus === chip.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => {
                    setSelectedStatus(chip.id);
                    setPagination((p) => ({ ...p, pageIndex: 0 }));
                  }}
                  className="h-8 text-xs font-medium"
                >
                  {chip.label}
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground whitespace-nowrap">Filter Form:</span>
              <Select
                value={selectedFormSlug}
                onValueChange={(val) => {
                  setSelectedFormSlug(val);
                  setPagination((p) => ({ ...p, pageIndex: 0 }));
                }}
              >
                <SelectTrigger className="w-[180px] h-8 text-xs">
                  <SelectValue placeholder="All Forms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Forms</SelectItem>
                  {definitions.map((def) => (
                    <SelectItem key={def.slug} value={def.slug}>
                      {def.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Submissions DataTable */}
          <DataTable
            columns={submissionColumns}
            data={submissions}
            pagination={pagination}
            setPagination={setPagination}
            totalDocumentCount={totalSubmissions}
            searchPlaceholder="Search by name, email, or phone..."
            onSearchChange={(val) => setSearchTerm(val)}
            isLoading={isLoadingSubmissions}
          />
        </TabsContent>

        {/* ======================================================== */}
        {/* TAB 2: FORM DEFINITIONS */}
        {/* ======================================================== */}
        <TabsContent value="definitions" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {definitions.map((def: any) => (
              <Card key={def._id} className="flex flex-col justify-between hover:border-primary/50 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-base font-bold">{def.name}</CardTitle>
                      <CardDescription className="text-xs font-mono mt-1">
                        slug: /{def.slug}
                      </CardDescription>
                    </div>
                    <Badge variant={def.isActive ? "default" : "secondary"} className="text-[10px]">
                      {def.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pb-3 text-xs">
                  <p className="text-muted-foreground line-clamp-2">
                    {def.description || "General inquiry form for website visitors."}
                  </p>

                  <div className="pt-2 border-t space-y-1.5">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Fields:</span>
                      <span className="font-semibold text-foreground">
                        {def.fields?.length || 0} inputs
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Staff Alerts:</span>
                      <span className="font-semibold text-foreground truncate max-w-[140px]">
                        {def.notificationEmails?.length || 0} recipient(s)
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-3 border-t flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditDefinition(def)}
                    className="gap-1.5 text-xs"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    <span>Edit Form</span>
                  </Button>

                  <DeleteAlert
                    onConfirm={() => handleDeleteDefinition(def._id)}
                    title={`Delete Form "${def.name}"?`}
                    description="This form will no longer accept new submissions on the website."
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </DeleteAlert>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Submission Detail Modal */}
      <SubmissionDetailDialog
        submission={activeSubmission}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onStatusUpdated={fetchSubmissions}
      />

      {/* Form Definition Modal */}
      <FormDefinitionDialog
        form={activeDefinition}
        open={isDefDialogOpen}
        onOpenChange={setIsDefDialogOpen}
        onSuccess={fetchDefinitions}
      />
    </div>
  );
}

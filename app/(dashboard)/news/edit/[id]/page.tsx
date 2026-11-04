"use client";

import { apiClient } from "@/lib/axios";
import { Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { NewsForm, NewsFormData } from "../../_components/news-form";

export default function EditNewsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [news, setNews] = useState<NewsFormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchNews = async () => {
      setIsLoading(true);
      try {
        const res = await apiClient.get(`/news/admin/${id}`);
        setNews(res.data?.data);
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to load article");
        router.push("/news");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, [id, router]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading article details...</p>
      </div>
    );
  }

  if (!news) {
    return null;
  }

  return <NewsForm initialData={news} isEditing={true} />;
}


"use client";

import { apiClient } from "@/lib/axios";
import { Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { ProgramForm, ProgramFormData } from "../../_components/program-form";

export default function EditProgramPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [program, setProgram] = useState<ProgramFormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchProgram = async () => {
      setIsLoading(true);
      try {
        const res = await apiClient.get(`/programs/admin/${id}`);
        setProgram(res.data?.data);
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to load program");
        router.push("/programs");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgram();
  }, [id, router]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading program details...</p>
      </div>
    );
  }

  if (!program) {
    return null;
  }

  return <ProgramForm initialData={program} isEditing={true} />;
}

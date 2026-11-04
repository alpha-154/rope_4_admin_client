"use client";

import { apiClient } from "@/lib/axios";
import { cn } from "@/lib/utils";
import { ImagePlus, Loader2, Trash2, UploadCloud } from "lucide-react";
import Image from "next/image";
import React, { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button/button";

interface UploadFilesProps {
  value?: string | string[];
  onChange: (url: string | string[]) => void;
  folder?: string;
  multiple?: boolean;
  maxSizeMB?: number;
  className?: string;
}

export function UploadFiles({
  value,
  onChange,
  folder = "general",
  multiple = false,
  maxSizeMB = 10,
  className,
}: UploadFilesProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const images: string[] = Array.isArray(value)
    ? value
    : value
      ? [value]
      : [];

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);

    // Validate size and mime
    for (const file of fileList) {
      if (!file.type.startsWith("image/")) {
        toast.error(`File ${file.name} is not a valid image format.`);
        return;
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast.error(`File ${file.name} exceeds max limit of ${maxSizeMB}MB.`);
        return;
      }
    }

    setIsUploading(true);
    const toastId = toast.loading("Uploading image...");

    try {
      if (multiple) {
        const formData = new FormData();
        fileList.forEach((f) => formData.append("files", f));
        formData.append("folder", folder);

        const res = await apiClient.post("/admin/storage/upload-multiple", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        const uploadedUrls = res.data?.data?.map((item: any) => item.url) || [];
        toast.dismiss(toastId);
        toast.success(`Successfully uploaded ${uploadedUrls.length} file(s).`);
        onChange([...images, ...uploadedUrls]);
      } else {
        const formData = new FormData();
        formData.append("file", fileList[0]);
        formData.append("folder", folder);

        const res = await apiClient.post("/admin/storage/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        const url = res.data?.data?.url;
        toast.dismiss(toastId);
        toast.success("Image uploaded successfully.");
        onChange(url);
      }
    } catch (err: any) {
      toast.dismiss(toastId);
      const msg = err.response?.data?.message || "Failed to upload file.";
      toast.error(msg);
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = (indexToRemove: number) => {
    if (multiple) {
      const updated = images.filter((_, idx) => idx !== indexToRemove);
      onChange(updated);
    } else {
      onChange("");
    }
  };

  const getFullUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const baseApi = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
    const origin = baseApi.replace(/\/api\/v1\/?$/, "");
    return `${origin}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  return (
    <div className={cn("space-y-3", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />

      {/* Drag & Drop Zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors bg-muted/20 hover:bg-muted/40",
          isDragOver ? "border-primary bg-primary/5" : "border-border",
          isUploading && "pointer-events-none opacity-60"
        )}
      >
        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-center">
            <UploadCloud className="w-8 h-8 text-muted-foreground" />
            <div className="text-sm font-medium">
              Click to upload or drag & drop
            </div>
            <p className="text-xs text-muted-foreground">
              PNG, JPG, WEBP, GIF up to {maxSizeMB}MB
            </p>
          </div>
        )}
      </div>

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
          {images.map((imgUrl, index) => (
            <div
              key={index}
              className="group relative aspect-video rounded-md overflow-hidden border bg-background"
            >
              <Image
                src={getFullUrl(imgUrl)}
                alt={`Uploaded image ${index + 1}`}
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="h-7 w-7"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(index);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


"use client";

import { cn } from "@/lib/utils";
import { ImageOff, Plus, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input/input";

interface ImageUrlInputProps {
  value?: string | string[];
  onChange: (url: string | string[]) => void;
  multiple?: boolean;
  placeholder?: string;
  className?: string;
}

function Thumb({ src }: { src: string }) {
  const [broken, setBroken] = useState(false);
  const trimmed = src.trim();
  if (!trimmed) {
    return (
      <div className="h-10 w-10 shrink-0 rounded-md border border-dashed bg-muted/40" />
    );
  }
  return (
    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md border bg-muted/40 flex items-center justify-center">
      {broken ? (
        <ImageOff className="h-4 w-4 text-muted-foreground" />
      ) : (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={trimmed}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setBroken(true)}
          onLoad={() => setBroken(false)}
        />
      )}
    </div>
  );
}

/**
 * Image URL field: paste one URL (or a list when `multiple`) instead of uploading a file.
 * Same value/onChange contract as the old UploadFiles component.
 */
export function ImageUrlInput({
  value,
  onChange,
  multiple = false,
  placeholder = "https://example.com/image.jpg",
  className,
}: ImageUrlInputProps) {
  if (!multiple) {
    const url =
      typeof value === "string"
        ? value
        : Array.isArray(value)
          ? value[0] || ""
          : "";
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <Thumb key={url} src={url} />
        <Input
          type="url"
          value={url}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      </div>
    );
  }

  const urls = Array.isArray(value) ? value : value ? [value] : [];
  const update = (idx: number, next: string) =>
    onChange(urls.map((u, i) => (i === idx ? next : u)));
  const remove = (idx: number) => onChange(urls.filter((_, i) => i !== idx));
  const add = () => onChange([...urls, ""]);

  return (
    <div className={cn("space-y-2", className)}>
      {urls.length === 0 && (
        <p className="text-xs text-muted-foreground">
          No images yet. Add an image URL.
        </p>
      )}
      {urls.map((u, idx) => (
        <div key={idx} className="flex items-center gap-3">
          <Thumb key={u} src={u} />
          <Input
            type="url"
            value={u}
            onChange={(e) => update(idx, e.target.value)}
            placeholder={placeholder}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => remove(idx)}
            className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
            title="Remove image"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={add}
        className="gap-1"
      >
        <Plus className="h-4 w-4" />
        <span>Add Image URL</span>
      </Button>
    </div>
  );
}

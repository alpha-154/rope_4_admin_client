"use client";

import { Button } from "@/components/ui/button/button";
import { cn } from "@/lib/utils";
import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor } from "@tiptap/react";
import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  Maximize2,
  Minimize2,
  Quote,
  Redo,
  Strikethrough,
  Undo,
} from "lucide-react";
import React, { useEffect, useState } from "react";

interface TipTapEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  editable?: boolean;
  className?: string;
  minHeight?: string;
}

export function TipTapEditor({
  value = "",
  onChange,
  editable = true,
  className,
  minHeight = "200px",
}: TipTapEditorProps) {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [viewHtml, setViewHtml] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
    ],
    content: value,
    editable,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm dark:prose-invert max-w-none focus:outline-none p-4",
          "min-h-[160px]"
        ),
      },
    },
  });

  // Sync content if value changes externally
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, false);
    }
  }, [value, editor]);

  if (!editor) {
    return (
      <div className="rounded-md border p-4 text-sm text-muted-foreground">
        Loading editor...
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-md border bg-background transition-all",
        isFullScreen &&
          "fixed inset-4 z-50 flex flex-col bg-background shadow-2xl overflow-hidden",
        className
      )}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b bg-muted/30 p-2">
        <Button
          type="button"
          variant={editor.isActive("bold") ? "secondary" : "ghost"}
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editable}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive("italic") ? "secondary" : "ghost"}
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editable}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive("strike") ? "secondary" : "ghost"}
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editable}
          title="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive("code") ? "secondary" : "ghost"}
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => editor.chain().focus().toggleCode().run()}
          disabled={!editable}
          title="Code"
        >
          <Code className="h-4 w-4" />
        </Button>

        <div className="h-4 w-[1px] bg-border mx-1" />

        <Button
          type="button"
          variant={
            editor.isActive("heading", { level: 1 }) ? "secondary" : "ghost"
          }
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          disabled={!editable}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={
            editor.isActive("heading", { level: 2 }) ? "secondary" : "ghost"
          }
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          disabled={!editable}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={
            editor.isActive("heading", { level: 3 }) ? "secondary" : "ghost"
          }
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          disabled={!editable}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </Button>

        <div className="h-4 w-[1px] bg-border mx-1" />

        <Button
          type="button"
          variant={editor.isActive("bulletList") ? "secondary" : "ghost"}
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          disabled={!editable}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive("orderedList") ? "secondary" : "ghost"}
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          disabled={!editable}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive("blockquote") ? "secondary" : "ghost"}
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          disabled={!editable}
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </Button>

        <div className="h-4 w-[1px] bg-border mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo() || !editable}
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo() || !editable}
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </Button>

        <div className="ml-auto flex items-center gap-1">
          <Button
            type="button"
            variant={viewHtml ? "secondary" : "ghost"}
            size="sm"
            className="h-8 px-2 text-xs"
            onClick={() => setViewHtml(!viewHtml)}
          >
            {viewHtml ? "Visual" : "HTML"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setIsFullScreen(!isFullScreen)}
            title={isFullScreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullScreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Editor Content or Raw HTML */}
      <div
        className={cn("overflow-auto", isFullScreen && "flex-1")}
        style={{ minHeight: isFullScreen ? "100%" : minHeight }}
      >
        {viewHtml ? (
          <textarea
            value={editor.getHTML()}
            onChange={(e) => {
              editor.commands.setContent(e.target.value, false);
              onChange?.(e.target.value);
            }}
            className="w-full h-full min-h-[160px] p-4 font-mono text-xs bg-muted/20 outline-none resize-none"
          />
        ) : (
          <EditorContent editor={editor} />
        )}
      </div>
    </div>
  );
}


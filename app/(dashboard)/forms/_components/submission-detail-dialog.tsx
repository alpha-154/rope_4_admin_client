"use client";

import { Badge } from "@/components/ui/badge/badge";
import { Button } from "@/components/ui/button/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog/dialog";
import { Label } from "@/components/ui/label/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select/select";
import { Textarea } from "@/components/ui/textarea/textarea";
import { apiClient } from "@/lib/axios";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Globe,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  Send,
  User,
} from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

interface SubmissionDetailDialogProps {
  submission: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusUpdated: () => void;
}

export function SubmissionDetailDialog({
  submission,
  open,
  onOpenChange,
  onStatusUpdated,
}: SubmissionDetailDialogProps) {
  const [currentStatus, setCurrentStatus] = useState<string>(
    submission?.status || "new"
  );
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [notes, setNotes] = useState<any[]>(submission?.notes || []);

  React.useEffect(() => {
    if (submission) {
      setCurrentStatus(submission.status || "new");
      setNotes(submission.notes || []);
    }
  }, [submission]);

  if (!submission) return null;

  const handleStatusChange = async (newStatus: string) => {
    try {
      setIsUpdatingStatus(true);
      await apiClient.patch(`/admin/forms/submissions/${submission._id}/status`, {
        status: newStatus,
      });
      setCurrentStatus(newStatus);
      toast.success(`Inquiry status updated to ${newStatus}`);
      onStatusUpdated();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    try {
      setIsAddingNote(true);
      const res = await apiClient.post(
        `/admin/forms/submissions/${submission._id}/notes`,
        { note: newNote }
      );
      const updatedNotes = res.data?.data?.notes || [
        ...notes,
        { author: "You", note: newNote, createdAt: new Date().toISOString() },
      ];
      setNotes(updatedNotes);
      setNewNote("");
      toast.success("Staff note added");
      onStatusUpdated();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add note");
    } finally {
      setIsAddingNote(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <DialogTitle className="text-xl">
                {submission.formName || "Inquiry Submission"}
              </DialogTitle>
              <DialogDescription>
                Submitted on {new Date(submission.createdAt).toLocaleString()}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={currentStatus}
                onValueChange={handleStatusChange}
                disabled={isUpdatingStatus}
              >
                <SelectTrigger className="w-[140px] h-8 text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="responded">Responded</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Submitter Quick Contact Card */}
          <div className="p-4 rounded-lg bg-muted/40 border border-border grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium truncate">
                {submission.submitterName || "Anonymous"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a
                href={`mailto:${submission.submitterEmail}`}
                className="text-primary hover:underline truncate"
              >
                {submission.submitterEmail || "No Email"}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">{submission.submitterPhone || "No Phone"}</span>
            </div>
          </div>

          {/* Form Fields Data Table */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">Submitted Details</h3>
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  {Object.entries(submission.data || {}).map(([key, value], idx) => (
                    <tr
                      key={key}
                      className={idx % 2 === 0 ? "bg-muted/20" : "bg-card"}
                    >
                      <td className="py-2 px-3 font-medium text-muted-foreground text-xs uppercase tracking-wider w-1/3 border-b border-border">
                        {key.replace(/([A-Z])/g, " $1")}
                      </td>
                      <td className="py-2 px-3 text-foreground border-b border-border font-normal break-words">
                        {typeof value === "object"
                          ? JSON.stringify(value, null, 2)
                          : String(value ?? "")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Brevo Email Status Notification */}
          <div className="p-3 rounded-lg border border-border bg-card flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>Email Delivery:</span>
              <Badge
                variant={submission.emailSent ? "default" : "secondary"}
                className="text-[10px]"
              >
                {submission.emailSent ? "Dispatched" : "Simulated / Logged"}
              </Badge>
            </div>
            {submission.emailLog && (
              <span className="text-muted-foreground truncate max-w-[280px]">
                {submission.emailLog}
              </span>
            )}
          </div>

          {/* Internal Staff Notes Thread */}
          <div className="space-y-3 pt-2 border-t">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <MessageSquare className="h-4 w-4" />
              <span>Internal Staff Notes ({notes.length})</span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {notes.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">
                  No staff notes added yet.
                </p>
              ) : (
                notes.map((noteItem: any, nIdx: number) => (
                  <div
                    key={nIdx}
                    className="p-3 rounded-md bg-muted/40 border border-border text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        {noteItem.author}
                      </span>
                      <span>
                        {new Date(noteItem.createdAt || Date.now()).toLocaleTimeString(
                          [],
                          { hour: "2-digit", minute: "2-digit" }
                        )}
                      </span>
                    </div>
                    <p className="text-foreground whitespace-pre-wrap">{noteItem.note}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddNote} className="flex gap-2">
              <Textarea
                rows={2}
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add note for fellow guides or staff..."
                className="text-xs"
              />
              <Button
                type="submit"
                size="sm"
                disabled={isAddingNote || !newNote.trim()}
                className="self-end gap-1 h-9"
              >
                {isAddingNote ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                <span>Post</span>
              </Button>
            </form>
          </div>
        </div>

        <DialogFooter className="border-t pt-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

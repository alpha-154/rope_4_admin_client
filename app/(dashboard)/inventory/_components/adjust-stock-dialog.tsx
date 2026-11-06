"use client";

import { Button } from "@/components/ui/button/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog/dialog";
import { Input } from "@/components/ui/input/input";
import { Label } from "@/components/ui/label/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select/select";
import { apiClient } from "@/lib/axios";
import { Loader2 } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

interface AdjustStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: { _id: string; title: string; sku: string; stockQuantity: number } | null;
  onSuccess: () => void;
}

export function AdjustStockDialog({
  open,
  onOpenChange,
  product,
  onSuccess,
}: AdjustStockDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [type, setType] = useState<string>("PURCHASE_RECEIPT");
  const [quantity, setQuantity] = useState<number>(5);
  const [reason, setReason] = useState<string>("");
  const [referenceId, setReferenceId] = useState<string>("");

  if (!product) return null;

  const currentStock = product.stockQuantity || 0;
  // If type is damage discard, quantity delta is negative
  const isDeduction = type === "DAMAGE_DISCARD";
  const effectiveChange = isDeduction ? -Math.abs(quantity) : Math.abs(quantity);
  const projectedStock = currentStock + effectiveChange;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity === 0) {
      toast.error("Adjustment quantity must be greater than 0");
      return;
    }
    if (projectedStock < 0) {
      toast.error("Resulting stock cannot be less than 0");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post("/admin/inventory/adjust", {
        productId: product._id,
        type,
        quantityChange: effectiveChange,
        reason: reason.trim() || undefined,
        referenceId: referenceId.trim() || undefined,
      });

      toast.success("Inventory adjusted and audit log created");
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to adjust inventory");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust Stock Inventory</DialogTitle>
          <DialogDescription>
            Record stock movements, physical inventory counts, supplier receipts, or write-offs.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Target Product Summary */}
          <div className="p-3 bg-muted rounded-lg border text-sm space-y-1">
            <div className="font-semibold text-foreground truncate">
              {product.title}
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-mono">{product.sku}</span>
              <span>
                Current On-Hand: <strong className="text-foreground">{currentStock}</strong> units
              </span>
            </div>
          </div>

          {/* Adjustment Type */}
          <div className="space-y-1.5">
            <Label>Adjustment Type *</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PURCHASE_RECEIPT">
                  Purchase / Supplier Receipt (+ Inflow)
                </SelectItem>
                <SelectItem value="MANUAL_ADJUSTMENT">
                  Manual Recount / Correction (+/-)
                </SelectItem>
                <SelectItem value="DAMAGE_DISCARD">
                  Damage / Write-Off (- Outflow)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quantity Change */}
          <div className="space-y-1.5">
            <Label htmlFor="qty">
              {isDeduction ? "Units to Deduct *" : "Units to Add *"}
            </Label>
            <Input
              id="qty"
              type="number"
              min="1"
              required
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
            />
          </div>

          {/* Projected Stock Preview */}
          <div className="flex items-center justify-between text-xs px-1 text-muted-foreground">
            <span>Projected New Stock:</span>
            <span
              className={`font-semibold ${
                projectedStock < 0 ? "text-destructive" : "text-foreground"
              }`}
            >
              {currentStock} {effectiveChange >= 0 ? `+ ${effectiveChange}` : `- ${Math.abs(effectiveChange)}`} = {projectedStock} units
            </span>
          </div>

          {/* Reference ID */}
          <div className="space-y-1.5">
            <Label htmlFor="ref">Reference ID (Optional)</Label>
            <Input
              id="ref"
              placeholder="e.g. PO-2026-081, SHIP-4412"
              value={referenceId}
              onChange={(e) => setReferenceId(e.target.value)}
            />
          </div>

          {/* Reason */}
          <div className="space-y-1.5">
            <Label htmlFor="reason">Reason / Note (Optional)</Label>
            <Input
              id="reason"
              placeholder="e.g. Supplier delivery verified, or damaged in transit"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || projectedStock < 0} className="gap-2">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>Save Adjustment</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


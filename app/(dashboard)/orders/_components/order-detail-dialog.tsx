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
import { format } from "date-fns";
import {
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  Package,
  Phone,
  User,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { OrderData } from "./columns";

interface OrderDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: OrderData | null;
  onSuccess: () => void;
}

export function OrderDetailDialog({
  open,
  onOpenChange,
  order,
  onSuccess,
}: OrderDetailDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("PENDING");
  const [selectedPaymentStatus, setSelectedPaymentStatus] =
    useState<string>("PENDING");
  const [statusNote, setStatusNote] = useState<string>("");

  useEffect(() => {
    if (order) {
      setSelectedStatus(order.status || "PENDING");
      setSelectedPaymentStatus(order.paymentStatus || "PENDING");
      setStatusNote("");
    }
  }, [order, open]);

  if (!order) return null;

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiClient.patch(`/admin/orders/${order._id}/status`, {
        status: selectedStatus,
        paymentStatus: selectedPaymentStatus,
        note: statusNote.trim() || undefined,
      });

      toast.success(`Order status updated to ${selectedStatus}`);
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to update order status"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const address = order.shippingAddress;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <DialogTitle className="flex items-center gap-2 text-lg">
                <span className="font-mono">{order.orderNumber}</span>
                <Badge variant="outline" className="text-xs uppercase">
                  {order.status}
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs mt-1">
                Placed on{" "}
                {format(new Date(order.createdAt), "MMMM dd, yyyy 'at' hh:mm a")}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Customer & Shipping Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/40 p-4 rounded-lg border text-sm">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-foreground text-xs uppercase tracking-wider text-muted-foreground">
                <User className="h-3.5 w-3.5" />
                <span>Customer Contact</span>
              </div>
              <div className="font-medium text-foreground">{order.customerName}</div>
              <div className="text-xs text-muted-foreground">{order.customerEmail}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Phone className="h-3 w-3" />
                <span>{order.customerPhone}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-foreground text-xs uppercase tracking-wider text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                <span>Shipping Address</span>
              </div>
              <div className="text-xs text-foreground leading-relaxed">
                {address?.street}
                <br />
                {address?.city}
                {address?.state ? `, ${address.state}` : ""} - {address?.postalCode}
                <br />
                {address?.country || "Bangladesh"}
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Order Items ({order.items?.length || 0})
            </h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted border-b text-muted-foreground uppercase font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Item</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Price</th>
                    <th className="py-2.5 px-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {(order.items || []).map((item, idx) => (
                    <tr key={idx} className="hover:bg-muted/30">
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-foreground">
                          {item.productTitle}
                        </div>
                        <div className="text-muted-foreground font-mono text-[11px]">
                          {item.sku}
                          {item.variant?.size ? ` • Size: ${item.variant.size}` : ""}
                          {item.variant?.color ? ` • Color: ${item.variant.color}` : ""}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center font-medium">
                        {item.quantity}
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium">
                        {item.unitPrice.toLocaleString()} BDT
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold">
                        {item.subtotal.toLocaleString()} BDT
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div className="bg-muted/30 p-3 rounded-lg border space-y-1.5 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Items Subtotal:</span>
                <span className="font-medium text-foreground">
                  {order.subtotal?.toLocaleString()} BDT
                </span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Fee:</span>
                <span className="font-medium text-foreground">
                  {order.shippingFee ? `${order.shippingFee} BDT` : "Free"}
                </span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount:</span>
                  <span>-{order.discountAmount.toLocaleString()} BDT</span>
                </div>
              )}
              <div className="flex justify-between pt-1 border-t text-sm font-bold text-foreground">
                <span>Total Amount:</span>
                <span className="text-primary font-mono">
                  {order.totalAmount?.toLocaleString()} BDT
                </span>
              </div>
            </div>
          </div>

          {/* Customer Notes */}
          {order.customerNotes && (
            <div className="p-3 bg-amber-500/10 border border-amber-200 rounded-lg text-xs space-y-1">
              <span className="font-semibold text-amber-800">
                Customer Instructions / Notes:
              </span>
              <p className="text-amber-900">{order.customerNotes}</p>
            </div>
          )}

          {/* Update Status Workflow Form */}
          <form
            onSubmit={handleUpdateStatus}
            className="border-t pt-5 space-y-4 bg-card"
          >
            <h3 className="text-sm font-semibold text-foreground">
              Update Order Status & Dispatch Notes
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Workflow Status *</Label>
                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending Approval</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmed / Processing</SelectItem>
                    <SelectItem value="SHIPPED">Dispatched / Shipped</SelectItem>
                    <SelectItem value="DELIVERED">Delivered to Traveler</SelectItem>
                    <SelectItem value="CANCELLED">
                      Cancelled (Auto Restock Inventory)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Payment Status</Label>
                <Select
                  value={selectedPaymentStatus}
                  onValueChange={setSelectedPaymentStatus}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending / Unpaid</SelectItem>
                    <SelectItem value="PAID">Paid in Full</SelectItem>
                    <SelectItem value="FAILED">Payment Failed</SelectItem>
                    <SelectItem value="REFUNDED">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="statusNote">Log Note / Courier Tracking</Label>
              <Input
                id="statusNote"
                placeholder="e.g. Dispatched via RedX Tracking #REDX-88192"
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
              />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full gap-2">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>Save Status Update</span>
            </Button>
          </form>

          {/* Status Timeline History */}
          <div className="border-t pt-4 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span>Status Timeline Ledger</span>
            </h3>
            <div className="space-y-2">
              {(order.statusHistory || []).map((h, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 text-xs p-2 rounded bg-muted/40 border"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">
                        {h.status}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {format(new Date(h.timestamp), "MMM dd, yyyy hh:mm a")}
                      </span>
                    </div>
                    {h.note && <p className="text-muted-foreground">{h.note}</p>}
                    <span className="text-[10px] text-muted-foreground">
                      By: {h.changedBy || "System"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

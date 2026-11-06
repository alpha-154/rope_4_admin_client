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
import { Switch } from "@/components/ui/switch/switch";
import { apiClient } from "@/lib/axios";
import { format } from "date-fns";
import {
  Heart,
  Loader2,
  MapPin,
  Package,
  Phone,
  ShieldAlert,
  User,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { CustomerData } from "./columns";

interface CustomerDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: CustomerData | null;
  onSuccess: () => void;
}

export function CustomerDetailDialog({
  open,
  onOpenChange,
  customer,
  onSuccess,
}: CustomerDetailDialogProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    if (customer) {
      setIsBlocked(customer.isBlocked || false);
    }
  }, [customer, open]);

  if (!customer) return null;

  const handleToggleBlock = async (blocked: boolean) => {
    setIsUpdating(true);
    try {
      await apiClient.patch(`/admin/customers/${customer._id}/status`, {
        isBlocked: blocked,
      });
      setIsBlocked(blocked);
      toast.success(
        blocked
          ? "Customer account suspended"
          : "Customer account restored to active"
      );
      onSuccess();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to update customer status"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const fullName = `${customer.firstName} ${customer.lastName}`.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-base shrink-0">
              {customer.avatar ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={customer.avatar}
                  alt={fullName}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <User className="h-6 w-6" />
              )}
            </div>
            <div>
              <DialogTitle className="text-lg">{fullName}</DialogTitle>
              <DialogDescription className="text-xs">
                Traveler member since{" "}
                {format(new Date(customer.createdAt), "MMMM dd, yyyy")}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-3 bg-muted/40 p-3.5 rounded-lg border text-center">
            <div className="space-y-0.5">
              <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
                <Package className="h-3.5 w-3.5" />
                <span>Orders</span>
              </div>
              <div className="text-lg font-bold text-foreground">
                {customer.totalOrders || 0}
              </div>
            </div>

            <div className="space-y-0.5 border-x">
              <div className="text-[11px] text-muted-foreground">
                Total Spent
              </div>
              <div className="text-lg font-bold text-foreground">
                {(customer.totalSpent || 0).toLocaleString()} <span className="text-[10px] text-muted-foreground">BDT</span>
              </div>
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
                <Heart className="h-3.5 w-3.5" />
                <span>Wishlist</span>
              </div>
              <div className="text-lg font-bold text-foreground">
                {customer.wishlist?.length || 0}
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-2 text-xs">
            <h3 className="font-semibold uppercase tracking-wider text-muted-foreground">
              Contact Details
            </h3>
            <div className="bg-muted/30 p-3 rounded-lg border space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium text-foreground">{customer.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone:</span>
                <span className="font-mono text-foreground">{customer.phone || "Not provided"}</span>
              </div>
            </div>
          </div>

          {/* Shipping Addresses */}
          <div className="space-y-2 text-xs">
            <h3 className="font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              <span>Saved Shipping Addresses ({customer.shippingAddresses?.length || 0})</span>
            </h3>
            {customer.shippingAddresses && customer.shippingAddresses.length > 0 ? (
              <div className="space-y-2">
                {customer.shippingAddresses.map((addr, idx) => (
                  <div key={idx} className="p-3 bg-muted/40 rounded-lg border space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">
                        {addr.label || "Address"}
                      </span>
                      {addr.isDefault && (
                        <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                          Default
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      {addr.street}, {addr.city}
                      {addr.state ? `, ${addr.state}` : ""} - {addr.postalCode},{" "}
                      {addr.country}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground italic bg-muted/20 p-3 rounded-lg border text-center">
                No saved shipping addresses yet.
              </p>
            )}
          </div>

          {/* Account Status / Moderation */}
          <div className="p-3.5 bg-muted/40 rounded-lg border flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="suspend" className="text-sm font-semibold flex items-center gap-1.5 text-foreground cursor-pointer">
                <ShieldAlert className="h-4 w-4 text-destructive" />
                <span>Suspend Account Access</span>
              </Label>
              <p className="text-xs text-muted-foreground">
                Prevent this customer from logging in or placing new store orders.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isUpdating && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              <Switch
                id="suspend"
                checked={isBlocked}
                disabled={isUpdating}
                onCheckedChange={handleToggleBlock}
              />
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

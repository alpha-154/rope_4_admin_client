"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { apiClient } from "@/lib/axios";
import { useAuth } from "@/lib/auth-context";
import {
  Building,
  Mail,
  Phone,
  MapPin,
  Globe,
  Save,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

const orgSchema = z.object({
  name: z.string().min(2, "Organization name is required"),
  contactEmail: z.string().email("Valid email is required"),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
  currency: z.string().default("BDT"),
  timezone: z.string().default("Asia/Dhaka"),
  facebook: z.string().optional(),
  instagram: z.string().optional(),
  youtube: z.string().optional(),
  linkedin: z.string().optional(),
});

type OrgFormValues = z.infer<typeof orgSchema>;

export default function OrganizationProfilePage() {
  const { organization, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  const form = useForm<OrgFormValues>({
    resolver: zodResolver(orgSchema),
    defaultValues: {
      name: "",
      contactEmail: "",
      contactPhone: "",
      address: "",
      currency: "BDT",
      timezone: "Asia/Dhaka",
      facebook: "",
      instagram: "",
      youtube: "",
      linkedin: "",
    },
  });

  useEffect(() => {
    if (organization) {
      form.reset({
        name: organization.name || "",
        contactEmail: organization.contactEmail || "",
        contactPhone: organization.contactPhone || "",
        address: organization.address || "",
        currency: organization.settings?.currency || "BDT",
        timezone: organization.settings?.timezone || "Asia/Dhaka",
        facebook: organization.socialLinks?.facebook || "",
        instagram: organization.socialLinks?.instagram || "",
        youtube: organization.socialLinks?.youtube || "",
        linkedin: organization.socialLinks?.linkedin || "",
      });
    }
  }, [organization, form]);

  const onSubmit = async (values: OrgFormValues) => {
    setLoading(true);
    try {
      await apiClient.patch("/admin/org/profile", {
        name: values.name,
        contactEmail: values.contactEmail,
        contactPhone: values.contactPhone,
        address: values.address,
        settings: {
          currency: values.currency,
          timezone: values.timezone,
        },
        socialLinks: {
          facebook: values.facebook,
          instagram: values.instagram,
          youtube: values.youtube,
          linkedin: values.linkedin,
        },
      });

      await refreshProfile();
      toast.success("Organization profile updated successfully!");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to update profile";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Organization Profile</h1>
        <p className="text-sm text-muted-foreground">
          Manage your organization&apos;s brand identity, contact details, currency, and social links.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Core Info */}
        <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <Building className="h-4 w-4 text-primary" />
            <span>General Information</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                Organization Name
              </label>
              <input
                type="text"
                {...form.register("name")}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                Primary Contact Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  {...form.register("contactEmail")}
                  className="w-full pl-9 pr-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              {form.formState.errors.contactEmail && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.contactEmail.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                Contact Phone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  {...form.register("contactPhone")}
                  className="w-full pl-9 pr-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                Physical Office Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  {...form.register("address")}
                  className="w-full pl-9 pr-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Currency & Localization */}
        <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            <span>Localization & Settings</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                Primary Currency Code
              </label>
              <input
                type="text"
                {...form.register("currency")}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="BDT"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                Timezone
              </label>
              <input
                type="text"
                {...form.register("timezone")}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Asia/Dhaka"
              />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
          <h2 className="text-base font-semibold">Social Media Channels</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Facebook URL</label>
              <input
                type="url"
                {...form.register("facebook")}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="https://facebook.com/rope4"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Instagram URL</label>
              <input
                type="url"
                {...form.register("instagram")}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="https://instagram.com/rope4"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">YouTube URL</label>
              <input
                type="url"
                {...form.register("youtube")}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="https://youtube.com/@rope4"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">LinkedIn URL</label>
              <input
                type="url"
                {...form.register("linkedin")}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="https://linkedin.com/company/rope4"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}


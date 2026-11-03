"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mountain, Lock, Mail, User, Building, Phone, MapPin, Loader2, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  organizationName: z.string().min(2, "Organization name must be at least 2 characters"),
  contactEmail: z.string().email("Valid organization email is required"),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
  ownerFirstName: z.string().min(2, "First name is required"),
  ownerLastName: z.string().min(2, "Last name is required"),
  ownerEmail: z.string().email("Valid owner email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const { login, registerOrg } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "admin@rope4.org",
      password: "admin123",
    },
  });

  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      organizationName: "Rope4 Outdoor Education",
      contactEmail: "contact@rope4.org",
      contactPhone: "+880 1700-000000",
      address: "Dhaka, Bangladesh",
      ownerFirstName: "Mohiuddin",
      ownerLastName: "Mahi",
      ownerEmail: "admin@rope4.org",
      password: "admin123",
    },
  });

  const onLoginSubmit = async (data: LoginValues) => {
    setSubmitting(true);
    try {
      await login(data.email, data.password);
      toast.success("Welcome back to Rope4!");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to sign in. Please verify your credentials.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const onRegisterSubmit = async (data: RegisterValues) => {
    setSubmitting(true);
    try {
      await registerOrg({
        organizationName: data.organizationName,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        address: data.address,
        owner: {
          firstName: data.ownerFirstName,
          lastName: data.ownerLastName,
          email: data.ownerEmail,
          password: data.password,
        },
      });
      toast.success("Organization and SuperAdmin registered successfully!");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Registration failed. An organization with this name or email may already exist.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-8 pb-4 text-center space-y-3">
          <div className="h-12 w-12 rounded-xl bg-primary mx-auto flex items-center justify-center text-primary-foreground shadow-md">
            <Mountain className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Rope4 Admin Portal</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Outdoor Education & Adventure Platform Management
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex rounded-lg bg-muted p-1 text-xs font-semibold mt-4">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 py-1.5 rounded-md transition-colors ${
                mode === "login"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Staff Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`flex-1 py-1.5 rounded-md transition-colors ${
                mode === "register"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Register Organization
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-8 pt-4">
          {mode === "login" ? (
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    {...loginForm.register("email")}
                    className="w-full pl-9 pr-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="staff@rope4.org"
                  />
                </div>
                {loginForm.formState.errors.email && (
                  <p className="text-xs text-destructive">
                    {loginForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="password"
                    {...loginForm.register("password")}
                    className="w-full pl-9 pr-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="••••••••"
                  />
                </div>
                {loginForm.formState.errors.password && (
                  <p className="text-xs text-destructive">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 py-2.5 px-4 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Organization Name</label>
                <div className="relative">
                  <Building className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    {...registerForm.register("organizationName")}
                    className="w-full pl-9 pr-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Rope4 Outdoor Education"
                  />
                </div>
                {registerForm.formState.errors.organizationName && (
                  <p className="text-xs text-destructive">
                    {registerForm.formState.errors.organizationName.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Org Contact Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    {...registerForm.register("contactEmail")}
                    className="w-full pl-9 pr-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="contact@rope4.org"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Owner First Name</label>
                  <input
                    type="text"
                    {...registerForm.register("ownerFirstName")}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Mohiuddin"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Owner Last Name</label>
                  <input
                    type="text"
                    {...registerForm.register("ownerLastName")}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Mahi"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Owner Login Email</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    {...registerForm.register("ownerEmail")}
                    className="w-full pl-9 pr-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="admin@rope4.org"
                  />
                </div>
                {registerForm.formState.errors.ownerEmail && (
                  <p className="text-xs text-destructive">
                    {registerForm.formState.errors.ownerEmail.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Admin Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="password"
                    {...registerForm.register("password")}
                    className="w-full pl-9 pr-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="••••••••"
                  />
                </div>
                {registerForm.formState.errors.password && (
                  <p className="text-xs text-destructive">
                    {registerForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-3 py-2.5 px-4 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <span>Create Organization & Account</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

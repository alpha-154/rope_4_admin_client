"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mountain, Lock, Mail, Loader2, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "rope4bd@gmail.com",
      password: "",
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

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-8 pb-4 text-center space-y-3">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 border border-emerald-200/80 mx-auto flex items-center justify-center text-emerald-700 shadow-xs">
            <Mountain className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Rope4 Admin Portal</h1>
            <p className="text-xs text-slate-500 mt-1">
              Outdoor Education & Adventure Platform Management
            </p>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-8 pt-4">
          <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  {...loginForm.register("email")}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-900 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                  placeholder="admin@rope4.org"
                />
              </div>
              {loginForm.formState.errors.email && (
                <p className="text-xs text-destructive">
                  {loginForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  {...loginForm.register("password")}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-900 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
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
              className="w-full mt-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
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
        </div>
      </div>
    </div>
  );
}

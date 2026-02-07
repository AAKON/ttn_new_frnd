"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { resetPassword } from "@/services/auth/auth";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [formData, setFormData] = useState({
    email,
    otp: "",
    password: "",
    password_confirmation: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.password_confirmation) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const result = await resetPassword(formData, toast);
      if (result?.status) {
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-card-shadow p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-gray-900">Reset password</h2>
        <p className="mt-2">Enter the code sent to your email</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="formLabelClasses block mb-1">OTP Code</label>
          <input type="text" name="otp" value={formData.otp} onChange={handleChange} className="input_style" placeholder="Enter 6-digit code" required />
        </div>
        <div>
          <label className="formLabelClasses block mb-1">New Password</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} className="input_style" required />
        </div>
        <div>
          <label className="formLabelClasses block mb-1">Confirm Password</label>
          <input type="password" name="password_confirmation" value={formData.password_confirmation} onChange={handleChange} className="input_style" required />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-brand-600 text-white rounded-lg py-2.5 font-semibold hover:bg-brand-700 disabled:opacity-50">
          {loading ? "Resetting..." : "Reset password"}
        </button>
      </form>

      <p className="text-center mt-6 text-sm">
        <Link href="/login" className="text-brand-600 font-semibold hover:underline">Back to login</Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}

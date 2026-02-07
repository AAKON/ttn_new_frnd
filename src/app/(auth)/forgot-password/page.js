"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { forgotPassword } from "@/services/auth/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await forgotPassword({ email }, toast);
      if (result?.status) {
        router.push(`/reset-password?email=${encodeURIComponent(email)}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-card-shadow p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-gray-900">
          Forgot password
        </h2>
        <p className="mt-2">
          Enter your email and we&apos;ll send you a reset code
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="formLabelClasses block mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input_style"
            placeholder="Enter your email"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-600 text-white rounded-lg py-2.5 font-semibold hover:bg-brand-700 disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send reset code"}
        </button>
      </form>

      <p className="text-center mt-6 text-sm">
        <Link
          href="/login"
          className="text-brand-600 font-semibold hover:underline"
        >
          Back to login
        </Link>
      </p>
    </div>
  );
}

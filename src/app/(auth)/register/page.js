"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { regAuth } from "@/services/auth/auth";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: "buyer",
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
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await regAuth(formData, toast);
      if (result?.status) {
        router.push("/login");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Registration failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-card-shadow p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-gray-900">
          Create an account
        </h2>
        <p className="mt-2">Join the textile network</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="formLabelClasses block mb-1">First Name</label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              className="input_style"
              required
            />
          </div>
          <div>
            <label className="formLabelClasses block mb-1">Last Name</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className="input_style"
              required
            />
          </div>
        </div>

        <div>
          <label className="formLabelClasses block mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="input_style"
            required
          />
        </div>

        <div>
          <label className="formLabelClasses block mb-1">I am a</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="input_style"
          >
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
            <option value="talent">Talent</option>
          </select>
        </div>

        <div>
          <label className="formLabelClasses block mb-1">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="input_style"
            required
          />
        </div>

        <div>
          <label className="formLabelClasses block mb-1">
            Confirm Password
          </label>
          <input
            type="password"
            name="password_confirmation"
            value={formData.password_confirmation}
            onChange={handleChange}
            className="input_style"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-600 text-white rounded-lg py-2.5 font-semibold hover:bg-brand-700 disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="text-center mt-6 text-sm">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-brand-600 font-semibold hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

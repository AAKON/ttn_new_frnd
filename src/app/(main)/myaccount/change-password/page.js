"use client";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { updateUserPasswordReq } from "@/services/auth/auth";

export default function ChangePasswordPage() {
  const [formData, setFormData] = useState({ current_password: "", password: "", password_confirmation: "" });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.password_confirmation) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("current_password", formData.current_password);
      fd.append("password", formData.password);
      fd.append("password_confirmation", formData.password_confirmation);
      const result = await updateUserPasswordReq(fd, toast);
      if (result?.status) setFormData({ current_password: "", password: "", password_confirmation: "" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Change Password</h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="formLabelClasses block mb-1">Current Password</label>
          <input type="password" name="current_password" value={formData.current_password} onChange={handleChange} className="input_style" required />
        </div>
        <div>
          <label className="formLabelClasses block mb-1">New Password</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} className="input_style" required />
        </div>
        <div>
          <label className="formLabelClasses block mb-1">Confirm New Password</label>
          <input type="password" name="password_confirmation" value={formData.password_confirmation} onChange={handleChange} className="input_style" required />
        </div>
        <button type="submit" disabled={loading} className="bg-brand-600 text-white rounded-lg px-6 py-2.5 font-semibold hover:bg-brand-700 disabled:opacity-50">
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}

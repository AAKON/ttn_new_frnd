"use client";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { reqNewsletter } from "@/services/common";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await reqNewsletter({ email }, toast);
      setEmail("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        className="input_style flex-1"
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-brand-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-brand-700 disabled:opacity-50 whitespace-nowrap"
      >
        {loading ? "..." : "Subscribe"}
      </button>
    </form>
  );
}

"use client";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { submitContactForm } from "@/services/contact/submitForm";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await submitContactForm(formData, toast);
      if (result?.status) setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-center mb-8">Contact Us</h1>
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="formLabelClasses block mb-1">Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="input_style" required />
              </div>
              <div>
                <label className="formLabelClasses block mb-1">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="input_style" required />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="formLabelClasses block mb-1">Phone</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="input_style" />
              </div>
              <div>
                <label className="formLabelClasses block mb-1">Subject</label>
                <input type="text" name="subject" value={formData.subject} onChange={handleChange} className="input_style" required />
              </div>
            </div>
            <div>
              <label className="formLabelClasses block mb-1">Message</label>
              <textarea name="message" value={formData.message} onChange={handleChange} className="input_style min-h-[120px]" rows={5} required />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-brand-600 text-white rounded-lg py-2.5 font-semibold hover:bg-brand-700 disabled:opacity-50">
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

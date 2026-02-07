"use client";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { getSiteSettings, updateSiteSettings } from "@/services/admin";

export default function SiteSettingsPage() {
  const [data, setData] = useState({ terms_and_conditions: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    getSiteSettings().then((d) => { if (d) setData(d); setLoading(false); });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSiteSettings(data, toast);
    } finally { setSaving(false); }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Site Settings</h1>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="formLabelClasses block mb-1">Terms & Conditions</label>
            <textarea
              value={data.terms_and_conditions || ""}
              onChange={(e) => setData({ ...data, terms_and_conditions: e.target.value })}
              className="input_style min-h-[400px] font-mono text-sm"
              rows={20}
            />
          </div>
          <button type="submit" disabled={saving} className="bg-brand-600 text-white rounded-lg px-6 py-2.5 font-semibold disabled:opacity-50">
            {saving ? "Saving..." : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
}

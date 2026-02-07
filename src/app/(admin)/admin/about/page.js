"use client";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { getAbout, updateAbout } from "@/services/admin";

export default function AboutPage() {
  const [data, setData] = useState({ title: "", description: "", partners: "", countries: "", listed_business: "", factory_people: "", global_audience: "" });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => { getAbout().then((d) => { if (d) setData(d); setLoading(false); }); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => fd.append(k, v || ""));
      if (image) fd.append("image", image);
      await updateAbout(fd, toast);
    } finally { setSaving(false); }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">About Page</h1>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="formLabelClasses block mb-1">Title</label><input type="text" value={data.title || ""} onChange={(e) => setData({ ...data, title: e.target.value })} className="input_style" /></div>
          <div><label className="formLabelClasses block mb-1">Description</label><textarea value={data.description || ""} onChange={(e) => setData({ ...data, description: e.target.value })} className="input_style min-h-[120px]" rows={5} /></div>
          <div><label className="formLabelClasses block mb-1">Image</label><input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} className="text-sm" /></div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {["partners", "countries", "listed_business", "factory_people", "global_audience"].map((f) => (
              <div key={f}><label className="formLabelClasses block mb-1 capitalize">{f.replace("_", " ")}</label><input type="text" value={data[f] || ""} onChange={(e) => setData({ ...data, [f]: e.target.value })} className="input_style" /></div>
            ))}
          </div>
          <button type="submit" disabled={saving} className="bg-brand-600 text-white rounded-lg px-6 py-2.5 font-semibold disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
        </form>
      </div>
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { companyBasicReq, getDataPreBasic } from "@/services/company";

export default function CreateCompanyPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [prepData, setPrepData] = useState(null);
  const [formData, setFormData] = useState({
    name: "", moto: "", about: "", tags: "", keywords: "", manpower: "",
    location_id: "", business_category_id: "", business_type_ids: [], certificate_ids: [],
  });

  useEffect(() => {
    getDataPreBasic().then(setPrepData).catch(() => {});
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => {
        if (Array.isArray(v)) v.forEach((id) => fd.append(`${k}[]`, id));
        else fd.append(k, v);
      });
      const result = await companyBasicReq(fd, toast);
      if (result?.status) router.push("/myaccount/companies");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Create Company</h2>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="formLabelClasses block mb-1">Company Name *</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="input_style" required />
          </div>
          <div>
            <label className="formLabelClasses block mb-1">Motto</label>
            <input type="text" name="moto" value={formData.moto} onChange={handleChange} className="input_style" />
          </div>
          <div>
            <label className="formLabelClasses block mb-1">About</label>
            <textarea name="about" value={formData.about} onChange={handleChange} className="input_style min-h-[80px]" rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="formLabelClasses block mb-1">Location</label>
              <select name="location_id" value={formData.location_id} onChange={handleChange} className="input_style">
                <option value="">Select location</option>
                {prepData?.locations?.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            <div>
              <label className="formLabelClasses block mb-1">Business Category</label>
              <select name="business_category_id" value={formData.business_category_id} onChange={handleChange} className="input_style">
                <option value="">Select category</option>
                {prepData?.businessCategories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="formLabelClasses block mb-1">Manpower</label>
              <input type="text" name="manpower" value={formData.manpower} onChange={handleChange} className="input_style" placeholder="e.g., 100-500" />
            </div>
            <div>
              <label className="formLabelClasses block mb-1">Tags</label>
              <input type="text" name="tags" value={formData.tags} onChange={handleChange} className="input_style" placeholder="Comma separated" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="bg-brand-600 text-white rounded-lg px-6 py-2.5 font-semibold hover:bg-brand-700 disabled:opacity-50">
            {loading ? "Creating..." : "Create Company"}
          </button>
        </form>
      </div>
    </div>
  );
}

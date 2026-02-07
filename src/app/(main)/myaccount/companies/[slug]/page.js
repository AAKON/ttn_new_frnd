"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { getCompanyBasic, companyBasicUpdateReq, getCompanyOverview, companyOverviewReq } from "@/services/company";

export default function EditCompanyPage() {
  const { slug } = useParams();
  const { toast } = useToast();
  const [tab, setTab] = useState("basic");
  const [company, setCompany] = useState(null);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      getCompanyBasic(slug).then((r) => setCompany(r?.data)),
      getCompanyOverview(slug).then(setOverview),
    ]).finally(() => setLoading(false));
  }, [slug]);

  const handleBasicSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", company.name || "");
      fd.append("moto", company.moto || "");
      fd.append("about", company.about || "");
      fd.append("tags", company.tags || "");
      fd.append("manpower", company.manpower || "");
      await companyBasicUpdateReq(slug, fd, toast);
    } finally { setSaving(false); }
  };

  const handleOverviewSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await companyOverviewReq(slug, overview || {}, toast);
    } finally { setSaving(false); }
  };

  if (loading) return <p>Loading...</p>;

  const tabs = [
    { key: "basic", label: "Basic Info" },
    { key: "overview", label: "Overview" },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Edit: {company?.name}</h2>
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px bg-transparent ${tab === t.key ? "border-brand-600 text-brand-600" : "border-transparent text-gray-500"}`}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {tab === "basic" && company && (
          <form onSubmit={handleBasicSubmit} className="space-y-4">
            <div>
              <label className="formLabelClasses block mb-1">Company Name</label>
              <input type="text" value={company.name || ""} onChange={(e) => setCompany({ ...company, name: e.target.value })} className="input_style" />
            </div>
            <div>
              <label className="formLabelClasses block mb-1">Motto</label>
              <input type="text" value={company.moto || ""} onChange={(e) => setCompany({ ...company, moto: e.target.value })} className="input_style" />
            </div>
            <div>
              <label className="formLabelClasses block mb-1">About</label>
              <textarea value={company.about || ""} onChange={(e) => setCompany({ ...company, about: e.target.value })} className="input_style min-h-[80px]" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="formLabelClasses block mb-1">Tags</label>
                <input type="text" value={company.tags || ""} onChange={(e) => setCompany({ ...company, tags: e.target.value })} className="input_style" />
              </div>
              <div>
                <label className="formLabelClasses block mb-1">Manpower</label>
                <input type="text" value={company.manpower || ""} onChange={(e) => setCompany({ ...company, manpower: e.target.value })} className="input_style" />
              </div>
            </div>
            <button type="submit" disabled={saving} className="bg-brand-600 text-white rounded-lg px-6 py-2.5 font-semibold disabled:opacity-50">
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        )}
        {tab === "overview" && (
          <form onSubmit={handleOverviewSubmit} className="space-y-4">
            <div>
              <label className="formLabelClasses block mb-1">Year Established</label>
              <input type="text" value={overview?.year_established || ""} onChange={(e) => setOverview({ ...overview, year_established: e.target.value })} className="input_style" />
            </div>
            <div>
              <label className="formLabelClasses block mb-1">Number of Employees</label>
              <input type="text" value={overview?.number_of_employees || ""} onChange={(e) => setOverview({ ...overview, number_of_employees: e.target.value })} className="input_style" />
            </div>
            <div>
              <label className="formLabelClasses block mb-1">Annual Revenue</label>
              <input type="text" value={overview?.annual_revenue || ""} onChange={(e) => setOverview({ ...overview, annual_revenue: e.target.value })} className="input_style" />
            </div>
            <button type="submit" disabled={saving} className="bg-brand-600 text-white rounded-lg px-6 py-2.5 font-semibold disabled:opacity-50">
              {saving ? "Saving..." : "Save Overview"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getMyCompanies } from "@/services/company";
import { Plus } from "lucide-react";

export default function MyCompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getMyCompanies()
      .then((data) => {
        console.log("Companies loaded:", data);
        setCompanies(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading companies:", err);
        setError(err?.message || "Failed to load companies");
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">My Companies</h2>
        <Link href="/myaccount/companies/create" className="bg-brand-600 text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2">
          <Plus size={16} /> Add Company
        </Link>
      </div>
      {loading ? (
        <p className="text-gray-500">Loading your companies...</p>
      ) : error ? (
        <div className="bg-white rounded-lg border border-red-200 p-6 text-center">
          <p className="text-red-600 font-semibold">Error loading companies</p>
          <p className="text-sm text-gray-500 mt-2">{error}</p>
          <button onClick={() => window.location.reload()} className="text-sm text-brand-600 font-semibold mt-4">Retry</button>
        </div>
      ) : companies.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-500">You haven&apos;t added any companies yet.</p>
          <Link href="/myaccount/companies/create" className="text-brand-600 font-semibold mt-2 inline-block">Create your first company</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {companies.map((c) => (
            <div key={c.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-card-shadow transition-shadow">
              <h3 className="font-semibold text-gray-900">{c.name}</h3>
              <p className="text-sm mt-1">{c.moto}</p>
              <div className="flex gap-3 mt-4">
                <Link href={`/myaccount/companies/${c.slug}`} className="text-sm text-brand-600 font-semibold">Edit</Link>
                <Link href={`/company/${c.slug}`} className="text-sm text-gray-500">View</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

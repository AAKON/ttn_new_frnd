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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {companies.map((company) => {
            const categories = company.business_categories || [];
            const businessType = company.business_types?.[0]?.name || null;

            return (
              <div
                key={company.id}
                className="border rounded-lg p-5 hover:shadow-card-shadow transition-shadow bg-white flex flex-col"
              >
                {/* Header */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden border flex-shrink-0 bg-gray-50 flex items-center justify-center">
                    {company.profile_pic_url || company.thumbnail_url ? (
                      <img
                        src={company.profile_pic_url || company.thumbnail_url}
                        alt={company.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg
                        className="w-6 h-6 text-brand-500"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    {businessType && (
                      <p className="text-xs font-medium text-brand-600 mb-0.5">
                        {businessType}
                      </p>
                    )}
                    <h3 className="text-base font-bold text-gray-900 truncate">
                      {company.name}
                    </h3>
                  </div>
                </div>

                {/* Business Categories */}
                {categories.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {categories.slice(0, 8).map((cat) => (
                      <span
                        key={cat.id}
                        className="text-xs text-gray-700 border border-gray-300 rounded px-2 py-0.5"
                      >
                        {cat.name}
                      </span>
                    ))}
                    {categories.length > 8 && (
                      <span className="text-xs text-gray-400 px-1 py-0.5">
                        +{categories.length - 8}
                      </span>
                    )}
                  </div>
                )}

                {/* Description */}
                {(company.about || company.moto) && (
                  <p className="text-sm text-gray-500 line-clamp-3 mb-4">
                    {company.about || company.moto}
                  </p>
                )}

                {/* Spacer to push location and buttons to bottom */}
                <div className="mt-auto">
                  {/* Location */}
                  {company.location && (
                    <div className="flex items-center justify-end gap-1.5 mb-4 text-sm text-gray-700">
                      {company.location.flag_path && (
                        <img
                          src={company.location.flag_path}
                          alt=""
                          className="w-4 h-3 object-cover rounded-sm"
                        />
                      )}
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span>{company.location.name}</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 border-t pt-4">
                    <Link
                      href={`/company/${company.slug}/edit`}
                      className="flex-1 text-center py-2 text-sm font-medium text-brand-600 border border-brand-400 rounded-md hover:bg-brand-50 transition-colors"
                    >
                      Edit Company
                    </Link>
                    <Link
                      href={`/company/${company.slug}`}
                      className="flex-1 text-center py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      View Public Profile
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

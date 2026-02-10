"use client";

import { useState, useEffect, useCallback } from "react";
import { apiRequest } from "@/utils/api";
import Link from "next/link";
import InfiniteScroll from "react-infinite-scroll-component";

export default function CompanyListingPage() {
  const [companies, setCompanies] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [filterOptions, setFilterOptions] = useState({
    locations: [],
    businessCategories: [],
    businessTypes: [],
    certificates: [],
    manpowerRanges: [],
  });

  const [filters, setFilters] = useState({
    keyword: "",
    locationId: null,
    businessCategoryIds: [],
    businessTypeIds: [],
    certificateIds: [],
    manpower: [],
  });

  const fetchFilterOptions = useCallback(async () => {
    try {
      const result = await apiRequest("company/filter-options", {
        method: "GET",
        cache: "no-store",
      });
      if (result?.data) {
        setFilterOptions({
          locations: result.data.locations || [],
          businessCategories: result.data.businessCategories || result.data.business_categories || [],
          businessTypes: result.data.businessTypes || result.data.business_types || [],
          certificates: result.data.certificates || [],
          manpowerRanges: result.data.manpowerRanges || result.data.manpower_ranges || [],
        });
      }
    } catch (error) {
      // Filter options will remain empty
    }
  }, []);

  const fetchCompanies = useCallback(
    async (pageNum = 1, reset = false) => {
      try {
        setLoading(true);
        const payload = {
          keyword: filters.keyword,
          locationId: filters.locationId,
          businessCategoryIds: filters.businessCategoryIds,
          businessTypeIds: filters.businessTypeIds,
          certificateIds: filters.certificateIds,
          manpower: filters.manpower,
          page: pageNum,
        };

        const result = await apiRequest("company/list", {
          method: "POST",
          body: payload,
          cache: "no-store",
        });

        const newCompanies = result?.data?.data || result?.data || [];
        const lastPage = result?.data?.last_page || 1;

        if (reset) {
          setCompanies(newCompanies);
        } else {
          setCompanies((prev) => [...prev, ...newCompanies]);
        }

        setHasMore(pageNum < lastPage);
        setPage(pageNum);
      } catch (error) {
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  useEffect(() => {
    fetchCompanies(1, true);
  }, [fetchCompanies]);

  const loadMore = () => {
    fetchCompanies(page + 1, false);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toggleArrayFilter = (key, id) => {
    setFilters((prev) => {
      const current = prev[key];
      const updated = current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id];
      return { ...prev, [key]: updated };
    });
  };

  const clearFilters = () => {
    setFilters({
      keyword: "",
      locationId: null,
      businessCategoryIds: [],
      businessTypeIds: [],
      certificateIds: [],
      manpower: [],
    });
  };

  return (
    <div className="container mx-auto py-10">
      <div className="text-center mb-10">
        <h1>Find Companies</h1>
        <p className="mt-3 text-lg max-w-2xl mx-auto">
          Explore textile and apparel companies from around the world
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filter Sidebar */}
        <aside className="w-full lg:w-72 shrink-0">
          <div className="border rounded-lg p-5 sticky top-4">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
              <button
                onClick={clearFilters}
                className="!bg-transparent !text-brand-600 text-sm !p-0 !font-normal hover:underline"
              >
                Clear all
              </button>
            </div>

            <div className="mb-5">
              <label className="formLabelClasses block mb-1.5">Search</label>
              <input
                type="text"
                value={filters.keyword}
                onChange={(e) => handleFilterChange("keyword", e.target.value)}
                placeholder="Company name..."
                className="input_style"
              />
            </div>

            {filterOptions.locations.length > 0 && (
              <div className="mb-5">
                <label className="formLabelClasses block mb-1.5">Location</label>
                <select
                  value={filters.locationId || ""}
                  onChange={(e) =>
                    handleFilterChange(
                      "locationId",
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  className="input_style"
                >
                  <option value="">All Locations</option>
                  {filterOptions.locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {filterOptions.businessCategories.length > 0 && (
              <div className="mb-5">
                <label className="formLabelClasses block mb-2">Business Categories</label>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {filterOptions.businessCategories.map((cat) => (
                    <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.businessCategoryIds.includes(cat.id)}
                        onChange={() => toggleArrayFilter("businessCategoryIds", cat.id)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {filterOptions.businessTypes.length > 0 && (
              <div className="mb-5">
                <label className="formLabelClasses block mb-2">Business Types</label>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {filterOptions.businessTypes.map((type) => (
                    <label key={type.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.businessTypeIds.includes(type.id)}
                        onChange={() => toggleArrayFilter("businessTypeIds", type.id)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">{type.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {filterOptions.certificates.length > 0 && (
              <div className="mb-5">
                <label className="formLabelClasses block mb-2">Certificates</label>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {filterOptions.certificates.map((cert) => (
                    <label key={cert.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.certificateIds.includes(cert.id)}
                        onChange={() => toggleArrayFilter("certificateIds", cert.id)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">{cert.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {filterOptions.manpowerRanges.length > 0 && (
              <div className="mb-5">
                <label className="formLabelClasses block mb-2">Manpower</label>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {filterOptions.manpowerRanges.map((mp) => (
                    <label key={mp.id || mp.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.manpower.includes(mp.id || mp.value)}
                        onChange={() => toggleArrayFilter("manpower", mp.id || mp.value)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">{mp.name || mp.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Company Cards */}
        <div className="flex-1">
          {loading && companies.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500">Loading companies...</p>
            </div>
          ) : companies.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No companies found matching your criteria.</p>
            </div>
          ) : (
            <InfiniteScroll
              dataLength={companies.length}
              next={loadMore}
              hasMore={hasMore}
              loader={
                <div className="text-center py-4">
                  <p className="text-gray-500">Loading more companies...</p>
                </div>
              }
              endMessage={
                <div className="text-center py-4">
                  <p className="text-gray-400 text-sm">All companies loaded</p>
                </div>
              }
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {companies.map((company) => {
                  const categories = company.business_categories || [];
                  const businessType =
                    company.business_types?.[0]?.name || null;

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
                            <svg className="w-6 h-6 text-brand-500" fill="currentColor" viewBox="0 0 24 24">
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
                        <button
                          className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full border border-brand-200 hover:bg-brand-50 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                          title={company.is_favorite ? "Remove from favorites" : "Add to favorites"}
                        >
                          <svg
                            className={`w-4 h-4 ${company.is_favorite ? "text-brand-500 fill-brand-500" : "text-brand-400"}`}
                            fill={company.is_favorite ? "currentColor" : "none"}
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                          </svg>
                        </button>
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
                          <div className="flex items-center justify-end gap-1 mb-4 text-sm text-gray-700">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {company.location.name}
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                          <Link
                            href={`/company/${company.slug}`}
                            className="flex-1 text-center py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                          >
                            View Profile
                          </Link>
                          <Link
                            href={`/company/${company.slug}?tab=contact`}
                            className="flex-1 text-center py-2 text-sm font-medium text-brand-600 border border-brand-400 rounded-md hover:bg-brand-50 transition-colors"
                          >
                            Contact
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </InfiniteScroll>
          )}
        </div>
      </div>
    </div>
  );
}

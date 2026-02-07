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
                {companies.map((company) => (
                  <Link
                    key={company.id}
                    href={`/company/${company.slug}`}
                    className="border rounded-lg p-5 hover:shadow-card-shadow transition-shadow block"
                  >
                    <div className="flex items-start gap-4">
                      {company.logo && (
                        <img
                          src={company.logo}
                          alt={company.name}
                          className="w-16 h-16 rounded-lg object-contain border"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {company.name}
                        </h3>
                        {company.moto && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {company.moto}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2 mt-3">
                          {company.location && (
                            <span className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded">
                              {company.location.name || company.location}
                            </span>
                          )}
                          {company.business_type && (
                            <span className="text-xs bg-brand-50 text-brand-700 px-2 py-1 rounded">
                              {company.business_type.name || company.business_type}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </InfiniteScroll>
          )}
        </div>
      </div>
    </div>
  );
}

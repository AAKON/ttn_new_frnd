"use client";

import { useState, useEffect, useCallback } from "react";
import { apiRequest } from "@/utils/api";
import Link from "next/link";
import InfiniteScroll from "react-infinite-scroll-component";

export default function CompanyListingPage() {
  const [companies, setCompanies] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(30);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
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

  // Hero search bar state (separate so user can type before pressing Search)
  const [heroKeyword, setHeroKeyword] = useState("");
  const [heroCategory, setHeroCategory] = useState("");
  const [heroLocation, setHeroLocation] = useState("");

  // Sidebar accordion open states
  const [openSections, setOpenSections] = useState({
    country: true,
    category: false,
    types: false,
    certificate: false,
  });

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const fetchFilterOptions = useCallback(async () => {
    try {
      const result = await apiRequest("company/filter-options", {
        method: "GET",
        cache: "no-store",
      });
      if (result?.data) {
        setFilterOptions({
          locations: result.data.locations || [],
          businessCategories:
            result.data.businessCategories ||
            result.data.business_categories ||
            [],
          businessTypes:
            result.data.businessTypes || result.data.business_types || [],
          certificates: result.data.certificates || [],
          manpowerRanges:
            result.data.manpowerRanges || result.data.manpower_ranges || [],
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
        const lastPage = result?.data?.pagination?.last_page || result?.data?.last_page || 1;
        const totalCount = result?.data?.pagination?.total || result?.data?.total || 0;
        const pp = result?.data?.pagination?.per_page || result?.data?.per_page || 30;

        if (reset) {
          setCompanies(newCompanies);
        } else {
          setCompanies((prev) => [...prev, ...newCompanies]);
        }

        setTotal(totalCount);
        setPerPage(pp);
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
    setHeroKeyword("");
    setHeroCategory("");
    setHeroLocation("");
  };

  const handleHeroSearch = () => {
    setFilters((prev) => ({
      ...prev,
      keyword: heroKeyword,
      locationId: heroLocation ? Number(heroLocation) : null,
      businessCategoryIds: heroCategory ? [Number(heroCategory)] : prev.businessCategoryIds,
    }));
  };

  const ChevronIcon = ({ open }) => (
    <svg
      className={`w-5 h-5 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-gray-50 to-white py-12 sm:py-16">
        <div className="container mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-8">
            Find Your <span className="text-brand-600">Apparel</span> Business
            Needs
          </h1>

          {/* Search Bar */}
          <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-card-shadow border border-gray-200 flex items-center px-2 sm:px-3 py-2 sm:py-2.5 gap-2 sm:gap-3">
            {/* Category Dropdown */}
            <div className="hidden sm:flex items-center shrink-0 pl-2 pr-3 border-r border-gray-300">
              <select
                value={heroCategory}
                onChange={(e) => setHeroCategory(e.target.value)}
                className="text-sm font-medium text-gray-700 bg-transparent border-none outline-none cursor-pointer pr-6 appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23667085' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 0 center",
                  backgroundSize: "1rem",
                }}
              >
                <option value="">All Categories</option>
                {filterOptions.businessCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="flex-1 flex items-center gap-2 px-2 min-w-0">
              <svg
                className="w-5 h-5 text-gray-400 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={heroKeyword}
                onChange={(e) => setHeroKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleHeroSearch()}
                placeholder="Search ..."
                className="w-full text-sm text-gray-600 bg-transparent border-none outline-none"
              />
            </div>

            {/* Location Pill */}
            <div className="hidden md:flex items-center gap-1.5 shrink-0 border border-brand-300 rounded-lg px-3 py-2 w-[140px] sm:w-[150px]">
              <svg
                className="w-5 h-5 text-brand-500 flex-shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a14.5 14.5 0 014 10 14.5 14.5 0 01-4 10 14.5 14.5 0 01-4-10 14.5 14.5 0 014-10" />
                <path d="M2 12h20" />
              </svg>
              <select
                value={heroLocation}
                onChange={(e) => setHeroLocation(e.target.value)}
                className="text-sm font-medium text-gray-700 bg-transparent border-none outline-none cursor-pointer pr-5 appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23667085' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 0 center",
                  backgroundSize: "1rem",
                }}
              >
                <option value="">Anywhere</option>
                {filterOptions.locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Button */}
            <button
              onClick={handleHeroSearch}
              className="!bg-brand-500 hover:!bg-brand-600 !text-white !px-5 sm:!px-7 !py-2 !rounded-lg text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto py-8 sm:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filter Sidebar */}
          <aside className="w-full lg:w-72 shrink-0">
            <div className="border rounded-lg sticky top-4">
              {/* Filter Header */}
              <div className="flex items-center justify-between p-5 border-b">
                <h3 className="text-lg font-bold text-gray-900">Filter</h3>
                <button
                  onClick={clearFilters}
                  className="!bg-transparent !text-brand-600 text-sm !p-0 !font-normal hover:underline flex items-center gap-1"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Clear all
                </button>
              </div>

              {/* By Country */}
              <div className="border-b">
                <button
                  onClick={() => toggleSection("country")}
                  className="flex items-center justify-between w-full p-5 text-left !bg-transparent !text-gray-900 !font-semibold text-sm"
                >
                  By Country
                  <ChevronIcon open={openSections.country} />
                </button>
                {openSections.country && (
                  <div className="px-5 pb-5">
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
                      <option value="">All Countries</option>
                      {filterOptions.locations.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* By Category */}
              <div className="border-b">
                <button
                  onClick={() => toggleSection("category")}
                  className="flex items-center justify-between w-full p-5 text-left !bg-transparent !text-gray-900 !font-semibold text-sm"
                >
                  By Category
                  <ChevronIcon open={openSections.category} />
                </button>
                {openSections.category && (
                  <div className="px-5 pb-5 max-h-48 overflow-y-auto space-y-2.5">
                    {filterOptions.businessCategories.map((cat) => (
                      <label
                        key={cat.id}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={filters.businessCategoryIds.includes(cat.id)}
                          onChange={() =>
                            toggleArrayFilter("businessCategoryIds", cat.id)
                          }
                          className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                        />
                        <span className="text-sm text-gray-600">
                          {cat.name}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* By Types */}
              <div className="border-b">
                <button
                  onClick={() => toggleSection("types")}
                  className="flex items-center justify-between w-full p-5 text-left !bg-transparent !text-gray-900 !font-semibold text-sm"
                >
                  By Types
                  <ChevronIcon open={openSections.types} />
                </button>
                {openSections.types && (
                  <div className="px-5 pb-5 max-h-48 overflow-y-auto space-y-2.5">
                    {filterOptions.businessTypes.map((type) => (
                      <label
                        key={type.id}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={filters.businessTypeIds.includes(type.id)}
                          onChange={() =>
                            toggleArrayFilter("businessTypeIds", type.id)
                          }
                          className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                        />
                        <span className="text-sm text-gray-600">
                          {type.name}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* By Certificate */}
              <div>
                <button
                  onClick={() => toggleSection("certificate")}
                  className="flex items-center justify-between w-full p-5 text-left !bg-transparent !text-gray-900 !font-semibold text-sm"
                >
                  By Certificate
                  <ChevronIcon open={openSections.certificate} />
                </button>
                {openSections.certificate && (
                  <div className="px-5 pb-5 max-h-48 overflow-y-auto space-y-2.5">
                    {filterOptions.certificates.map((cert) => (
                      <label
                        key={cert.id}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={filters.certificateIds.includes(cert.id)}
                          onChange={() =>
                            toggleArrayFilter("certificateIds", cert.id)
                          }
                          className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                        />
                        <span className="text-sm text-gray-600">
                          {cert.name}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Company Cards */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-lg font-semibold text-gray-900">
                Showing{" "}
                <span>{Math.min(companies.length, total)}</span>{" "}
                companies of <span>{total}</span>
              </p>

              {/* View Toggle */}
              <div className="flex items-center border rounded-md overflow-hidden">
                <button
                  onClick={() => setViewMode("list")}
                  className={`!p-2 !rounded-none ${
                    viewMode === "list"
                      ? "!bg-gray-100 !text-gray-900"
                      : "!bg-white !text-gray-400"
                  }`}
                  title="List view"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`!p-2 !rounded-none ${
                    viewMode === "grid"
                      ? "!bg-gray-100 !text-gray-900"
                      : "!bg-white !text-gray-400"
                  }`}
                  title="Grid view"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z" />
                  </svg>
                </button>
              </div>
            </div>

            {loading && companies.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-500">Loading companies...</p>
              </div>
            ) : companies.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-500 text-lg">
                  No companies found matching your criteria.
                </p>
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
                    <p className="text-gray-400 text-sm">
                      All companies loaded
                    </p>
                  </div>
                }
              >
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 md:grid-cols-2 gap-6"
                      : "flex flex-col gap-4"
                  }
                >
                  {companies.map((company) => {
                    const categories = company.business_categories || [];
                    const businessType =
                      company.business_types?.[0]?.name || null;

                    if (viewMode === "list") {
                      return (
                        <div
                          key={company.id}
                          className="border rounded-lg p-5 hover:shadow-card-shadow transition-shadow bg-white flex items-start gap-4"
                        >
                          <div className="w-14 h-14 rounded-full overflow-hidden border flex-shrink-0 bg-gray-50 flex items-center justify-center">
                            {company.profile_pic_url ||
                            company.thumbnail_url ? (
                              <img
                                src={
                                  company.profile_pic_url ||
                                  company.thumbnail_url
                                }
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
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                {businessType && (
                                  <p className="text-xs font-medium text-brand-600 mb-0.5">
                                    {businessType}
                                  </p>
                                )}
                                <h3 className="text-base font-bold text-gray-900">
                                  {company.name}
                                </h3>
                              </div>
                              <button
                                className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full border border-brand-200 hover:bg-brand-50 transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <svg
                                  className={`w-4 h-4 ${
                                    company.is_favorite
                                      ? "text-brand-500 fill-brand-500"
                                      : "text-brand-400"
                                  }`}
                                  fill={
                                    company.is_favorite
                                      ? "currentColor"
                                      : "none"
                                  }
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                </svg>
                              </button>
                            </div>
                            {categories.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {categories.slice(0, 6).map((cat) => (
                                  <span
                                    key={cat.id}
                                    className="text-xs text-gray-700 border border-gray-300 rounded px-2 py-0.5"
                                  >
                                    {cat.name}
                                  </span>
                                ))}
                              </div>
                            )}
                            {(company.about || company.moto) && (
                              <p className="text-sm text-gray-500 line-clamp-2 mt-2">
                                {company.about || company.moto}
                              </p>
                            )}
                            <div className="flex items-center justify-between mt-3">
                              {company.location && (
                                <div className="flex items-center gap-1 text-sm text-gray-700">
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
                                  {company.location.name}
                                </div>
                              )}
                              <div className="flex gap-3">
                                <Link
                                  href={`/company/${company.slug}`}
                                  className="text-sm font-medium text-gray-700 border border-gray-300 rounded-md px-5 py-1.5 hover:bg-gray-50 transition-colors"
                                >
                                  View Profile
                                </Link>
                                <Link
                                  href={`/company/${company.slug}?tab=contact`}
                                  className="text-sm font-medium text-brand-600 border border-brand-400 rounded-md px-5 py-1.5 hover:bg-brand-50 transition-colors"
                                >
                                  Contact
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    // Grid view (default)
                    return (
                      <div
                        key={company.id}
                        className="border rounded-lg p-5 hover:shadow-card-shadow transition-shadow bg-white flex flex-col"
                      >
                        {/* Header */}
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-12 h-12 rounded-full overflow-hidden border flex-shrink-0 bg-gray-50 flex items-center justify-center">
                            {company.profile_pic_url ||
                            company.thumbnail_url ? (
                              <img
                                src={
                                  company.profile_pic_url ||
                                  company.thumbnail_url
                                }
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
                          <button
                            className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full border border-brand-200 hover:bg-brand-50 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                            title={
                              company.is_favorite
                                ? "Remove from favorites"
                                : "Add to favorites"
                            }
                          >
                            <svg
                              className={`w-4 h-4 ${
                                company.is_favorite
                                  ? "text-brand-500 fill-brand-500"
                                  : "text-brand-400"
                              }`}
                              fill={
                                company.is_favorite ? "currentColor" : "none"
                              }
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
                              {company.location.name}
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex gap-3 border-t pt-4">
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
    </div>
  );
}

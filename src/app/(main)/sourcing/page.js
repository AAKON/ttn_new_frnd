"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { apiRequest } from "@/utils/api";
import { getSourcingFilterOptions } from "@/services/sourcing";
import Link from "next/link";
import InfiniteScroll from "react-infinite-scroll-component";

function ContactModal({ proposal, onClose }) {
  if (!proposal) return null;
  const hasContact = proposal.email || proposal.phone || proposal.whatsapp || proposal.address;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95">
        {/* Header with user info */}
        <div className="bg-gradient-to-r from-brand-500 to-brand-600 px-5 py-5 text-white relative">
          <button onClick={onClose} className="!absolute !top-3 !right-3 !bg-white/20 hover:!bg-white/30 !p-1.5 !rounded-full !text-white transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg shrink-0 border-2 border-white/30">
              {(proposal.user?.first_name || proposal.user?.name || "?")[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-white truncate">
                {proposal.user?.first_name || ""} {proposal.user?.last_name || ""}
              </p>
              {proposal.company_name && (
                <p className="text-sm text-white/80 truncate">{proposal.company_name}</p>
              )}
            </div>
          </div>
        </div>

        {/* Contact rows */}
        <div className="px-5 py-4">
          {hasContact ? (
            <div className="space-y-1">
              {proposal.email && (
                <a href={`mailto:${proposal.email}`} className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-50 transition-colors group">
                  <div className="w-9 h-9 rounded-full bg-brand-50 flex items-center justify-center shrink-0 group-hover:bg-brand-100 transition-colors">
                    <svg className="w-4 h-4 text-brand-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-400">Email</p>
                    <p className="text-sm text-gray-800 truncate">{proposal.email}</p>
                  </div>
                </a>
              )}
              {proposal.phone && (
                <a href={`tel:${proposal.phone}`} className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-50 transition-colors group">
                  <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-400">Phone</p>
                    <p className="text-sm text-gray-800">{proposal.phone}</p>
                  </div>
                </a>
              )}
              {proposal.whatsapp && (
                <a href={`https://wa.me/${proposal.whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-50 transition-colors group">
                  <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center shrink-0 group-hover:bg-green-100 transition-colors">
                    <svg className="w-4 h-4 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.75.75 0 00.917.918l4.458-1.495A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.37 0-4.567-.696-6.418-1.888l-.447-.283-3.042 1.02 1.02-3.042-.283-.447A9.96 9.96 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-400">WhatsApp</p>
                    <p className="text-sm text-gray-800">{proposal.whatsapp}</p>
                  </div>
                </a>
              )}
              {proposal.address && (
                <div className="flex items-start gap-3 px-3 py-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-400">Address</p>
                    <p className="text-sm text-gray-800">{proposal.address}</p>
                  </div>
                </div>
              )}
              {proposal.location && (
                <div className="flex items-center gap-3 px-3 py-3">
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-400">Location</p>
                    <p className="text-sm text-gray-800 flex items-center gap-1.5">
                      {proposal.location.flag_path && <img src={proposal.location.flag_path} alt="" className="w-4 h-3 object-cover rounded-sm" />}
                      {proposal.location.name}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-400 py-6 text-center">No contact information available</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SourcingListingPage() {
  const [proposals, setProposals] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(20);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [filterOptions, setFilterOptions] = useState({
    categories: [],
    locations: [],
  });

  const [filters, setFilters] = useState({
    keyword: "",
    categoryId: null,
    locationId: null,
  });

  // Hero search bar state
  const [heroKeyword, setHeroKeyword] = useState("");
  const [heroCategory, setHeroCategory] = useState("");
  const [heroLocation, setHeroLocation] = useState("");

  const [contactProposal, setContactProposal] = useState(null);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showMobileLocationDropdown, setShowMobileLocationDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showMobileCategoryDropdown, setShowMobileCategoryDropdown] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showSidebarCategoryDropdown, setShowSidebarCategoryDropdown] = useState(false);

  const locationDropdownRef = useRef(null);
  const mobileLocationDropdownRef = useRef(null);
  const categoryDropdownRef = useRef(null);
  const mobileCategoryDropdownRef = useRef(null);
  const countryDropdownRef = useRef(null);
  const sidebarCategoryDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(e.target)) setShowLocationDropdown(false);
      if (mobileLocationDropdownRef.current && !mobileLocationDropdownRef.current.contains(e.target)) setShowMobileLocationDropdown(false);
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target)) setShowCategoryDropdown(false);
      if (mobileCategoryDropdownRef.current && !mobileCategoryDropdownRef.current.contains(e.target)) setShowMobileCategoryDropdown(false);
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(e.target)) setShowCountryDropdown(false);
      if (sidebarCategoryDropdownRef.current && !sidebarCategoryDropdownRef.current.contains(e.target)) setShowSidebarCategoryDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [openSections, setOpenSections] = useState({
    country: true,
    category: false,
  });

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const fetchFilterOptions = useCallback(async () => {
    try {
      const result = await getSourcingFilterOptions();
      if (result?.data) {
        setFilterOptions({
          categories: result.data.categories || [],
          locations: result.data.locations || [],
        });
      }
    } catch (error) {
      // Filter options will remain empty
    }
  }, []);

  const fetchProposals = useCallback(
    async (pageNum = 1, reset = false) => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams();
        queryParams.append("page", pageNum);
        if (filters.keyword) queryParams.append("title", filters.keyword);
        if (filters.categoryId) queryParams.append("product_category_id", filters.categoryId);
        if (filters.locationId) queryParams.append("location_id", filters.locationId);

        const result = await apiRequest(`sourcing-proposals/list?${queryParams.toString()}`, {
          method: "GET",
          cache: "no-store",
        });

        const data = result?.data;
        const newProposals = data?.data || [];
        const pagination = data?.pagination || {};
        const lastPage = pagination.last_page || 1;
        const totalCount = pagination.total || 0;
        const pp = pagination.per_page || 20;

        if (reset) {
          setProposals(newProposals);
        } else {
          setProposals((prev) => [...prev, ...newProposals]);
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
    fetchProposals(1, true);
  }, [fetchProposals]);

  const loadMore = () => {
    fetchProposals(page + 1, false);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ keyword: "", categoryId: null, locationId: null });
    setHeroKeyword("");
    setHeroCategory("");
    setHeroLocation("");
  };

  const handleHeroSearch = () => {
    setFilters({
      keyword: heroKeyword,
      locationId: heroLocation ? Number(heroLocation) : null,
      categoryId: heroCategory ? Number(heroCategory) : null,
    });
  };

  const ChevronIcon = ({ open }) => (
    <svg
      className={`w-5 h-5 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
      fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-gray-50 to-white py-12 sm:py-16">
        <div className="container mx-auto text-center px-4">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
            Sourcing <span className="text-brand-600">Proposals</span>
          </h1>
          <p className="text-gray-500 mb-8 max-w-xl mx-auto">
            Browse sourcing proposals from buyers and suppliers worldwide
          </p>

          {/* Search Bar - Desktop */}
          <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-card-shadow border border-gray-200 hidden sm:flex items-center px-3 py-2.5 gap-3">
            {/* Category Dropdown */}
            <div className="shrink-0 relative border-r border-gray-300 pr-3" ref={categoryDropdownRef}>
              <button
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="!bg-transparent !p-0 !pl-2 flex items-center gap-1.5 !text-gray-700"
              >
                <span className="text-sm font-medium truncate max-w-[140px]">
                  {heroCategory
                    ? filterOptions.categories.find((c) => String(c.id) === String(heroCategory))?.name || "All Categories"
                    : "All Categories"}
                </span>
                <svg
                  className={`w-4 h-4 text-gray-500 flex-shrink-0 transition-transform ${showCategoryDropdown ? "rotate-180" : ""}`}
                  fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showCategoryDropdown && (
                <div className="absolute top-full left-0 mt-3 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                  <div
                    onClick={() => { setHeroCategory(""); setShowCategoryDropdown(false); }}
                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 ${!heroCategory ? "bg-brand-50 text-brand-600 font-medium" : "text-gray-700"}`}
                  >
                    All Categories
                  </div>
                  {filterOptions.categories.map((cat) => (
                    <div
                      key={cat.id}
                      onClick={() => { setHeroCategory(String(cat.id)); setShowCategoryDropdown(false); }}
                      className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 truncate ${String(heroCategory) === String(cat.id) ? "bg-brand-50 text-brand-600 font-medium" : "text-gray-700"}`}
                    >
                      {cat.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Search Input */}
            <div className="flex-1 flex items-center gap-2 px-2 min-w-0">
              <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={heroKeyword}
                onChange={(e) => setHeroKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleHeroSearch()}
                placeholder="Search proposals..."
                className="w-full text-sm text-gray-600 bg-transparent border-none outline-none"
              />
            </div>

            {/* Location Dropdown */}
            <div className="hidden md:block shrink-0 w-[150px] relative" ref={locationDropdownRef}>
              <button
                onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                className="!bg-transparent !border !border-brand-300 !rounded-lg !py-2 !px-3 !w-full flex items-center gap-1.5 !text-gray-700"
              >
                <svg className="w-5 h-5 text-brand-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a14.5 14.5 0 014 10 14.5 14.5 0 01-4 10 14.5 14.5 0 01-4-10 14.5 14.5 0 014-10" />
                  <path d="M2 12h20" />
                </svg>
                <span className="text-sm font-medium truncate flex-1 text-left">
                  {heroLocation
                    ? filterOptions.locations.find((l) => String(l.id) === String(heroLocation))?.name || "Anywhere"
                    : "Anywhere"}
                </span>
                <svg
                  className={`w-3.5 h-3.5 text-gray-500 flex-shrink-0 transition-transform ${showLocationDropdown ? "rotate-180" : ""}`}
                  fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showLocationDropdown && (
                <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                  <div
                    onClick={() => { setHeroLocation(""); setShowLocationDropdown(false); }}
                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 ${!heroLocation ? "bg-brand-50 text-brand-600 font-medium" : "text-gray-700"}`}
                  >
                    Anywhere
                  </div>
                  {filterOptions.locations.map((loc) => (
                    <div
                      key={loc.id}
                      onClick={() => { setHeroLocation(String(loc.id)); setShowLocationDropdown(false); }}
                      className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 flex items-center gap-2 ${String(heroLocation) === String(loc.id) ? "bg-brand-50 text-brand-600 font-medium" : "text-gray-700"}`}
                    >
                      {loc.flag_path && <img src={loc.flag_path} alt="" className="w-5 h-3.5 object-cover rounded-sm flex-shrink-0" />}
                      <span className="truncate">{loc.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleHeroSearch}
              className="!bg-brand-500 hover:!bg-brand-600 !text-white !px-7 !py-2 !rounded-lg text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
            >
              Search
            </button>
          </div>

          {/* Search Bar - Mobile */}
          <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-card-shadow border border-gray-200 flex flex-col gap-3 px-3 py-3 sm:hidden">
            <div className="flex items-center gap-2 px-2 border-b border-gray-200 pb-3">
              <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={heroKeyword}
                onChange={(e) => setHeroKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleHeroSearch()}
                placeholder="Search proposals..."
                className="w-full text-sm text-gray-600 bg-transparent border-none outline-none"
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 relative min-w-0" ref={mobileCategoryDropdownRef}>
                <button
                  onClick={() => setShowMobileCategoryDropdown(!showMobileCategoryDropdown)}
                  className="!bg-transparent !border !border-gray-200 !rounded-lg !py-2 !px-2 !w-full flex items-center gap-1.5 !text-gray-700 overflow-hidden"
                >
                  <span className="text-sm font-medium truncate flex-1 text-left">
                    {heroCategory
                      ? filterOptions.categories.find((c) => String(c.id) === String(heroCategory))?.name || "All Categories"
                      : "All Categories"}
                  </span>
                  <svg className={`w-3 h-3 text-gray-500 flex-shrink-0 transition-transform ${showMobileCategoryDropdown ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showMobileCategoryDropdown && (
                  <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    <div onClick={() => { setHeroCategory(""); setShowMobileCategoryDropdown(false); }} className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 ${!heroCategory ? "bg-brand-50 text-brand-600 font-medium" : "text-gray-700"}`}>All Categories</div>
                    {filterOptions.categories.map((cat) => (
                      <div key={cat.id} onClick={() => { setHeroCategory(String(cat.id)); setShowMobileCategoryDropdown(false); }} className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 truncate ${String(heroCategory) === String(cat.id) ? "bg-brand-50 text-brand-600 font-medium" : "text-gray-700"}`}>{cat.name}</div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex-1 relative min-w-0" ref={mobileLocationDropdownRef}>
                <button
                  onClick={() => setShowMobileLocationDropdown(!showMobileLocationDropdown)}
                  className="!bg-transparent !border !border-brand-300 !rounded-lg !py-2 !px-2 !w-full flex items-center gap-1.5 !text-gray-700 overflow-hidden"
                >
                  <svg className="w-4 h-4 text-brand-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 014 10 14.5 14.5 0 01-4 10 14.5 14.5 0 01-4-10 14.5 14.5 0 014-10" /><path d="M2 12h20" />
                  </svg>
                  <span className="text-sm font-medium truncate flex-1 text-left">
                    {heroLocation ? filterOptions.locations.find((l) => String(l.id) === String(heroLocation))?.name || "Anywhere" : "Anywhere"}
                  </span>
                  <svg className={`w-3 h-3 text-gray-500 flex-shrink-0 transition-transform ${showMobileLocationDropdown ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showMobileLocationDropdown && (
                  <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    <div onClick={() => { setHeroLocation(""); setShowMobileLocationDropdown(false); }} className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 ${!heroLocation ? "bg-brand-50 text-brand-600 font-medium" : "text-gray-700"}`}>Anywhere</div>
                    {filterOptions.locations.map((loc) => (
                      <div key={loc.id} onClick={() => { setHeroLocation(String(loc.id)); setShowMobileLocationDropdown(false); }} className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 flex items-center gap-2 ${String(heroLocation) === String(loc.id) ? "bg-brand-50 text-brand-600 font-medium" : "text-gray-700"}`}>
                        {loc.flag_path && <img src={loc.flag_path} alt="" className="w-5 h-3.5 object-cover rounded-sm flex-shrink-0" />}
                        <span className="truncate">{loc.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleHeroSearch} className="!bg-brand-500 hover:!bg-brand-600 !text-white !py-2.5 !rounded-lg text-sm font-semibold transition-colors flex-1">Search</button>
              <button onClick={() => setShowMobileFilter(true)} className="!bg-white !text-gray-700 !border !border-gray-300 !py-2.5 !px-4 !rounded-lg text-sm font-medium flex items-center gap-2 shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                </svg>
                Filter
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto py-8 sm:py-12 px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Filter Modal */}
          {showMobileFilter && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/40" onClick={() => setShowMobileFilter(false)} />
              <div className="absolute top-0 left-0 right-0 bg-white rounded-b-2xl max-h-[80vh] overflow-y-auto shadow-xl">
                <div className="flex items-center justify-between p-5 border-b">
                  <h3 className="text-lg font-bold text-gray-900">Filter</h3>
                  <button onClick={() => setShowMobileFilter(false)} className="!bg-transparent !text-gray-500 !p-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {/* By Country */}
                <div className="border-b">
                  <button onClick={() => toggleSection("country")} className="flex items-center justify-between w-full p-5 text-left !bg-transparent !text-gray-900 !font-semibold text-sm">
                    By Country <ChevronIcon open={openSections.country} />
                  </button>
                  {openSections.country && (
                    <div className="px-5 pb-5 relative">
                      <button onClick={() => setShowCountryDropdown(!showCountryDropdown)} className="!bg-transparent !border !border-gray-200 !rounded-md !py-2.5 !px-3.5 !w-full flex items-center justify-between !text-gray-700">
                        <span className="text-sm truncate">{filters.locationId ? filterOptions.locations.find((l) => l.id === filters.locationId)?.name || "All Countries" : "All Countries"}</span>
                        <svg className={`w-3.5 h-3.5 text-gray-500 flex-shrink-0 transition-transform ${showCountryDropdown ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                      </button>
                      {showCountryDropdown && (
                        <div className="absolute left-5 right-5 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                          <div onClick={() => { handleFilterChange("locationId", null); setShowCountryDropdown(false); }} className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 ${!filters.locationId ? "bg-brand-50 text-brand-600 font-medium" : "text-gray-700"}`}>All Countries</div>
                          {filterOptions.locations.map((loc) => (
                            <div key={loc.id} onClick={() => { handleFilterChange("locationId", loc.id); setShowCountryDropdown(false); }} className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 flex items-center gap-2 ${filters.locationId === loc.id ? "bg-brand-50 text-brand-600 font-medium" : "text-gray-700"}`}>
                              {loc.flag_path && <img src={loc.flag_path} alt="" className="w-5 h-3.5 object-cover rounded-sm flex-shrink-0" />}
                              <span className="truncate">{loc.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {/* By Category */}
                <div>
                  <button onClick={() => toggleSection("category")} className="flex items-center justify-between w-full p-5 text-left !bg-transparent !text-gray-900 !font-semibold text-sm">
                    By Category <ChevronIcon open={openSections.category} />
                  </button>
                  {openSections.category && (
                    <div className="px-5 pb-5 relative">
                      <button onClick={() => setShowSidebarCategoryDropdown(!showSidebarCategoryDropdown)} className="!bg-transparent !border !border-gray-200 !rounded-md !py-2.5 !px-3.5 !w-full flex items-center justify-between !text-gray-700">
                        <span className="text-sm truncate">{filters.categoryId ? filterOptions.categories.find((c) => c.id === filters.categoryId)?.name || "All Categories" : "All Categories"}</span>
                        <svg className={`w-3.5 h-3.5 text-gray-500 flex-shrink-0 transition-transform ${showSidebarCategoryDropdown ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                      </button>
                      {showSidebarCategoryDropdown && (
                        <div className="absolute left-5 right-5 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                          <div onClick={() => { handleFilterChange("categoryId", null); setShowSidebarCategoryDropdown(false); }} className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 ${!filters.categoryId ? "bg-brand-50 text-brand-600 font-medium" : "text-gray-700"}`}>All Categories</div>
                          {filterOptions.categories.map((cat) => (
                            <div key={cat.id} onClick={() => { handleFilterChange("categoryId", cat.id); setShowSidebarCategoryDropdown(false); }} className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 truncate ${filters.categoryId === cat.id ? "bg-brand-50 text-brand-600 font-medium" : "text-gray-700"}`}>{cat.name}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Filter Sidebar - Desktop */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="border rounded-lg sticky top-4">
              <div className="flex items-center justify-between p-5 border-b">
                <h3 className="text-lg font-bold text-gray-900">Filter</h3>
                <button onClick={clearFilters} className="!bg-transparent !text-brand-600 text-sm !p-0 !font-normal hover:underline flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear all
                </button>
              </div>

              {/* By Country */}
              <div className="border-b">
                <button onClick={() => toggleSection("country")} className="flex items-center justify-between w-full p-5 text-left !bg-transparent !text-gray-900 !font-semibold text-sm">
                  By Country <ChevronIcon open={openSections.country} />
                </button>
                {openSections.country && (
                  <div className="px-5 pb-5 relative" ref={countryDropdownRef}>
                    <button onClick={() => setShowCountryDropdown(!showCountryDropdown)} className="!bg-transparent !border !border-gray-200 !rounded-md !py-2.5 !px-3.5 !w-full flex items-center justify-between !text-gray-700">
                      <span className="text-sm truncate">{filters.locationId ? filterOptions.locations.find((l) => l.id === filters.locationId)?.name || "All Countries" : "All Countries"}</span>
                      <svg className={`w-3.5 h-3.5 text-gray-500 flex-shrink-0 transition-transform ${showCountryDropdown ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {showCountryDropdown && (
                      <div className="absolute left-5 right-5 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                        <div onClick={() => { handleFilterChange("locationId", null); setShowCountryDropdown(false); }} className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 ${!filters.locationId ? "bg-brand-50 text-brand-600 font-medium" : "text-gray-700"}`}>All Countries</div>
                        {filterOptions.locations.map((loc) => (
                          <div key={loc.id} onClick={() => { handleFilterChange("locationId", loc.id); setShowCountryDropdown(false); }} className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 flex items-center gap-2 ${filters.locationId === loc.id ? "bg-brand-50 text-brand-600 font-medium" : "text-gray-700"}`}>
                            {loc.flag_path && <img src={loc.flag_path} alt="" className="w-5 h-3.5 object-cover rounded-sm flex-shrink-0" />}
                            <span className="truncate">{loc.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* By Category */}
              <div>
                <button onClick={() => toggleSection("category")} className="flex items-center justify-between w-full p-5 text-left !bg-transparent !text-gray-900 !font-semibold text-sm">
                  By Category <ChevronIcon open={openSections.category} />
                </button>
                {openSections.category && (
                  <div className="px-5 pb-5 relative" ref={sidebarCategoryDropdownRef}>
                    <button onClick={() => setShowSidebarCategoryDropdown(!showSidebarCategoryDropdown)} className="!bg-transparent !border !border-gray-200 !rounded-md !py-2.5 !px-3.5 !w-full flex items-center justify-between !text-gray-700">
                      <span className="text-sm truncate">{filters.categoryId ? filterOptions.categories.find((c) => c.id === filters.categoryId)?.name || "All Categories" : "All Categories"}</span>
                      <svg className={`w-3.5 h-3.5 text-gray-500 flex-shrink-0 transition-transform ${showSidebarCategoryDropdown ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {showSidebarCategoryDropdown && (
                      <div className="absolute left-5 right-5 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                        <div onClick={() => { handleFilterChange("categoryId", null); setShowSidebarCategoryDropdown(false); }} className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 ${!filters.categoryId ? "bg-brand-50 text-brand-600 font-medium" : "text-gray-700"}`}>All Categories</div>
                        {filterOptions.categories.map((cat) => (
                          <div key={cat.id} onClick={() => { handleFilterChange("categoryId", cat.id); setShowSidebarCategoryDropdown(false); }} className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 truncate ${filters.categoryId === cat.id ? "bg-brand-50 text-brand-600 font-medium" : "text-gray-700"}`}>{cat.name}</div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Proposal Cards */}
          <div className="flex-1">
            {/* Active Filter Pills */}
            {(filters.keyword || filters.locationId || filters.categoryId) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {filters.keyword && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-full text-sm text-gray-700">
                    <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    {filters.keyword}
                    <button onClick={() => { handleFilterChange("keyword", ""); setHeroKeyword(""); }} className="!bg-transparent !p-0 !ml-0.5 hover:!text-gray-900 !text-gray-400">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </span>
                )}
                {filters.locationId && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-full text-sm text-gray-700">
                    <svg className="w-3.5 h-3.5 text-brand-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 014 10 14.5 14.5 0 01-4 10 14.5 14.5 0 01-4-10 14.5 14.5 0 014-10" /><path d="M2 12h20" /></svg>
                    {filterOptions.locations.find((l) => l.id === filters.locationId)?.name}
                    <button onClick={() => { handleFilterChange("locationId", null); setHeroLocation(""); }} className="!bg-transparent !p-0 !ml-0.5 hover:!text-gray-900 !text-gray-400">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </span>
                )}
                {filters.categoryId && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-full text-sm text-gray-700">
                    <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" /></svg>
                    {filterOptions.categories.find((c) => c.id === filters.categoryId)?.name}
                    <button onClick={() => { handleFilterChange("categoryId", null); setHeroCategory(""); }} className="!bg-transparent !p-0 !ml-0.5 hover:!text-gray-900 !text-gray-400">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Results Header */}
            <div className="flex items-center justify-between mb-6 bg-gray-800 lg:bg-transparent rounded-lg lg:rounded-none px-4 py-3 lg:p-0">
              <p className="text-sm lg:text-lg font-semibold text-white lg:text-gray-900">
                Showing <span>{Math.min(proposals.length, total)}</span> proposals of <span>{total}</span>
              </p>
              <div className="flex items-center gap-3">
                <Link
                  href="/sourcing/create"
                  className="text-sm font-semibold text-brand-600 hover:text-brand-700 hidden lg:inline-flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                  Create Proposal
                </Link>
                <div className="flex items-center border rounded-md overflow-hidden">
                  <button onClick={() => setViewMode("list")} className={`!p-2 !rounded-none ${viewMode === "list" ? "!bg-gray-100 !text-gray-900" : "!bg-white !text-gray-400"}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
                  </button>
                  <button onClick={() => setViewMode("grid")} className={`!p-2 !rounded-none ${viewMode === "grid" ? "!bg-gray-100 !text-gray-900" : "!bg-white !text-gray-400"}`}>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z" /></svg>
                  </button>
                </div>
              </div>
            </div>

            {loading && proposals.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-500">Loading proposals...</p>
              </div>
            ) : proposals.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-500 text-lg">No sourcing proposals found.</p>
              </div>
            ) : (
              <InfiniteScroll
                dataLength={proposals.length}
                next={loadMore}
                hasMore={hasMore}
                loader={<div className="text-center py-4"><p className="text-gray-500">Loading more proposals...</p></div>}
                endMessage={<div className="text-center py-4"><p className="text-gray-400 text-sm">All proposals loaded</p></div>}
              >
                <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "flex flex-col gap-4"}>
                  {proposals.map((proposal) => {
                    const img = proposal.images_urls?.[0] || proposal.images?.[0];
                    const imgSrc = img?.url || img?.original_url || img?.image || img;
                    const categories = proposal.product_categories || [];

                    if (viewMode === "list") {
                      return (
                        <div key={proposal.id} className="border rounded-lg p-5 hover:shadow-card-shadow transition-shadow bg-white flex items-start gap-4">
                          <div className="w-16 h-16 rounded-lg overflow-hidden border flex-shrink-0 bg-gray-50 flex items-center justify-center">
                            {imgSrc ? (
                              <img src={imgSrc} alt={proposal.title} className="w-full h-full object-cover" />
                            ) : (
                              <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" /></svg>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-bold text-gray-900 truncate">{proposal.title}</h3>
                            {categories.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-1.5">
                                {categories.slice(0, 3).map((cat) => (
                                  <span key={cat.id} className="text-xs text-gray-700 border border-gray-300 rounded px-2 py-0.5">{cat.name}</span>
                                ))}
                              </div>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                              {proposal.company_name && <span>{proposal.company_name}</span>}
                              {proposal.location && (
                                <span className="flex items-center gap-1">
                                  {proposal.location.flag_path && <img src={proposal.location.flag_path} alt="" className="w-4 h-3 object-cover rounded-sm" />}
                                  {proposal.location.name}
                                </span>
                              )}
                              {proposal.price && <span className="font-medium text-gray-700">{proposal.currency || "USD"} {proposal.price}</span>}
                            </div>
                            <div className="flex gap-2 mt-3">
                              <button
                                onClick={() => setContactProposal(proposal)}
                                className="!px-4 !py-1.5 text-xs !font-medium !text-brand-600 !border !border-brand-300 !rounded-md hover:!bg-brand-50 !bg-transparent transition-colors flex items-center gap-1.5"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                                </svg>
                                Contact
                              </button>
                              <Link
                                href={`/sourcing/${proposal.id}`}
                                className="px-4 py-1.5 text-xs font-medium text-white bg-brand-500 rounded-md hover:bg-brand-600 transition-colors flex items-center gap-1.5"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Details
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    // Grid view
                    return (
                      <div key={proposal.id} className="border rounded-lg hover:shadow-card-shadow transition-shadow bg-white flex flex-col overflow-hidden">
                        {/* Top row - Location left, Heart right */}
                        <div className="flex items-center justify-between px-4 pt-3 pb-1">
                          {proposal.location ? (
                            <div className="flex items-center gap-1.5 text-sm text-gray-500">
                              {proposal.location.flag_path && <img src={proposal.location.flag_path} alt="" className="w-4 h-3 object-cover rounded-sm" />}
                              <span>{proposal.location.name}</span>
                            </div>
                          ) : <div />}
                          <button
                            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full border border-brand-200 hover:bg-brand-50 transition-colors !bg-white !p-0"
                            onClick={(e) => e.stopPropagation()}
                            title={proposal.is_favorited ? "Remove from favorites" : "Add to favorites"}
                          >
                            <svg
                              className={`w-4 h-4 ${proposal.is_favorited ? "text-brand-500 fill-brand-500" : "text-brand-400"}`}
                              fill={proposal.is_favorited ? "currentColor" : "none"}
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                          </button>
                        </div>

                        {/* Image */}
                        <div className="aspect-[4/1] bg-gray-50 overflow-hidden mx-4 rounded-lg">
                          {imgSrc ? (
                            <img src={imgSrc} alt={proposal.title} className="w-full h-full object-cover block" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-10 h-10 text-gray-200" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" /></svg>
                            </div>
                          )}
                        </div>

                        <div className="p-4 flex flex-col flex-1">
                          <h3 className="text-base font-bold text-gray-900 truncate mb-1">{proposal.title}</h3>

                          {categories.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {categories.slice(0, 4).map((cat) => (
                                <span key={cat.id} className="text-xs text-gray-700 border border-gray-300 rounded px-2 py-0.5">{cat.name}</span>
                              ))}
                              {categories.length > 4 && <span className="text-xs text-gray-400 px-1 py-0.5">+{categories.length - 4}</span>}
                            </div>
                          )}

                          <div className="mt-auto">
                            {/* Price */}
                            {proposal.price && (
                              <div className="flex items-center justify-end text-sm mb-3">
                                <span className="font-semibold text-gray-900">{proposal.currency || "USD"} {proposal.price}</span>
                              </div>
                            )}

                            {/* Footer - Two buttons */}
                            <div className="flex gap-3 border-t pt-3">
                              <button
                                onClick={() => setContactProposal(proposal)}
                                className="!flex-1 text-center !py-1.5 text-sm !font-medium !text-brand-600 !border !border-brand-300 !rounded-md hover:!bg-brand-50 !bg-transparent transition-colors flex items-center justify-center gap-1.5"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                                </svg>
                                Contact
                              </button>
                              <Link
                                href={`/sourcing/${proposal.id}`}
                                className="flex-1 text-center py-1.5 text-sm font-medium text-white bg-brand-500 rounded-md hover:bg-brand-600 transition-colors flex items-center justify-center gap-1.5"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Details
                              </Link>
                            </div>
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

      {/* Contact Modal */}
      {contactProposal && (
        <ContactModal proposal={contactProposal} onClose={() => setContactProposal(null)} />
      )}
    </div>
  );
}

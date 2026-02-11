"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Container } from "@/components/shared";

const Hero = ({ categories = [], locations = [] }) => {
  const router = useRouter();
  const safeCategories = Array.isArray(categories) ? categories : [];
  const safeLocations = Array.isArray(locations) ? locations : [];

  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");

  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showMobileCategoryDropdown, setShowMobileCategoryDropdown] = useState(false);
  const [showMobileLocationDropdown, setShowMobileLocationDropdown] = useState(false);

  const categoryRef = useRef(null);
  const locationRef = useRef(null);
  const mobileCategoryRef = useRef(null);
  const mobileLocationRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (categoryRef.current && !categoryRef.current.contains(e.target)) setShowCategoryDropdown(false);
      if (locationRef.current && !locationRef.current.contains(e.target)) setShowLocationDropdown(false);
      if (mobileCategoryRef.current && !mobileCategoryRef.current.contains(e.target)) setShowMobileCategoryDropdown(false);
      if (mobileLocationRef.current && !mobileLocationRef.current.contains(e.target)) setShowMobileLocationDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (keyword) params.set("keyword", keyword);
    if (category) params.set("category", category);
    if (location) params.set("location", location);
    router.push(`/company${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const selectedCategoryName = category
    ? safeCategories.find((c) => String(c.id) === String(category))?.name || "All Categories"
    : "All Categories";

  const selectedLocationName = location
    ? safeLocations.find((l) => String(l.id) === String(location))?.name || "Anywhere"
    : "Anywhere";

  return (
    <section
      className="relative py-16 md:py-24 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=600&fit=crop')",
      }}
    >
      <Container>
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-8">
            Find Your <span className="text-brand-600">Apparel</span> Business
            Needs
          </h1>

          {/* Search Bar - Desktop */}
          <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-card-shadow border border-gray-200 hidden sm:flex items-center px-3 py-2.5 gap-3">
            {/* Category Dropdown */}
            <div className="shrink-0 relative border-r border-gray-300 pr-3" ref={categoryRef}>
              <button
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="!bg-transparent !p-0 !pl-2 flex items-center gap-1.5 !text-gray-700"
              >
                <span className="text-sm font-medium truncate max-w-[140px]">
                  {selectedCategoryName}
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
                    onClick={() => { setCategory(""); setShowCategoryDropdown(false); }}
                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 ${!category ? "bg-brand-50 text-brand-600 font-medium" : "text-gray-700"}`}
                  >
                    All Categories
                  </div>
                  {safeCategories.map((cat) => (
                    <div
                      key={cat.id}
                      onClick={() => { setCategory(String(cat.id)); setShowCategoryDropdown(false); }}
                      className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 truncate ${String(category) === String(cat.id) ? "bg-brand-50 text-brand-600 font-medium" : "text-gray-700"}`}
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
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search ..."
                className="w-full text-sm text-gray-600 bg-transparent border-none outline-none"
              />
            </div>

            {/* Location Dropdown */}
            <div className="hidden md:block shrink-0 w-[150px] relative" ref={locationRef}>
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
                  {selectedLocationName}
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
                    onClick={() => { setLocation(""); setShowLocationDropdown(false); }}
                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 ${!location ? "bg-brand-50 text-brand-600 font-medium" : "text-gray-700"}`}
                  >
                    Anywhere
                  </div>
                  {safeLocations.map((loc) => (
                    <div
                      key={loc.id}
                      onClick={() => { setLocation(String(loc.id)); setShowLocationDropdown(false); }}
                      className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 flex items-center gap-2 ${String(location) === String(loc.id) ? "bg-brand-50 text-brand-600 font-medium" : "text-gray-700"}`}
                    >
                      {loc.flag_path && (
                        <img src={loc.flag_path} alt="" className="w-5 h-3.5 object-cover rounded-sm flex-shrink-0" />
                      )}
                      <span className="truncate">{loc.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              className="!bg-brand-500 hover:!bg-brand-600 !text-white !px-7 !py-2 !rounded-lg text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
            >
              Search
            </button>
          </div>

          {/* Search Bar - Mobile */}
          <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-card-shadow border border-gray-200 flex flex-col gap-3 px-3 py-3 sm:hidden">
            {/* Search Input */}
            <div className="flex items-center gap-2 px-2 border-b border-gray-200 pb-3">
              <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search ..."
                className="w-full text-sm text-gray-600 bg-transparent border-none outline-none"
              />
            </div>

            {/* Category + Location Row */}
            <div className="flex items-center gap-3">
              <div className="flex-1 relative min-w-0" ref={mobileCategoryRef}>
                <button
                  onClick={() => setShowMobileCategoryDropdown(!showMobileCategoryDropdown)}
                  className="!bg-transparent !border !border-gray-200 !rounded-lg !py-2 !px-2 !w-full flex items-center gap-1.5 !text-gray-700 overflow-hidden"
                >
                  <span className="text-sm font-medium truncate flex-1 text-left">
                    {selectedCategoryName}
                  </span>
                  <svg
                    className={`w-3 h-3 text-gray-500 flex-shrink-0 transition-transform ${showMobileCategoryDropdown ? "rotate-180" : ""}`}
                    fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showMobileCategoryDropdown && (
                  <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    <div
                      onClick={() => { setCategory(""); setShowMobileCategoryDropdown(false); }}
                      className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 ${!category ? "bg-brand-50 text-brand-600 font-medium" : "text-gray-700"}`}
                    >
                      All Categories
                    </div>
                    {safeCategories.map((cat) => (
                      <div
                        key={cat.id}
                        onClick={() => { setCategory(String(cat.id)); setShowMobileCategoryDropdown(false); }}
                        className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 truncate ${String(category) === String(cat.id) ? "bg-brand-50 text-brand-600 font-medium" : "text-gray-700"}`}
                      >
                        {cat.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex-1 relative min-w-0" ref={mobileLocationRef}>
                <button
                  onClick={() => setShowMobileLocationDropdown(!showMobileLocationDropdown)}
                  className="!bg-transparent !border !border-brand-300 !rounded-lg !py-2 !px-2 !w-full flex items-center gap-1.5 !text-gray-700 overflow-hidden"
                >
                  <svg className="w-4 h-4 text-brand-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 2a14.5 14.5 0 014 10 14.5 14.5 0 01-4 10 14.5 14.5 0 01-4-10 14.5 14.5 0 014-10" />
                    <path d="M2 12h20" />
                  </svg>
                  <span className="text-sm font-medium truncate flex-1 text-left">
                    {selectedLocationName}
                  </span>
                  <svg
                    className={`w-3 h-3 text-gray-500 flex-shrink-0 transition-transform ${showMobileLocationDropdown ? "rotate-180" : ""}`}
                    fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showMobileLocationDropdown && (
                  <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    <div
                      onClick={() => { setLocation(""); setShowMobileLocationDropdown(false); }}
                      className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 ${!location ? "bg-brand-50 text-brand-600 font-medium" : "text-gray-700"}`}
                    >
                      Anywhere
                    </div>
                    {safeLocations.map((loc) => (
                      <div
                        key={loc.id}
                        onClick={() => { setLocation(String(loc.id)); setShowMobileLocationDropdown(false); }}
                        className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 flex items-center gap-2 ${String(location) === String(loc.id) ? "bg-brand-50 text-brand-600 font-medium" : "text-gray-700"}`}
                      >
                        {loc.flag_path && (
                          <img src={loc.flag_path} alt="" className="w-5 h-3.5 object-cover rounded-sm flex-shrink-0" />
                        )}
                        <span className="truncate">{loc.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              className="!bg-brand-500 hover:!bg-brand-600 !text-white !py-2.5 !rounded-lg text-sm font-semibold transition-colors w-full"
            >
              Search
            </button>
          </div>

          {/* Quick Tags */}
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <Link href="/sourcing?keyword=Sports+Wear" className="px-4 py-2 bg-black/20 text-white rounded-lg text-sm hover:bg-black/30 transition">
              Sports Wear
            </Link>
            <Link href="/sourcing?keyword=Hoodie" className="px-4 py-2 bg-black/20 text-white rounded-lg text-sm hover:bg-black/30 transition">
              Hoodie
            </Link>
            <Link href="/sourcing?keyword=Tops" className="px-4 py-2 bg-black/20 text-white rounded-lg text-sm hover:bg-black/30 transition">
              Tops
            </Link>
            <Link href="/sourcing?keyword=Cotton+Yarn" className="px-4 py-2 bg-black/20 text-white rounded-lg text-sm hover:bg-black/30 transition">
              Cotton Yarn
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Hero;

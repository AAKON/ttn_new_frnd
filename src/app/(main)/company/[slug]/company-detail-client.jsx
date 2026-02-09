"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { getMyCompanies } from "@/services/company";
import { Share2, Bookmark, ChevronLeft, ChevronRight, AlertCircle, Download, Grid3x3, Building2, MapPin, Eye, Edit2 } from "lucide-react";

export default function CompanyDetailClient({ company }) {
  const { data: session } = useSession();
  const [isOwnCompany, setIsOwnCompany] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [activeProductTab, setActiveProductTab] = useState(0);
  const [expandedAbout, setExpandedAbout] = useState(false);
  const [productCarouselIndex, setProductCarouselIndex] = useState(0);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Reset carousel index when active tab changes
  useEffect(() => {
    setProductCarouselIndex(0);
  }, [activeProductTab]);

  useEffect(() => {
    if (!isHydrated || !session) {
      return;
    }

    const checkOwnership = async () => {
      try {
        const myCompanies = await getMyCompanies();
        const owned = myCompanies.some(
          (c) => c.slug === company.slug || c.id === company.id
        );
        setIsOwnCompany(owned);
      } catch (error) {
        console.error("Error checking company ownership:", error);
        setIsOwnCompany(false);
      }
    };

    checkOwnership();
  }, [isHydrated, session, company.slug, company.id]);

  const products = company.products || [];
  const businessTypes = company.business_types || [];
  const contact = company.contact || {};

  // Get unique product categories from products
  const productCategories = [...new Set(products.map((p) => {
    const catName = p.category?.name || p.product_category?.name || "Other";
    return catName;
  }))];

  // Group products by category
  const productsByCategory = productCategories.reduce((acc, category) => {
    acc[category] = products.filter((p) => {
      const catName = p.category?.name || p.product_category?.name || "Other";
      return catName === category;
    });
    return acc;
  }, {});

  const currentCategory = productCategories[activeProductTab] || productCategories[0];
  const currentProducts = productsByCategory[currentCategory] || [];

  // Debug logging
  if (isHydrated && products.length > 0) {
    console.log("Products data:", products);
    console.log("Product categories:", productCategories);
    console.log("Current category:", currentCategory);
    console.log("Current products:", currentProducts);
  }

  return (
    <div className="min-h-screen bg-gray-50" suppressHydrationWarning>
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-lg p-4 sm:p-8 mb-8" suppressHydrationWarning>
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-6 mb-6" suppressHydrationWarning>
            <div className="flex gap-4 flex-1 items-start">
              {/* Company Logo */}
              {company.thumbnail_url && (
                <img
                  src={company.thumbnail_url}
                  alt={company.name}
                  className="w-16 sm:w-20 h-16 sm:h-20 rounded-full object-cover flex-shrink-0"
                />
              )}

              {/* Company Info */}
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-3 break-words">{company.name}</h1>

                {/* Business Type Tags */}
                <div className="flex flex-wrap gap-2">
                  {businessTypes.map((type) => (
                    <span
                      key={type.id}
                      className="px-2 sm:px-3 py-1 border border-gray-300 text-gray-700 rounded-full text-xs sm:text-sm font-medium"
                    >
                      {type.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 flex-wrap sm:flex-nowrap flex-shrink-0 items-center w-full sm:w-auto" suppressHydrationWarning>
              <button className="p-2 border border-gray-300 bg-white text-gray-600 hover:bg-brand-600 hover:text-white hover:border-brand-600 rounded-lg transition-colors">
                <Share2 size={20} />
              </button>
              {isOwnCompany ? (
                <Link
                  href={`/company/${company.slug}/edit`}
                  className="px-3 sm:px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-md font-medium transition-colors text-xs sm:text-sm flex items-center gap-2"
                  suppressHydrationWarning
                >
                  <Edit2 size={18} />
                  Edit Profile
                </Link>
              ) : (
                <button className="px-3 sm:px-4 py-2 border border-gray-300 bg-white text-gray-700 hover:bg-brand-600 hover:text-white hover:border-brand-600 rounded-md font-medium transition-colors text-xs sm:text-sm" suppressHydrationWarning>
                  Claim this Business
                </button>
              )}
              <button className="p-2 border border-gray-300 bg-white text-gray-600 hover:bg-brand-600 hover:text-white hover:border-brand-600 rounded-lg transition-colors">
                <Bookmark size={20} />
              </button>
            </div>
          </div>

          {/* Company Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-6 sm:mt-8 pt-6 sm:pt-8 border-t">
            <div>
              <div className="text-xs sm:text-sm text-gray-500 mb-2 flex items-center gap-2">
                <Grid3x3 size={16} className="text-gray-400" />
                Category
              </div>
              <p className="text-gray-900 font-semibold text-xs sm:text-sm">
                {company.business_categories?.slice(0, 2).map((cat) => cat.name).join(", ")}
                {company.business_categories?.length > 2 && "..."}
              </p>
            </div>
            <div>
              <div className="text-xs sm:text-sm text-gray-500 mb-2 flex items-center gap-2">
                <Building2 size={16} className="text-gray-400" />
                Company size
              </div>
              <p className="text-gray-900 font-semibold text-xs sm:text-sm">{company.manpower || "N/A"}</p>
            </div>
            <div>
              <div className="text-xs sm:text-sm text-gray-500 mb-2 flex items-center gap-2">
                <MapPin size={16} className="text-gray-400" />
                Location
              </div>
              <p className="text-gray-900 font-semibold text-xs sm:text-sm flex items-center gap-1">
                {company.location?.name || "N/A"}
                {company.location?.flag_path && (
                  <img src={company.location.flag_path} alt="" className="w-4 h-3" />
                )}
              </p>
            </div>
            <div>
              <div className="text-xs sm:text-sm text-gray-500 mb-2 flex items-center gap-2">
                <Eye size={16} className="text-gray-400" />
                Views
              </div>
              <p className="text-gray-900 font-semibold text-xs sm:text-sm">{company.view_count || 0}</p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Company Section */}
            <div className="bg-white rounded-lg p-4 sm:p-8">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">About Company</h2>
              <div
                className={`text-gray-600 text-xs sm:text-sm leading-relaxed ${!expandedAbout ? "line-clamp-3" : ""}`}
              >
                {company.about || company.description || "No description available."}
              </div>
              <button
                onClick={() => setExpandedAbout(!expandedAbout)}
                className="text-brand-600 font-semibold text-xs sm:text-sm mt-2 hover:text-brand-700"
              >
                See More →
              </button>
            </div>

            {/* Products Showcase Section */}
            {products.length > 0 && (
              <div className="bg-white rounded-lg p-4 sm:p-8">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-6">Products Showcase</h2>

                {/* Product Tabs - Orange Pills */}
                <div className="border border-gray-300 rounded-lg p-4 mb-8">
                  <div className="flex gap-3 flex-wrap">
                    {productCategories.map((category, index) => (
                      <button
                        key={category}
                        onClick={() => setActiveProductTab(index)}
                        className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap text-sm transition-colors ${
                          activeProductTab === index
                            ? "bg-brand-600 text-white"
                            : "bg-brand-600 text-white hover:bg-brand-700"
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Products Carousel - Show 4 Products */}
                {currentProducts.length > 0 ? (
                  <div className="relative">
                    <div className="flex items-center justify-between gap-4">
                      {/* Left Arrow */}
                      <button
                        onClick={() => setProductCarouselIndex(Math.max(0, productCarouselIndex - 1))}
                        disabled={productCarouselIndex === 0}
                        className="flex-shrink-0 bg-white border border-gray-300 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed rounded-full p-2 transition-colors"
                      >
                        <ChevronLeft size={20} className="text-gray-600" />
                      </button>

                      {/* Products Carousel - 1 card at a time */}
                      <div className="flex-1 overflow-hidden">
                        <div
                          className="flex gap-4 transition-all duration-500 ease-in-out"
                          style={{
                            width: `${Math.ceil(currentProducts.length / 4) * 100}%`,
                            transform: `translateX(-${productCarouselIndex * (25 / Math.ceil(currentProducts.length / 4))}%)`,
                          }}
                        >
                          {currentProducts.map((product) => {
                            const productImage = product.image || product.image_url;
                            const productName = product.title || product.name || "Unnamed";
                            const categoryName = product.category?.name || product.product_category?.name || "Other";
                            const price = product.price_usd || product.price_range || product.price_inr || product.price_max || "N/A";

                            return (
                              <div
                                key={product.id}
                                style={{
                                  flex: `0 0 ${25 / Math.ceil(currentProducts.length / 4)}%`
                                }}
                                className="text-center"
                              >
                                {/* Product Image */}
                                <div className="w-full h-40 bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                                  {productImage ? (
                                    <img
                                      src={productImage}
                                      alt={productName}
                                      className="w-full h-full object-contain"
                                    />
                                  ) : (
                                    <span className="text-gray-400 text-xs">No image</span>
                                  )}
                                </div>

                                {/* Product Info */}
                                <p className="text-xs font-semibold text-brand-600 mb-1 uppercase tracking-wide">
                                  {categoryName}
                                </p>
                                <h3 className="font-semibold text-gray-900 text-xs sm:text-sm mb-2 line-clamp-2">
                                  {productName}
                                </h3>
                                <p className="text-gray-900 font-bold text-base mb-1">
                                  ${price}
                                </p>
                                {product.moq && (
                                  <p className="text-gray-600 text-xs">
                                    {product.moq}(Min. Order)
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Right Arrow */}
                      <button
                        onClick={() => setProductCarouselIndex(Math.min(currentProducts.length - 4, productCarouselIndex + 1))}
                        disabled={productCarouselIndex >= currentProducts.length - 4}
                        className="flex-shrink-0 bg-white border border-gray-300 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed rounded-full p-2 transition-colors"
                      >
                        <ChevronRight size={20} className="text-gray-600" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No products available</p>
                )}
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div>
            {/* Contact Card */}
            <div className="bg-white rounded-lg p-4 sm:p-6 lg:sticky lg:top-4">
              <h3 className="text-base sm:text-lg font-bold text-brand-600 mb-4 sm:mb-6">Contact with Company</h3>

              {/* Company Contact Card */}
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                {company.thumbnail_url ? (
                  <img
                    src={company.thumbnail_url}
                    alt={company.name}
                    className="w-12 sm:w-14 h-12 sm:h-14 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
                    <Building2 size={18} className="text-white" />
                  </div>
                )}
                <h4 className="font-semibold text-gray-900 text-sm sm:text-base break-words">{company.name}</h4>
              </div>

              {/* Contact Request Button */}
              <button className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2 sm:py-3 rounded-md mb-4 sm:mb-6 transition-colors text-sm sm:text-base">
                Contact Request
              </button>

              {/* Links */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 text-xs sm:text-sm">
                <a href="#" className="text-gray-600 hover:text-gray-900 hover:underline transition-colors inline-flex items-center gap-2">
                  <AlertCircle size={16} />
                  Report this listing
                </a>
                <a href="#" className="text-gray-600 hover:text-gray-900 hover:underline transition-colors inline-flex items-center gap-2">
                  <Download size={16} />
                  Download Profile
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

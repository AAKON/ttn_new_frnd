"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { getMyCompanies } from "@/services/company";
import { Share2, Bookmark, ChevronLeft, ChevronRight, AlertCircle, Download, Grid3x3, Building2, MapPin, Eye, Edit2 } from "lucide-react";

const MapComponent = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full border border-gray-200 rounded-lg overflow-hidden bg-gray-100" style={{ height: "300px" }}>
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-gray-500">Loading map...</p>
      </div>
    </div>
  ),
});

export default function CompanyDetailClient({ company }) {
  const { data: session } = useSession();
  const [isOwnCompany, setIsOwnCompany] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [activeProductTab, setActiveProductTab] = useState(0);
  const [expandedAbout, setExpandedAbout] = useState(false);
  const [productCarouselIndex, setProductCarouselIndex] = useState(0);
  const [itemsPerSlide, setItemsPerSlide] = useState(4);
  const [activeTab, setActiveTab] = useState("profile");
  const [clientSlideIndex, setClientSlideIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [expandedFaqId, setExpandedFaqId] = useState(null);
  const [isHoveringClients, setIsHoveringClients] = useState(false);

  // Use refs to avoid closure issues
  const dragStartRef = useRef(0);
  const isDraggingRef = useRef(false);
  const containerRef = useRef(null);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Handle responsive slider items
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        if (window.innerWidth < 640) {
          setItemsPerSlide(1); // Mobile
        } else if (window.innerWidth < 1024) {
          setItemsPerSlide(2); // Tablet
        } else {
          setItemsPerSlide(4); // Desktop
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Reset carousel index when active tab changes
  useEffect(() => {
    setProductCarouselIndex(0);
  }, [activeProductTab]);

  // Auto-slide clients continuously (paused on hover)
  useEffect(() => {
    const clients = company.clients || [];
    if (clients.length === 0 || isHoveringClients || isDragging) return;

    const interval = setInterval(() => {
      setClientSlideIndex((prev) => (prev + 1) % (clients.length * 2));
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, [company.clients, isHoveringClients, isDragging]);

  const handleMouseDown = (e) => {
    dragStartRef.current = e.clientX;
    isDraggingRef.current = true;
    setIsDragging(true);
    setDragOffset(0);
  };

  // Handle drag with global event listeners
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDraggingRef.current) return;
      const diff = e.clientX - dragStartRef.current;
      setDragOffset(diff);
    };

    const handleMouseUp = (e) => {
      if (!isDraggingRef.current) return;

      const diff = e.clientX - dragStartRef.current;
      const clients = company.clients || [];

      isDraggingRef.current = false;
      setIsDragging(false);
      setDragOffset(0);

      // If dragged more than 50px, move to next/previous slide
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          // Dragged right - go to previous slide
          setClientSlideIndex((prev) => (prev - 1 + clients.length * 2) % (clients.length * 2));
        } else {
          // Dragged left - go to next slide
          setClientSlideIndex((prev) => (prev + 1) % (clients.length * 2));
        }
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [company.clients]);

  const handleContainerMouseLeave = () => {
    setIsHoveringClients(false);
  };

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

                {/* Product Tabs */}
                <div className="flex gap-8 border-b border-gray-200 overflow-x-auto no-scrollbar mb-8">
                  {productCategories.map((category, index) => (
                    <button
                      key={category}
                      onClick={() => setActiveProductTab(index)}
                      className={`bg-transparent border-none p-0 pb-4 text-base cursor-pointer transition-all relative whitespace-nowrap !bg-transparent !text-gray-900 ${
                        activeProductTab === index
                          ? "font-bold text-gray-900"
                          : "font-normal text-gray-600 hover:text-gray-800"
                      }`}
                    >
                      {category}
                      {activeProductTab === index && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-600"></div>
                      )}
                    </button>
                  ))}
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

                      {/* Products Carousel - 1 card at a time, responsive */}
                      <div className="flex-1 overflow-hidden">
                        <div
                          className="flex gap-4 transition-all duration-500 ease-in-out"
                          style={{
                            width: `${Math.ceil(currentProducts.length / itemsPerSlide) * 100}%`,
                            transform: `translateX(-${productCarouselIndex * (100 / Math.ceil(currentProducts.length / itemsPerSlide))}%)`,
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
                                  flex: `0 0 ${100 / Math.ceil(currentProducts.length / itemsPerSlide) / itemsPerSlide}%`
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
                        onClick={() => setProductCarouselIndex(Math.min(currentProducts.length - itemsPerSlide, productCarouselIndex + 1))}
                        disabled={productCarouselIndex >= currentProducts.length - itemsPerSlide}
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

            {/* Tabs Section */}
            <div className="bg-white rounded-lg p-4 sm:p-8">
              <div className="mb-6">
                <div className="flex gap-8 border-b border-gray-200 overflow-x-auto no-scrollbar">
                  {["profile", "clients", "certificates", "contacts", "faq"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`bg-transparent border-none p-0 pb-4 text-base cursor-pointer transition-all relative ${
                        activeTab === tab
                          ? "font-bold text-gray-900"
                          : "font-normal text-gray-600 hover:text-gray-800"
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      {activeTab === tab && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-600"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Profile Tab - Overview */}
              {activeTab === "profile" && (
                <div className="space-y-8">
                  {/* Overview Section */}
                  <div className="flex flex-col lg:flex-row gap-6 lg:gap-12">
                    {/* Left Side - Section Name */}
                    <div className="lg:w-32 flex-shrink-0">
                      <h3 className="text-base font-semibold text-gray-900">Overview</h3>
                    </div>

                    {/* Right Side - Overview Data */}
                    <div className="flex-1 border-2 border-brand-600 rounded-2xl p-4 sm:p-6">
                      <div className="grid grid-cols-2 gap-6 sm:gap-8">
                        {/* MOQ */}
                        <div>
                          <div className="text-xs font-medium text-gray-600 mb-1">MOQ</div>
                          <div className="text-sm font-semibold text-gray-900">{company.overview?.moq || "N/A"}</div>
                        </div>

                        {/* Lead Time */}
                        <div>
                          <div className="text-xs font-medium text-gray-600 mb-1">Lead Time</div>
                          <div className="text-sm font-semibold text-gray-900">
                            {company.overview?.lead_time ? `${company.overview.lead_time} ${company.overview.lead_time_unit || "days"}` : "N/A"}
                          </div>
                        </div>

                        {/* Delivery Terms */}
                        <div>
                          <div className="text-xs font-medium text-gray-600 mb-1">Delivery Terms</div>
                          <div className="text-sm font-semibold text-gray-900">{company.overview?.shipment_term || "N/A"}</div>
                        </div>

                        {/* Payment Policy */}
                        <div>
                          <div className="text-xs font-medium text-gray-600 mb-1">Payment Policy</div>
                          <div className="text-sm font-semibold text-gray-900">{company.overview?.payment_policy || "N/A"}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Market Share Chart */}
                  {company.overview?.market_share && company.overview.market_share.length > 0 && (
                    <div className="flex flex-col lg:flex-row gap-6 lg:gap-12">
                      {/* Left Side - Section Name */}
                      <div className="lg:w-32 flex-shrink-0">
                        <h3 className="text-base font-semibold text-gray-900">Market Share</h3>
                      </div>

                      {/* Right Side - Chart */}
                      <div className="flex-1 border-2 border-brand-600 rounded-2xl p-4 sm:p-6">
                        <div className="h-64 flex flex-col">
                        {(() => {
                          const validItems = company.overview.market_share.filter((item) => item.location_id && item.percentage);
                          const maxValue = Math.max(...validItems.map((item) => parseInt(item.percentage) || 0), 60);
                          const scale = 200 / maxValue;
                          const step = Math.ceil(maxValue / 4);
                          const ySteps = Array.from({ length: 5 }, (_, i) => i * step);

                          return (
                            <div className="flex-1 flex gap-4">
                              {/* Y-Axis */}
                              <div className="flex flex-col-reverse justify-between text-xs text-gray-600 pr-2 min-w-fit">
                                {ySteps.map((val) => (
                                  <div key={val}>{val}</div>
                                ))}
                              </div>
                              {/* Chart Area */}
                              <div className="flex-1 flex items-end justify-between gap-3 border-l border-b border-gray-400">
                                {validItems.map((item, idx) => {
                                  const percentage = parseInt(item.percentage) || 0;
                                  const barHeight = percentage * scale;

                                  return (
                                    <div key={idx} className="flex flex-col items-center gap-2 flex-1 h-full">
                                      <div className="w-full h-full flex items-end justify-center">
                                        <div
                                          className="w-3/4 bg-brand-600"
                                          style={{ height: `${barHeight}px`, minHeight: '2px' }}
                                        ></div>
                                      </div>
                                      <div className="text-xs text-gray-700 font-medium text-center whitespace-nowrap">
                                        Country {item.location_id}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })()}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Yearly Turnover Chart */}
                  {company.overview?.yearly_turnover && company.overview.yearly_turnover.length > 0 && (
                    <div className="flex flex-col lg:flex-row gap-6 lg:gap-12">
                      {/* Left Side - Section Name */}
                      <div className="lg:w-32 flex-shrink-0">
                        <h3 className="text-base font-semibold text-gray-900">Yearly Turnover</h3>
                      </div>

                      {/* Right Side - Chart */}
                      <div className="flex-1 border-2 border-brand-600 rounded-2xl p-4 sm:p-6">
                        <div className="h-64 flex flex-col">
                        {(() => {
                          const validItems = company.overview.yearly_turnover.filter((item) => item.year && item.turnover);
                          const maxValue = Math.max(...validItems.map((item) => parseInt(item.turnover) || 0), 60);
                          const scale = 200 / maxValue;
                          const step = Math.ceil(maxValue / 4);
                          const ySteps = Array.from({ length: 5 }, (_, i) => i * step);

                          return (
                            <div className="flex-1 flex gap-4">
                              {/* Y-Axis */}
                              <div className="flex flex-col-reverse justify-between text-xs text-gray-600 pr-2 min-w-fit">
                                {ySteps.map((val) => (
                                  <div key={val}>{val}</div>
                                ))}
                              </div>
                              {/* Chart Area */}
                              <div className="flex-1 flex items-end justify-between gap-3 border-l border-b border-gray-400">
                                {validItems.map((item, idx) => {
                                  const turnover = parseInt(item.turnover) || 0;
                                  const barHeight = turnover * scale;

                                  return (
                                    <div key={idx} className="flex flex-col items-center gap-2 flex-1 h-full">
                                      <div className="w-full h-full flex items-end justify-center">
                                        <div
                                          className="w-3/4 bg-brand-600"
                                          style={{ height: `${barHeight}px`, minHeight: '2px' }}
                                        ></div>
                                      </div>
                                      <div className="text-xs text-gray-700 font-medium text-center">{item.year}</div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Clients Tab */}
              {activeTab === "clients" && (
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-6">Clients</h3>
                  {(company.clients || []).length > 0 ? (
                    <div className="relative">
                      {/* Auto-scrolling Clients Slider */}
                      <div
                        ref={containerRef}
                        className="overflow-hidden bg-gray-50 rounded-lg p-6 cursor-grab active:cursor-grabbing select-none"
                        onMouseEnter={() => setIsHoveringClients(true)}
                        onMouseLeave={handleContainerMouseLeave}
                        onMouseDown={handleMouseDown}
                      >
                        <style>{`
                          @keyframes scroll-left {
                            0% {
                              transform: translateX(0);
                            }
                            100% {
                              transform: translateX(-100%);
                            }
                          }
                          .scroll-animation {
                            animation: scroll-left ${company.clients.length * 4}s linear infinite;
                          }
                          .scroll-animation.paused {
                            animation-play-state: paused;
                          }
                        `}</style>
                        <div
                          className={`flex gap-6 ${!isDragging && !isHoveringClients ? 'scroll-animation' : ''}`}
                          style={{
                            transform: (() => {
                              const baseTransform = -clientSlideIndex * 100;
                              if (isDragging && containerRef.current) {
                                const containerWidth = containerRef.current.offsetWidth;
                                const dragPercent = (dragOffset / containerWidth) * 100;
                                console.log('Transform:', `translateX(${baseTransform + dragPercent}%)`);
                                return `translateX(${baseTransform + dragPercent}%)`;
                              }
                              return `translateX(${baseTransform}%)`;
                            })(),
                            transition: isDragging ? 'none' : 'transform 0.6s ease-out'
                          }}
                        >
                          {/* Duplicate clients for seamless loop */}
                          {[...company.clients, ...company.clients].map((client, index) => (
                            <div
                              key={`${client.id}-${index}`}
                              className="flex-shrink-0 w-full sm:w-1/2 lg:w-1/4 flex items-center justify-center select-none"
                              draggable={false}
                            >
                              <div className="bg-white rounded-lg p-4 shadow-sm flex items-center justify-center h-24 w-full">
                                {client.image_url ? (
                                  <img
                                    src={client.image_url}
                                    alt="Client"
                                    className="h-full w-full object-contain"
                                    draggable={false}
                                  />
                                ) : (
                                  <span className="text-gray-400 text-sm">No image</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No clients added yet</p>
                  )}
                </div>
              )}

              {/* Certificates Tab */}
              {activeTab === "certificates" && (
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-6">Certificates</h3>
                  {(company.certificates || []).length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {company.certificates.map((cert) => (
                        <div
                          key={cert.id}
                          className="border rounded-lg p-4 flex flex-col items-center text-center hover:shadow-md transition-shadow"
                        >
                          {cert.image_url ? (
                            <img
                              src={cert.image_url}
                              alt={cert.name}
                              className="w-16 h-16 object-contain mb-3"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mb-3">
                              <svg className="w-8 h-8 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                              </svg>
                            </div>
                          )}
                          <p className="text-sm font-medium text-gray-900">{cert.name}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No certificates added yet</p>
                  )}
                </div>
              )}

              {/* Contacts Tab */}
              {activeTab === "contacts" && (
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-6">Contact Information</h3>
                  {contact && Object.keys(contact).length > 0 ? (
                    <div className="space-y-4">
                      {contact.address && (
                        <div className="flex gap-3">
                          <span className="text-sm font-medium text-gray-500 w-32 flex-shrink-0">Address</span>
                          <span className="text-sm text-gray-900">{contact.address}</span>
                        </div>
                      )}
                      {contact.factory_address && (
                        <div className="flex gap-3">
                          <span className="text-sm font-medium text-gray-500 w-32 flex-shrink-0">Factory Address</span>
                          <span className="text-sm text-gray-900">{contact.factory_address}</span>
                        </div>
                      )}
                      {contact.email && (
                        <div className="flex gap-3">
                          <span className="text-sm font-medium text-gray-500 w-32 flex-shrink-0">Email</span>
                          <a href={`mailto:${contact.email}`} className="text-sm text-brand-600 hover:underline">{contact.email}</a>
                        </div>
                      )}
                      {contact.phone && (
                        <div className="flex gap-3">
                          <span className="text-sm font-medium text-gray-500 w-32 flex-shrink-0">Phone</span>
                          <a href={`tel:${contact.phone}`} className="text-sm text-brand-600 hover:underline">
                            {contact.phone_code && contact.phone ? `${contact.phone_code} ${contact.phone}` : contact.phone}
                          </a>
                        </div>
                      )}
                      {contact.whatsapp && (
                        <div className="flex gap-3">
                          <span className="text-sm font-medium text-gray-500 w-32 flex-shrink-0">WhatsApp</span>
                          <span className="text-sm text-gray-900">
                            {contact.whatsapp_code && contact.whatsapp ? `${contact.whatsapp_code} ${contact.whatsapp}` : contact.whatsapp}
                          </span>
                        </div>
                      )}
                      {contact.website && (
                        <div className="flex gap-3">
                          <span className="text-sm font-medium text-gray-500 w-32 flex-shrink-0">Website</span>
                          <a href={contact.website} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-600 hover:underline">{contact.website}</a>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No contact information available</p>
                  )}

                  {/* Location Map */}
                  {contact.latitude && contact.longitude && (
                    <div className="mt-8">
                      <h3 className="text-base font-semibold text-gray-900 mb-4">Location</h3>
                      <MapComponent
                        latitude={contact.latitude}
                        longitude={contact.longitude}
                      />
                    </div>
                  )}

                  {/* Decision Makers */}
                  {(company.decision_makers || []).length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-base font-semibold text-gray-900 mb-4">Decision Makers</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {company.decision_makers.map((dm) => {
                          const phoneDisplay = dm.phone_code && dm.phone ? `${dm.phone_code} ${dm.phone}` : dm.phone;
                          const whatsappDisplay = dm.whatsapp_code && dm.whatsapp ? `${dm.whatsapp_code} ${dm.whatsapp}` : dm.whatsapp;
                          return (
                            <div key={dm.id} className="border rounded-lg p-4">
                              <p className="font-semibold text-gray-900 text-sm">{dm.name}</p>
                              <p className="text-xs text-brand-600 mb-2">{dm.designation}</p>
                              {dm.email && <p className="text-xs text-gray-600">{dm.email}</p>}
                              {dm.phone && <p className="text-xs text-gray-600">{phoneDisplay}</p>}
                              {dm.whatsapp && <p className="text-xs text-gray-600">{whatsappDisplay}</p>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* FAQ Tab */}
              {activeTab === "faq" && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Frequently asked questions</h3>
                  {(company.faqs || []).length > 0 ? (
                    <div className="space-y-4">
                      {company.faqs.map((faq) => (
                        <div key={faq.id} className="">
                          <button
                            onClick={() =>
                              setExpandedFaqId(expandedFaqId === faq.id ? null : faq.id)
                            }
                            className="w-full py-4 px-4 flex items-start gap-3 hover:bg-gray-50 transition-colors text-left !bg-transparent !text-gray-900"
                          >
                            {/* Expand/Collapse Icon */}
                            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full">
                              {expandedFaqId === faq.id ? (
                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                              )}
                            </div>

                            {/* Question */}
                            <span className="font-semibold text-gray-900 text-sm flex-1">
                              {faq.question}
                            </span>
                          </button>

                          {/* Answer */}
                          {expandedFaqId === faq.id && (
                            <div className="px-4 pb-4 ml-12 text-sm text-gray-600 leading-relaxed">
                              {faq.answer}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No FAQs added yet</p>
                  )}
                </div>
              )}
            </div>
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

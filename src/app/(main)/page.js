import React, { Fragment, Suspense } from "react";
import { getHomeDetails } from "@/services/home";
import { getBlogTTNS } from "@/services/blogs";
import Hero from "@/components/hero/hero";
import Counter from "@/components/counter/counter";
import SocialSlider from "@/components/social-slider/social-slider";
import RecentCompany from "@/components/recent-company/recent-company";
import BusinessArea from "@/components/business-area/business-area";
import Resources from "@/components/resources/resources";
import GetInTouch from "@/components/get-in-touch/get-in-touch";
import PartnersSlider from "@/components/partners/partners-slider";
import { Empty, Section, Container } from "@/components/shared";
import ErrorMessage from "@/components/shared/errormessage";
import { Search, Package, Tag, ShoppingCart, Truck, TrendingUp, Monitor, Eye, Megaphone, Network, ArrowUpRight, User } from "lucide-react";
import Link from "next/link";

export default async function Home() {
  try {
    const [blogs, details] = await Promise.all([
      getBlogTTNS(),
      getHomeDetails(),
    ]);

    console.log("=== Home Page Data Flow ===");
    console.log("1. Raw details from getHomeDetails:", {
      hasCategories: !!details?.categories,
      categoriesLength: details?.categories?.length,
      categoriesSample: details?.categories?.slice(0, 2),
      hasLocations: !!details?.locations,
      locationsLength: details?.locations?.length,
      locationsSample: details?.locations?.slice(0, 2),
    });

    const recentCompanies = details?.companies || [];
    const partners = details?.partners || [];
    const categories = details?.categories || [];
    const locations = details?.locations || [];
    const webAds = details?.webAds || [];
    const featuredBlogs = details?.featured_blogs || blogs?.TNN_picks || blogs || [];

    console.log("2. After destructuring:", {
      categoriesCount: categories.length,
      categoriesSample: categories.slice(0, 2),
      locationsCount: locations.length,
      locationsSample: locations.slice(0, 2),
      companiesCount: recentCompanies.length,
    });
    const homeStats = {
      partners: details?.about?.partners || "0",
      countries: details?.about?.countries || "0",
      listed_business: details?.about?.listed_business || "0",
      factory_people: details?.about?.factory_people || "0",
      global_audience: details?.about?.global_audience || "0",
    };

    console.log("3. Passing to Hero component:", {
      categoriesCount: categories.length,
      locationsCount: locations.length,
      categoriesType: typeof categories,
      isArrayCategories: Array.isArray(categories),
    });

    return (
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <p className="text-lg text-gray-600">Loading...</p>
          </div>
        }
      >
        <Fragment>
          {/* Hero Section */}
          <Hero categories={categories} locations={locations} />

          {/* Counter/Stats Section */}
          <Counter homeStats={homeStats} />

          {/* Social Slider/Ads Section */}
          <Fragment>
            {webAds && Array.isArray(webAds) && webAds.length > 0 ? (
              <SocialSlider webAds={webAds} />
            ) : (
              <Empty message="No featured opportunities available." />
            )}
          </Fragment>

          {/* Recent Companies Section */}
          <RecentCompany data={recentCompanies} />

          {/* Business Area Section */}
          <BusinessArea categories={categories} />

          {/* Partners Section */}
          <Section className="bg-gray-50">
            <Container>
              <div className="text-center">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8 uppercase px-4">
                  We&apos;ve worked with some great companies
                </h3>
                {partners && partners.length > 0 ? (
                  <PartnersSlider partners={partners} />
                ) : (
                  <p className="text-gray-600">Coming soon...</p>
                )}
              </div>
            </Container>
          </Section>

          {/* Partner Benefits Section - Split Screen Design */}
          <Section className="bg-white py-12 sm:py-16 lg:py-24">
            <Container>
              {/* Left Side - Sourcing & Marketing Benefits */}
              <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 mb-12 sm:mb-16">
                {/* Sourcing Partner Benefits */}
                <div className="relative">
                  <div className="lg:sticky lg:top-8">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2 mb-4 sm:mb-6">
                      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-[rgb(247,147,30)] flex items-center justify-center shadow-lg shrink-0">
                        <Search className="h-5 w-5 sm:h-6 sm:w-6 text-white" strokeWidth={2.5} />
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        Sourcing Partner Benefits
                      </h3>
                    </div>
                    <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 leading-relaxed">
                      We bridge the gap between you and your business partners.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
                      {[
                        { text: "Digital Presence Management", icon: Monitor },
                        { text: "Enhanced Online Visibility", icon: Eye },
                        { text: "Targeted Marketing Support", icon: Megaphone },
                        { text: "Industry Network Inclusion", icon: Network },
                      ].map((item) => (
                        <div key={item.text} className="bg-gray-50 rounded-xl p-3 sm:p-4 hover:bg-[rgba(247,147,30,0.05)] hover:shadow-md transition-all group">
                          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-white border-2 border-gray-200 group-hover:border-[rgb(247,147,30)] flex items-center justify-center mb-2 sm:mb-3 transition-colors">
                            <item.icon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700 group-hover:text-[rgb(247,147,30)] transition-colors" strokeWidth={2} />
                          </div>
                          <p className="text-xs sm:text-sm font-semibold text-gray-900">{item.text}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button className="flex-1 h-11 sm:h-12 px-4 sm:px-6 text-xs sm:text-sm font-semibold rounded-xl border-2 border-gray-300 text-gray-800 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all">
                        Get a quote
                      </button>
                      <button className="flex-1 h-11 sm:h-12 px-4 sm:px-6 text-xs sm:text-sm font-semibold rounded-xl bg-[rgb(247,147,30)] hover:bg-[rgb(230,130,20)] text-white shadow-lg hover:shadow-xl transition-all">
                        See Partnership Plan
                      </button>
                    </div>
                  </div>
                </div>

                {/* Marketing Partner Benefits */}
                <div className="relative">
                  <div className="lg:sticky lg:top-8">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2 mb-4 sm:mb-6">
                      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-purple-600 flex items-center justify-center shadow-lg shrink-0">
                        <Megaphone className="h-5 w-5 sm:h-6 sm:w-6 text-white" strokeWidth={2.5} />
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        Marketing Partner Benefits
                      </h3>
                    </div>
                    <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 leading-relaxed">
                      We bridge the gap between you and your business partners.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
                      {[
                        { text: "Digital Presence Management", icon: Monitor },
                        { text: "Enhanced Online Visibility", icon: Eye },
                        { text: "Targeted Marketing Support", icon: Megaphone },
                        { text: "Industry Network Inclusion", icon: Network },
                      ].map((item) => (
                        <div key={item.text} className="bg-gray-50 rounded-xl p-3 sm:p-4 hover:bg-purple-50 hover:shadow-md transition-all group">
                          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-white border-2 border-gray-200 group-hover:border-purple-600 flex items-center justify-center mb-2 sm:mb-3 transition-colors">
                            <item.icon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700 group-hover:text-purple-600 transition-colors" strokeWidth={2} />
                          </div>
                          <p className="text-xs sm:text-sm font-semibold text-gray-900">{item.text}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button className="flex-1 h-11 sm:h-12 px-4 sm:px-6 text-xs sm:text-sm font-semibold rounded-xl border-2 border-gray-300 text-gray-800 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all">
                        Get a quote
                      </button>
                      <button className="flex-1 h-11 sm:h-12 px-4 sm:px-6 text-xs sm:text-sm font-semibold rounded-xl bg-[rgb(247,147,30)] hover:bg-[rgb(230,130,20)] text-white shadow-lg hover:shadow-xl transition-all">
                        See Partnership Plan
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Optimized Supplier Matching (Full Width) */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-16 border border-gray-200">
                <div className="max-w-4xl mx-auto">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                    <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-xl shrink-0">
                      <Package className="h-6 w-6 sm:h-8 sm:w-8 text-white" strokeWidth={2.5} />
                    </div>
                    <div>
                      <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                        Optimized Supplier Matching
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600">
                        Find the perfect suppliers with our advanced matching system
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {[
                      { text: "Development & Flexible MOQ", icon: Package },
                      { text: "Best Quality, Best Pricing", icon: Tag },
                      { text: "One-stop Sourcing Solution", icon: ShoppingCart },
                      { text: "Logistics & Service Transparency", icon: Truck },
                      { text: "Market Exposure", icon: TrendingUp },
                    ].map((item) => (
                      <div key={item.text} className="bg-white rounded-xl p-4 sm:p-5 border-2 border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all group">
                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center mb-3 sm:mb-4 transition-colors">
                          <item.icon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" strokeWidth={2} />
                        </div>
                        <p className="text-xs sm:text-sm font-semibold text-gray-900 leading-snug">{item.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Container>
          </Section>

          {/* Resources Section */}
          <Resources blogsPromise={blogs} />

          {/* Featured Blogs / Resources Section */}
          {featuredBlogs && featuredBlogs.length > 0 && (
            <Section className="bg-white py-12 sm:py-16">
              <Container>
                <div className="text-center mb-8 sm:mb-12 px-4">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    Resources
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10 px-4 sm:px-0">
                  {featuredBlogs.slice(0, 3).map((blog) => (
                    <Link
                      key={blog.id}
                      href={`/blog/${blog.slug || blog.id}`}
                      className="group"
                    >
                      <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 h-full flex flex-col">
                        {/* Image */}
                        {blog.thumbnail_url && (
                          <div className="relative w-full h-56 overflow-hidden">
                            <img
                              src={blog.thumbnail_url}
                              alt={blog.title || "Blog image"}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}

                        <div className="p-6 flex-1 flex flex-col">
                          {/* Category Tag */}
                          <div className="mb-3">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                              {blog.blog_types && blog.blog_types.length > 0
                                ? blog.blog_types[0].name
                                : blog.blog_type?.name || "Trade & Business Sourcing"}
                            </span>
                          </div>

                          {/* Title with Arrow */}
                          <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-[rgb(247,147,30)] transition-colors flex items-start justify-between gap-2">
                            <span className="line-clamp-2 flex-1">
                              {blog.title || "Untitled"}
                            </span>
                            <ArrowUpRight className="h-5 w-5 text-gray-400 group-hover:text-[rgb(247,147,30)] shrink-0 mt-1 transition-colors" strokeWidth={2} />
                          </h3>

                          {/* Description */}
                          {blog.short_description && (
                            <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-1">
                              {blog.short_description}
                            </p>
                          )}

                          {/* Author and Date */}
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-auto pt-4 border-t border-gray-100">
                            <User className="h-4 w-4" strokeWidth={2} />
                            <span>{blog.author || "Textile Network"}</span>
                            <span>|</span>
                            <span>
                              {blog.created_at
                                ? new Date(blog.created_at).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })
                                : ""}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* View All Button */}
                <div className="text-center">
                  <Link
                    href="/blog"
                    className="inline-flex items-center justify-center h-14 px-8 text-base font-semibold rounded-xl bg-[rgb(247,147,30)] hover:bg-[rgb(230,130,20)] text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    View all Resources
                  </Link>
                </div>
              </Container>
            </Section>
          )}

          {/* Get in Touch Section */}
          <GetInTouch locations={locations} />
        </Fragment>
      </Suspense>
    );
  } catch (error) {
    return <ErrorMessage message={error?.message} />;
  }
}

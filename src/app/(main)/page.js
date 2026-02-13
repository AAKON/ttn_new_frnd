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
import { Search, Package, Tag, ShoppingCart, Truck, TrendingUp, Monitor, Eye, Megaphone, Network } from "lucide-react";

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
                <h3 className="text-2xl font-bold text-gray-900 mb-8 uppercase">
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

          {/* Partner Benefits Section */}
          <Section className="bg-white py-16">
            <Container>
              <div className="grid gap-12 lg:gap-20 lg:grid-cols-2">
                {/* Left Column - Sourcing Partner Benefits */}
                <div className="flex flex-col">
                  <div className="mb-10">
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                      Sourcing Partner Benefits
                    </h3>
                    <p className="text-sm md:text-base text-gray-600 mb-6 leading-relaxed">
                      We bridge the gap between you and your business partners.
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      <button className="h-11 px-6 text-sm font-semibold rounded-md border border-gray-300 text-gray-800 bg-white hover:bg-gray-50 transition-colors">
                        Get a quote
                      </button>
                      <button className="h-11 px-6 text-sm font-semibold rounded-md bg-[rgb(247,147,30)] hover:bg-[rgb(230,130,20)] text-white transition-colors">
                        See Partnership Plan
                      </button>
                    </div>
                  </div>

                  <div className="space-y-5 mt-auto">
                    {[
                      { text: "Digital Presence Management", icon: Monitor },
                      { text: "Enhanced Online Visibility", icon: Eye },
                      { text: "Targeted Marketing Support", icon: Megaphone },
                      { text: "Industry Network Inclusion", icon: Network },
                    ].map((item) => (
                      <div key={item.text} className="flex items-center gap-4">
                        <div className="h-9 w-9 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center shrink-0">
                          <item.icon className="h-4.5 w-4.5 text-gray-700" strokeWidth={2} />
                        </div>
                        <p className="text-sm md:text-base font-medium text-gray-900">{item.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column - Optimized Supplier Matching & Marketing Partner Benefits */}
                <div className="flex flex-col gap-12">
                  {/* Optimized Supplier Matching */}
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-8 w-8 rounded-full border-2 border-[rgb(247,147,30)] bg-[rgba(247,147,30,0.08)] flex items-center justify-center shrink-0">
                        <Search className="h-4.5 w-4.5 text-[rgb(247,147,30)]" strokeWidth={2.5} />
                      </div>
                      <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
                        Optimized Supplier Matching
                      </h3>
                    </div>
                    <div className="space-y-4">
                      {[
                        { text: "Development & Flexible MOQ", icon: Package },
                        { text: "Best Quality, Best Pricing", icon: Tag },
                        { text: "One-stop Sourcing Solution", icon: ShoppingCart },
                        { text: "Logistics & Service Transparency", icon: Truck },
                        { text: "Market Exposure", icon: TrendingUp },
                      ].map((item) => (
                        <div key={item.text} className="flex items-center gap-4">
                          <div className="h-9 w-9 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center shrink-0">
                            <item.icon className="h-4.5 w-4.5 text-gray-700" strokeWidth={2} />
                          </div>
                          <p className="text-sm md:text-base text-gray-800">{item.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Marketing Partner Benefits */}
                  <div className="mt-auto">
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                      Marketing Partner Benefits
                    </h3>
                    <p className="text-sm md:text-base text-gray-600 mb-6 leading-relaxed">
                      We bridge the gap between you and your business partners.
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      <button className="h-11 px-6 text-sm font-semibold rounded-md border border-gray-300 text-gray-800 bg-white hover:bg-gray-50 transition-colors">
                        Get a quote
                      </button>
                      <button className="h-11 px-6 text-sm font-semibold rounded-md bg-[rgb(247,147,30)] hover:bg-[rgb(230,130,20)] text-white transition-colors">
                        See Partnership Plan
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Container>
          </Section>

          {/* Resources Section */}
          <Resources blogsPromise={blogs} />

          {/* Get in Touch Section */}
          <GetInTouch />
        </Fragment>
      </Suspense>
    );
  } catch (error) {
    return <ErrorMessage message={error?.message} />;
  }
}

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
import { Empty, Section, Container } from "@/components/shared";
import ErrorMessage from "@/components/shared/errormessage";

export default async function Home() {
  try {
    const [blogs, details] = await Promise.all([
      getBlogTTNS(),
      getHomeDetails(),
    ]);

    const recentCompanies = details?.companies || [];
    const partners = details?.partners || [];
    const categories = details?.categories || [];
    const locations = details?.locations || [];
    const webAds = details?.webAds || [];
    const homeStats = {
      partners: details?.about?.partners || "0",
      countries: details?.about?.countries || "0",
      listed_business: details?.about?.listed_business || "0",
      factory_people: details?.about?.factory_people || "0",
      global_audience: details?.about?.global_audience || "0",
    };

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
          <BusinessArea />

          {/* Partners Section */}
          <Section className="bg-gray-50">
            <Container>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-8 uppercase">
                  We&apos;ve worked with some great companies
                </h3>
                {partners && partners.length > 0 ? (
                  <div className="flex flex-wrap justify-center items-center gap-6">
                    {partners.slice(0, 8).map((partner) => (
                      <div
                        key={partner.id}
                        className="h-16 w-40 flex items-center justify-center bg-white rounded-lg shadow-sm"
                      >
                        {partner.image ? (
                          <img
                            src={partner.image}
                            alt={partner.name}
                            className="max-h-12 max-w-32"
                          />
                        ) : (
                          <span className="text-gray-600">{partner.name}</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">Coming soon...</p>
                )}
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

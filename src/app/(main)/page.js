import React, { Fragment, Suspense } from "react";
import { getHomeDetails } from "@/services/home";
import { getBlogTTNS } from "@/services/blogs";

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
      partners: details?.about?.partners || "",
      countries: details?.about?.countries || "",
      listed_business: details?.about?.listed_business || "",
      factory_people: details?.about?.factory_people || "",
      global_audience: details?.about?.global_audience || "",
    };

    return (
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <p>Loading...</p>
          </div>
        }
      >
        <div className="container mx-auto py-8">
          <section className="text-center py-16">
            <h1 className="main-title">
              Connecting the Global Textile Industry
            </h1>
            <p className="mt-4 text-lg max-w-2xl mx-auto">
              The all-in-one platform connecting apparel & textile companies with
              global buyers for endless opportunities
            </p>
          </section>

          {recentCompanies.length > 0 && (
            <section className="py-8">
              <h2 className="text-2xl font-semibold mb-6">
                Recently Added Companies
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentCompanies.slice(0, 6).map((company) => (
                  <div
                    key={company.id}
                    className="border rounded-lg p-4 hover:shadow-card-shadow transition-shadow"
                  >
                    <h3 className="font-semibold text-gray-900">
                      {company.name}
                    </h3>
                    <p className="text-sm mt-1">{company.moto}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {blogs && blogs.length > 0 && (
            <section className="py-8">
              <h2 className="text-2xl font-semibold mb-6">Latest Resources</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogs.slice(0, 3).map((blog) => (
                  <div
                    key={blog.id}
                    className="border rounded-lg p-4 hover:shadow-card-shadow transition-shadow"
                  >
                    <h3 className="font-semibold text-gray-900">
                      {blog.title}
                    </h3>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </Suspense>
    );
  } catch (error) {
    return (
      <div className="container mx-auto py-16 text-center">
        <p className="text-red-500">
          {error?.message || "Something went wrong"}
        </p>
      </div>
    );
  }
}

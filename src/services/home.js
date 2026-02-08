import { apiRequest } from "@/utils/api";

/**
 * Fetch homepage data from the public API
 * This is a public endpoint that doesn't require authentication
 * Maps API response to expected homepage component structure
 */
export async function getHomeDetails() {
  try {
    // Fetch all required data in parallel
    const [homepageRes, categoriesRes, partnersRes] = await Promise.all([
      apiRequest("homepage", { method: "GET", cache: "no-store" }),
      apiRequest("business-categories", { method: "GET", cache: "no-store" }),
      apiRequest("partners", { method: "GET", cache: "no-store" }),
    ]);

    const homepageData = homepageRes?.data || {};
    const categoriesData = categoriesRes?.data || {};
    const partnersData = partnersRes?.data || {};

    // Extract locations from categories or use empty array
    const locations = categoriesData.locations || [];
    const categories = categoriesData.categories || [];
    const partners = Array.isArray(partnersData) ? partnersData : partnersData.data || [];

    // Map API response to homepage component structure
    const mappedData = {
      // About section - map from homepage data
      about: {
        description: homepageData.description || "",
        partners: homepageData.counts?.companies || "0",
        countries: homepageData.counts?.locations || "0",
        listed_business: homepageData.counts?.companies || "0",
        factory_people: homepageData.factory_people || "0",
        global_audience: homepageData.global_audience || "0",
        mission: homepageData.mission || "",
        vision: homepageData.vision || "",
        market_share: homepageData.market_share || [],
      },
      // Map featured companies to companies
      companies: homepageData.featured_companies || [],
      // Map featured blogs to blogs
      blogs: homepageData.featured_blogs || [],
      // Featured ads
      webAds: homepageData.featured_ads || homepageData.web_ads || [],
      // Partners from dedicated endpoint
      partners: partners,
      // Categories and locations from dedicated endpoints
      categories: categories,
      locations: locations,
    };

    console.log("Mapped Homepage Data:", {
      companiesCount: mappedData.companies.length,
      blogsCount: mappedData.blogs.length,
      categoriesCount: mappedData.categories.length,
      locationsCount: mappedData.locations.length,
      partnersCount: mappedData.partners.length,
    });

    return mappedData;
  } catch (error) {
    console.error("Error fetching homepage details:", error);
    return {
      about: {},
      webAds: [],
      partners: [],
      companies: [],
      categories: [],
      locations: [],
      blogs: [],
    };
  }
}

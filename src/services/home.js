import { apiRequest } from "@/utils/api";

/**
 * Fetch homepage data from the public API
 * This is a public endpoint that doesn't require authentication
 * Maps API response to expected homepage component structure
 */
export async function getHomeDetails() {
  try {
    // Fetch all required data in parallel
    const [homepageRes, aboutRes, categoriesRes, locationsRes, partnersRes] =
      await Promise.all([
        apiRequest("homepage", { method: "GET", cache: "no-store" }),
        apiRequest("about", { method: "GET", cache: "no-store" }),
        apiRequest("business-categories", { method: "GET", cache: "no-store" }),
        apiRequest("locations", { method: "GET", cache: "no-store" }),
        apiRequest("partners", { method: "GET", cache: "no-store" }),
      ]);

    const homepageData = homepageRes?.data || {};
    const aboutData = aboutRes?.data || {};

    // Defensive extraction for categories - handle multiple response structures
    let categoriesData = categoriesRes?.data || [];
    if (categoriesData && typeof categoriesData === 'object' && !Array.isArray(categoriesData) && categoriesData.data) {
      categoriesData = categoriesData.data;
    }
    const categories = Array.isArray(categoriesData) ? categoriesData : [];

    // Defensive extraction for locations - from dedicated API
    let locationsData = locationsRes?.data || [];
    if (locationsData && typeof locationsData === 'object' && !Array.isArray(locationsData) && locationsData.data) {
      locationsData = locationsData.data;
    }
    const locations = Array.isArray(locationsData) ? locationsData : [];

    // Defensive extraction for partners
    let partnersData = partnersRes?.data || [];
    if (partnersData && typeof partnersData === 'object' && !Array.isArray(partnersData) && partnersData.data) {
      partnersData = partnersData.data;
    }
    const partners = Array.isArray(partnersData) ? partnersData : [];

    // Map API response to homepage component structure
    const mappedData = {
      // About + stats section - map from dedicated "about" endpoint
      about: {
        description: aboutData.description || "",
        partners: aboutData.partners || "0",
        countries: aboutData.countries || "0",
        listed_business: aboutData.listed_business || "0",
        factory_people: aboutData.factory_people || "0",
        global_audience: aboutData.global_audience || "0",
        mission: aboutData.mission || "",
        vision: aboutData.vision || "",
        market_share: aboutData.market_share || [],
      },
      // Map featured companies & blogs from homepage data
      companies: homepageData.featured_companies || [],
      blogs: homepageData.featured_blogs || [],
      // Featured ads (if backend adds these later)
      webAds: homepageData.featured_ads || homepageData.web_ads || [],
      // Partners from dedicated endpoint
      partners: partners,
      // Categories and locations from dedicated endpoints
      categories: categories,
      locations: locations,
    };

    return mappedData;
  } catch (error) {
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

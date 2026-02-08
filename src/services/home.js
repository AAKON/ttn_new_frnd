import { apiRequest } from "@/utils/api";

/**
 * Fetch homepage data from the public API
 * This is a public endpoint that doesn't require authentication
 */
export async function getHomeDetails() {
  try {
    const response = await apiRequest("homepage", {
      method: "GET",
      cache: "no-store", // Disable cache for now to ensure fresh data
    });

    console.log("Homepage API Response:", response);

    // Handle different response structures
    if (response?.data) {
      const data = response.data;
      console.log("Homepage data:", {
        hasAbout: !!data.about,
        hasCategories: !!data.categories,
        categoriesLength: data.categories?.length || 0,
        hasLocations: !!data.locations,
        locationsLength: data.locations?.length || 0,
      });
      return data;
    }

    return null;
  } catch (error) {
    console.error("Error fetching homepage details:", error);
    return {
      about: {},
      webAds: [],
      partners: [],
      companies: [],
      categories: [],
      locations: [],
    };
  }
}

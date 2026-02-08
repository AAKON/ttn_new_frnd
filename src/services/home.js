import { apiRequest } from "@/utils/api";

/**
 * Fetch homepage data from the public API
 * This is a public endpoint that doesn't require authentication
 */
export async function getHomeDetails() {
  try {
    const response = await apiRequest("homepage", {
      method: "GET",
      cache: "revalidate",
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    if (response?.data) {
      return response.data;
    }

    return null;
  } catch (error) {
    console.error("Error fetching homepage details:", error);
    throw error;
  }
}

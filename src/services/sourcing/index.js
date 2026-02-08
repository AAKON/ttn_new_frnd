import { apiRequest } from "@/utils/api";
import { getSession } from "next-auth/react";

export async function getSourcingDetails(id, token) {
  const endpoint = `sourcing-proposals/${id}`;
  const options = { method: "GET" };
  return await apiRequest(endpoint, options, null, token);
}

export async function submitComment(id, comment, toast) {
  const session = await getSession();
  const token = session?.accessToken;

  const endpoint = `sourcing-proposals/${id}/comments`;
  const formData = new FormData();
  formData.append("comment", comment);

  const options = { method: "POST", body: formData, isFormData: true };
  return await apiRequest(endpoint, options, toast, token);
}

export async function getSourcingFilterOptions() {
  try {
    // Fetch categories and locations in parallel from dedicated endpoints
    const [categoriesRes, locationsRes] = await Promise.all([
      apiRequest(`business-categories`, { method: "GET" }),
      apiRequest(`locations`, { method: "GET" }),
    ]);

    // Extract data from responses
    let categories = categoriesRes?.data || [];
    if (categories && typeof categories === 'object' && !Array.isArray(categories) && categories.data) {
      categories = categories.data;
    }
    categories = Array.isArray(categories) ? categories : [];

    let locations = locationsRes?.data || [];
    if (locations && typeof locations === 'object' && !Array.isArray(locations) && locations.data) {
      locations = locations.data;
    }
    locations = Array.isArray(locations) ? locations : [];

    return {
      data: {
        categories,
        locations,
      }
    };
  } catch (error) {
    console.error("Error fetching filter options:", error);
    return {
      data: {
        categories: [],
        locations: [],
      }
    };
  }
}

export async function createSourcingProposal(formData, toast, token) {
  const endpoint = `my/sourcing-proposals/store`;
  const options = { method: "POST", body: formData, isFormData: true };
  return await apiRequest(endpoint, options, toast, token);
}

export async function submitReply(commentId, reply, toast) {
  const session = await getSession();
  const token = session?.accessToken;

  const endpoint = `sourcing-proposals/comments/${commentId}/replies`;
  const formData = new FormData();
  formData.append("reply", reply);

  const options = { method: "POST", body: formData, isFormData: true };
  return await apiRequest(endpoint, options, toast, token);
}

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
  const options = { method: "POST", body: { comment } };
  return await apiRequest(endpoint, options, toast, token);
}

export async function getSourcingFilterOptions() {
  try {
    const res = await apiRequest(`filter-options/sourcing-proposals`, { method: "GET" });
    const data = res?.data?.data || res?.data || {};
    return {
      data: {
        categories: Array.isArray(data.product_categories) ? data.product_categories : [],
        locations: Array.isArray(data.locations) ? data.locations : [],
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
  const options = { method: "POST", body: { reply } };
  return await apiRequest(endpoint, options, toast, token);
}

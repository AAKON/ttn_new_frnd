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
  const endpoint = `filter-options/sourcing-proposals`;
  const options = { method: "GET" };
  return await apiRequest(endpoint, options, null, null);
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

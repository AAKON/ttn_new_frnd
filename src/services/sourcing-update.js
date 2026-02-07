import { apiRequest } from "@/utils/api";

export async function updateSourcingProposal(id, formData, toast, token) {
  const endpoint = `my/sourcing-proposals/${id}/update`;
  const options = { method: "POST", body: formData, isFormData: true };
  return await apiRequest(endpoint, options, toast, token);
}

export async function deleteSourcingImage(proposalId, imageId, toast, token) {
  const endpoint = `my/sourcing-proposals/${proposalId}/images/${imageId}`;
  const options = { method: "DELETE" };
  return await apiRequest(endpoint, options, toast, token);
}

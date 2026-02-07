import { apiRequest } from "@/utils/api";

export async function reqNewsletter(data, toast) {
  const endpoint = "newsletter/submit";
  const options = { method: "POST", body: data, isFormData: false };
  return await apiRequest(endpoint, options, toast);
}

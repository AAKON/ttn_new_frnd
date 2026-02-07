import { apiRequest } from "@/utils/api";

export async function getPricingList() {
  const endpoint = `pricing/list`;
  const options = { method: "GET" };
  return await apiRequest(endpoint, options);
}

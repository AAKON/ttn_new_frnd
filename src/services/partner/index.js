import { apiRequest } from "@/utils/api";

export async function getPartnerList() {
  const endpoint = `partners`;
  const options = { method: "GET", next: { revalidate: 0 }, cache: "no-store" };
  const result = await apiRequest(endpoint, options);
  return result.data;
}

import { apiRequest } from "@/utils/api";

export async function getHomeDetails() {
  const endpoint = `homepage`;
  const options = {
    method: "GET",
    next: { revalidate: 0 },
    cache: "no-store",
  };
  const result = await apiRequest(endpoint, options);
  return result?.data;
}

export async function getBusinessArea() {
  const endpoint = `business-categories`;
  const options = {
    method: "GET",
    next: { revalidate: 0 },
    cache: "no-store",
  };
  const result = await apiRequest(endpoint, options);
  return result?.data;
}

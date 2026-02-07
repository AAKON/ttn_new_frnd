import { apiRequest } from "@/utils/api";

export async function getTeams() {
  const result = await apiRequest("team", {
    method: "GET",
    next: { revalidate: 3600 },
  });
  return result.data;
}

export async function getAbout() {
  const result = await apiRequest("about", {
    method: "GET",
    cache: "no-store",
  });
  return result.data;
}

export async function getTerms() {
  const result = await apiRequest("terms-and-conditions", {
    method: "GET",
    next: { revalidate: 3600 },
  });
  return result.data;
}

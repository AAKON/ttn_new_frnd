import { apiRequest } from "@/utils/api";
import { getSession } from "next-auth/react";

export async function getDataPreBasic() {
  try {
    // Fetch locations and business categories from dedicated public endpoints
    const [locationsRes, categoriesRes] = await Promise.all([
      apiRequest("locations", { method: "GET", cache: "no-store" }),
      apiRequest("business-categories", { method: "GET", cache: "no-store" }),
    ]);

    // Extract data from responses
    let locations = locationsRes?.data || [];
    if (locations && typeof locations === 'object' && !Array.isArray(locations) && locations.data) {
      locations = locations.data;
    }
    locations = Array.isArray(locations) ? locations : [];

    let businessCategories = categoriesRes?.data || [];
    if (businessCategories && typeof businessCategories === 'object' && !Array.isArray(businessCategories) && businessCategories.data) {
      businessCategories = businessCategories.data;
    }
    businessCategories = Array.isArray(businessCategories) ? businessCategories : [];

    return {
      locations,
      businessCategories,
    };
  } catch (error) {
    console.error("Error fetching prep data:", error);
    return {
      locations: [],
      businessCategories: [],
    };
  }
}

export async function getDataPreOverview() {
  const session = await getSession();
  const token = session?.accessToken;
  const endpoint = `my/company/preparation-data/for-overview`;
  const options = { method: "GET", cache: "no-store" };
  const result = await apiRequest(endpoint, options, null, token);
  return result?.data;
}

export async function getCompanyDetails(slug) {
  const endpoint = `company/${slug}`;
  const options = { method: "GET", cache: "no-store" };
  const result = await apiRequest(endpoint, options, null, null);
  return result?.data;
}

/** Public: submit contact request for a company (no auth). */
export async function submitCompanyContactRequest(slug, data) {
  const endpoint = `company/${slug}/contact-request`;
  const result = await apiRequest(endpoint, { method: "POST", body: data }, null, null);
  return result;
}

export async function getCompanyBasic(slug) {
  const session = await getSession();
  const token = session?.accessToken;
  const endpoint = `my/company/edit/${slug}`;
  const options = { method: "GET", cache: "no-store" };
  return await apiRequest(endpoint, options, null, token);
}

export async function getMyCompanies() {
  try {
    const session = await getSession();
    const token = session?.accessToken;

    if (!token) {
      console.warn("No token available for getMyCompanies");
      return [];
    }

    const endpoint = `my/company/list`;
    const options = { method: "GET", cache: "no-store" };
    const result = await apiRequest(endpoint, options, null, token);

    console.log("getMyCompanies result:", result);

    // Handle different response structures
    let data = result?.data?.data || result?.data || [];

    // Ensure it's an array
    if (!Array.isArray(data)) {
      if (typeof data === 'object' && data !== null) {
        data = [data];
      } else {
        data = [];
      }
    }

    return data;
  } catch (error) {
    console.error("Error in getMyCompanies:", error);
    return [];
  }
}

export async function searchMyCompanies(keyword = "") {
  const session = await getSession();
  const token = session?.accessToken;
  const endpoint = `my/company/list`;
  const payload = {
    locationId: null,
    manpower: [],
    certificateIds: [],
    businessCategoryIds: [],
    businessTypeIds: [],
    keyword: keyword,
  };
  const options = { method: "POST", body: payload, cache: "no-store" };
  const result = await apiRequest(endpoint, options, null, token);
  return result;
}

export async function searchCompanies(keyword = "") {
  const session = await getSession();
  const token = session?.accessToken;
  const endpoint = `company/list`;
  const payload = {
    locationId: null,
    manpower: [],
    certificateIds: [],
    businessCategoryIds: [],
    businessTypeIds: [],
    keyword: keyword,
  };
  const options = { method: "POST", body: payload, cache: "no-store" };
  const result = await apiRequest(endpoint, options, null, token);
  return result;
}

export async function getMyFavsCompanies() {
  const session = await getSession();
  const token = session?.accessToken;
  const endpoint = `my/favorite`;
  const options = { method: "GET", cache: "no-store" };
  const result = await apiRequest(endpoint, options, null, token);
  return result?.data;
}

export async function toggleFavCompany(slug, toast) {
  const session = await getSession();
  const token = session?.accessToken;
  const endpoint = `my/favorite/${slug}`;
  const options = { method: "GET", cache: "no-store" };
  const result = await apiRequest(endpoint, options, toast, token);
  // favorites controller returns { is_favorite: boolean }
  return result?.status && result?.code === 200 ? result?.data : null;
}

export async function delFavsCompanyFaq(slug, toast) {
  const res = await toggleFavCompany(slug, toast);
  return res !== null;
}

export async function getMyFavsSourcingProposals() {
  const session = await getSession();
  const token = session?.accessToken;
  const endpoint = `favorites/sourcing-proposals`;
  const options = { method: "GET", cache: "no-store" };
  const result = await apiRequest(endpoint, options, null, token);
  return result?.data?.data;
}

export async function getMySourcingProposals() {
  const session = await getSession();
  const token = session?.accessToken;
  const endpoint = `my/sourcing-proposals`;
  const options = { method: "GET", cache: "no-store" };
  const result = await apiRequest(endpoint, options, null, token);
  return result?.data?.data;
}

export async function toggleFavsSourcingProposal(id, toast) {
  const session = await getSession();
  const token = session?.accessToken;
  const endpoint = `favorites/sourcing-proposals/${id}/toggle`;
  const options = { method: "POST" };
  const result = await apiRequest(endpoint, options, toast, token);
  return result?.status && result?.code === 200;
}

export async function companyBasicReq(data, toast) {
  const session = await getSession();
  const token = session?.accessToken;
  const endpoint = "my/company/store";
  const options = { method: "POST", body: data, isFormData: true };
  return await apiRequest(endpoint, options, toast, token);
}

export async function companyBasicUpdateReq(slug, data, toast) {
  const session = await getSession();
  const token = session?.accessToken;
  const endpoint = `my/company/update/${slug}`;
  const options = { method: "POST", body: data, isFormData: true };
  return await apiRequest(endpoint, options, toast, token);
}

export async function companyOverviewReq(slug, data, toast) {
  const session = await getSession();
  const token = session?.accessToken;
  const endpoint = `my/company/${slug}/overview/store-or-update`;
  const options = { method: "POST", body: data };
  return await apiRequest(endpoint, options, toast, token);
}

export async function getCompanyOverview(slug) {
  const session = await getSession();
  const token = session?.accessToken;
  const endpoint = `my/company/${slug}/overview`;
  const options = { method: "GET", cache: "no-store" };
  const result = await apiRequest(endpoint, options, null, token);
  return result?.data;
}

export async function getBusinessContact(slug) {
  const session = await getSession();
  const token = session?.accessToken;
  const endpoint = `my/company/${slug}/contact`;
  const options = { method: "GET", cache: "no-store" };
  const result = await apiRequest(endpoint, options, null, token);
  return result?.data;
}

export async function companyBusinessContactReq(slug, data, toast) {
  const session = await getSession();
  const token = session?.accessToken;
  const endpoint = `my/company/${slug}/contact/store-or-update`;
  const options = { method: "POST", body: data };
  return await apiRequest(endpoint, options, toast, token);
}

export async function companyDecissionMakerReq(slug, data, toast) {
  const session = await getSession();
  const token = session?.accessToken;
  const endpoint = `my/company/${slug}/decision-maker/store`;
  const options = { method: "POST", body: data, isFormData: true };
  return await apiRequest(endpoint, options, toast, token);
}

export async function getDecisionMakers(slug) {
  const session = await getSession();
  const token = session?.accessToken;
  const endpoint = `my/company/${slug}/decision-maker`;
  const options = { method: "GET", cache: "no-store" };
  const result = await apiRequest(endpoint, options, null, token);
  return result?.data;
}

export async function delDecisionMaker(id, slug, toast) {
  const session = await getSession();
  const token = session?.accessToken;
  const endpoint = `my/company/${slug}/decision-maker/${id}/delete`;
  const options = { method: "GET" };
  const result = await apiRequest(endpoint, options, toast, token);
  return result?.status && result?.code === 200;
}

export async function updateDecisionMakerReq(slug, id, data, toast) {
  const session = await getSession();
  const token = session?.accessToken;
  const endpoint = `my/company/${slug}/decision-maker/${id}/update`;
  const options = { method: "POST", body: data, isFormData: true };
  return await apiRequest(endpoint, options, toast, token);
}

export async function companyFaqReq(slug, data, toast) {
  const session = await getSession();
  const token = session?.accessToken;
  const endpoint = `my/company/${slug}/faq/store`;
  const options = { method: "POST", body: data, isFormData: true };
  return await apiRequest(endpoint, options, toast, token);
}

export async function getCompanyFaqs(slug) {
  const session = await getSession();
  const token = session?.accessToken;
  const endpoint = `my/company/${slug}/faq`;
  const options = { method: "GET", cache: "no-store" };
  const result = await apiRequest(endpoint, options, null, token);
  return result?.data;
}

export async function delCompanyFaq(id, slug, toast) {
  const session = await getSession();
  const token = session?.accessToken;
  const endpoint = `my/company/${slug}/faq/${id}/delete`;
  const options = { method: "GET" };
  const result = await apiRequest(endpoint, options, toast, token);
  return result?.status && result?.code === 200;
}

export async function companyClientReq(slug, data, toast) {
  const session = await getSession();
  const token = session?.accessToken;
  const endpoint = `my/company/${slug}/client/store`;
  const options = { method: "POST", body: data, isFormData: true };
  return await apiRequest(endpoint, options, toast, token);
}

export async function companyCertificateReq(slug, data, toast) {
  const session = await getSession();
  const token = session?.accessToken;
  const endpoint = `my/company/certificates/${slug}`;
  const options = { method: "POST", body: data, isFormData: true };
  return await apiRequest(endpoint, options, toast, token);
}

export async function getCompanyClients(slug) {
  const session = await getSession();
  const token = session?.accessToken;
  const endpoint = `my/company/${slug}/client`;
  const options = { method: "GET", cache: "no-store" };
  const result = await apiRequest(endpoint, options, null, token);
  return result?.data;
}

export async function delCompanyClient(id, slug, toast) {
  const session = await getSession();
  const token = session?.accessToken;
  const endpoint = `my/company/${slug}/client/${id}/delete`;
  const options = { method: "GET" };
  const result = await apiRequest(endpoint, options, toast, token);
  return result?.status && result?.code === 200;
}

export async function delSourcingProposal(id, toast) {
  const session = await getSession();
  const token = session?.accessToken;
  const endpoint = `my/sourcing-proposals/${id}`;
  const options = { method: "DELETE" };
  const result = await apiRequest(endpoint, options, toast, token);
  return result?.status && result?.code === 200;
}

import { apiRequest } from "@/utils/api";
import { getSession } from "next-auth/react";
import { getSSToken } from "@/utils/getSSToken";

export async function getDataPreBasic() {
  const token = await getSSToken();
  const endpoint = `my/company/preparation-data/for-basic`;
  const options = { method: "GET", cache: "no-store" };
  const result = await apiRequest(endpoint, options, null, token);
  return result?.data;
}

export async function getDataPreOverview() {
  const token = await getSSToken();
  const endpoint = `my/company/preparation-data/for-overview`;
  const options = { method: "GET", cache: "no-store" };
  const result = await apiRequest(endpoint, options, null, token);
  return result?.data;
}

export async function getCompanyDetails(slug) {
  const token = await getSSToken();
  const endpoint = `company/${slug}`;
  const options = { method: "GET", next: { revalidate: 60 }, cache: "force-cache" };
  const result = await apiRequest(endpoint, options, null, token);
  return result?.data;
}

export async function getCompanyBasic(slug) {
  const token = await getSSToken();
  const endpoint = `my/company/edit/${slug}`;
  const options = { method: "GET", cache: "no-store" };
  return await apiRequest(endpoint, options, null, token);
}

export async function getMyCompanies() {
  const session = await getSession();
  const token = session?.accessToken;
  const endpoint = `my/company/list`;
  const options = { method: "GET", next: { revalidate: 60 }, cache: "force-cache" };
  const result = await apiRequest(endpoint, options, null, token);
  return result?.data;
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
  const options = { method: "GET", next: { revalidate: 60 }, cache: "force-cache" };
  const result = await apiRequest(endpoint, options, null, token);
  return result?.data;
}

export async function delFavsCompanyFaq(slug, toast) {
  const session = await getSession();
  const token = session?.accessToken;
  const endpoint = `my/favorite/${slug}`;
  const options = { method: "GET", next: { revalidate: 60 }, cache: "force-cache" };
  const result = await apiRequest(endpoint, options, toast, token);
  return result?.status && result?.code === 200;
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

import { apiRequest } from "@/utils/api";
import { getSession } from "next-auth/react";

async function adminRequest(endpoint, options = {}, toast) {
  const session = await getSession();
  const token = session?.accessToken;
  return await apiRequest(`admin/${endpoint}`, options, toast, token);
}

// Dashboard
export async function getDashboard() {
  return await adminRequest("dashboard", { method: "GET", cache: "no-store" });
}

// Role Management
export async function getRoles() {
  const result = await adminRequest("role-management", { method: "GET", cache: "no-store" });
  return result?.data;
}

export async function getRole(id) {
  const result = await adminRequest(`role-management/${id}`, { method: "GET", cache: "no-store" });
  return result?.data;
}

export async function getPermissions() {
  const result = await adminRequest("role-management/permissions", { method: "GET", cache: "no-store" });
  return result?.data;
}

export async function createRole(data, toast) {
  return await adminRequest("role-management", { method: "POST", body: data }, toast);
}

export async function updateRole(id, data, toast) {
  return await adminRequest(`role-management/${id}`, { method: "PUT", body: data }, toast);
}

export async function deleteRole(id, toast) {
  return await adminRequest(`role-management/${id}`, { method: "DELETE" }, toast);
}

// Admin Management
export async function getAdmins(page = 1, perPage = 10) {
  const result = await adminRequest(`admin-management?page=${page}&perPage=${perPage}`, { method: "GET", cache: "no-store" });
  return result?.data;
}

export async function createAdmin(data, toast) {
  return await adminRequest("admin-management", { method: "POST", body: data }, toast);
}

export async function updateAdmin(id, data, toast) {
  return await adminRequest(`admin-management/${id}`, { method: "PUT", body: data }, toast);
}

export async function deleteAdmin(id, toast) {
  return await adminRequest(`admin-management/${id}`, { method: "DELETE" }, toast);
}

// User Management
export async function getUsers(page = 1, perPage = 10, search = "") {
  let endpoint = `user-management?page=${page}&perPage=${perPage}`;
  if (search) endpoint += `&search=${encodeURIComponent(search)}`;
  const result = await adminRequest(endpoint, { method: "GET", cache: "no-store" });
  return result?.data;
}

export async function deleteUser(id, toast) {
  return await adminRequest(`user-management/${id}`, { method: "DELETE" }, toast);
}

export async function toggleBan(id, toast) {
  return await adminRequest(`user-management/${id}/toggle-ban`, { method: "POST" }, toast);
}

// Business Categories
export async function getBusinessCategories() {
  const result = await adminRequest("business-categories", { method: "GET", cache: "no-store" });
  return result?.data;
}

export async function createBusinessCategory(data, toast) {
  return await adminRequest("business-categories", { method: "POST", body: data, isFormData: true }, toast);
}

export async function updateBusinessCategory(id, data, toast) {
  return await adminRequest(`business-categories/${id}`, { method: "PUT", body: data, isFormData: true }, toast);
}

export async function deleteBusinessCategory(id, toast) {
  return await adminRequest(`business-categories/${id}`, { method: "DELETE" }, toast);
}

// Business Types
export async function getBusinessTypes() {
  const result = await adminRequest("business-types", { method: "GET", cache: "no-store" });
  return result?.data;
}

export async function createBusinessType(data, toast) {
  return await adminRequest("business-types", { method: "POST", body: data }, toast);
}

export async function updateBusinessType(id, data, toast) {
  return await adminRequest(`business-types/${id}`, { method: "PUT", body: data }, toast);
}

export async function deleteBusinessType(id, toast) {
  return await adminRequest(`business-types/${id}`, { method: "DELETE" }, toast);
}

// Certificates
export async function getCertificates() {
  const result = await adminRequest("certificates", { method: "GET", cache: "no-store" });
  return result?.data;
}

export async function createCertificate(data, toast) {
  return await adminRequest("certificates", { method: "POST", body: data, isFormData: true }, toast);
}

export async function updateCertificate(id, data, toast) {
  return await adminRequest(`certificates/${id}`, { method: "PUT", body: data, isFormData: true }, toast);
}

export async function deleteCertificate(id, toast) {
  return await adminRequest(`certificates/${id}`, { method: "DELETE" }, toast);
}

// Product Categories
export async function getProductCategories() {
  const result = await adminRequest("product-categories", { method: "GET", cache: "no-store" });
  return result?.data;
}

export async function createProductCategory(data, toast) {
  return await adminRequest("product-categories", { method: "POST", body: data }, toast);
}

export async function updateProductCategory(id, data, toast) {
  return await adminRequest(`product-categories/${id}`, { method: "PUT", body: data }, toast);
}

export async function deleteProductCategory(id, toast) {
  return await adminRequest(`product-categories/${id}`, { method: "DELETE" }, toast);
}

// Blogs
export async function getAdminBlogs(page = 1, perPage = 10) {
  const result = await adminRequest(`blogs?page=${page}&perPage=${perPage}`, { method: "GET", cache: "no-store" });
  return result?.data;
}

export async function getAdminBlog(id) {
  const result = await adminRequest(`blogs/${id}`, { method: "GET", cache: "no-store" });
  return result?.data;
}

export async function createBlog(data, toast) {
  return await adminRequest("blogs", { method: "POST", body: data, isFormData: true }, toast);
}

export async function updateBlog(id, data, toast) {
  return await adminRequest(`blogs/${id}`, { method: "PUT", body: data, isFormData: true }, toast);
}

export async function deleteBlog(id, toast) {
  return await adminRequest(`blogs/${id}`, { method: "DELETE" }, toast);
}

export async function toggleBlogStatus(id, toast) {
  return await adminRequest(`blogs/${id}/toggle-status`, { method: "POST" }, toast);
}

// Admin Companies
export async function getAdminCompanies(page = 1, perPage = 10, search = "", status = "", isActive = "") {
  let endpoint = `companies?page=${page}&perPage=${perPage}`;
  if (search) endpoint += `&search=${encodeURIComponent(search)}`;
  if (status) endpoint += `&status=${encodeURIComponent(status)}`;
  if (isActive !== "") endpoint += `&is_active=${encodeURIComponent(isActive)}`;
  const result = await adminRequest(endpoint, { method: "GET", cache: "no-store" });
  return result?.data;
}

export async function toggleCompanyActive(id, toast) {
  return await adminRequest(`companies/${id}/toggle-active`, { method: "POST" }, toast);
}

export async function deleteAdminCompany(id, toast) {
  return await adminRequest(`companies/${id}`, { method: "DELETE" }, toast);
}

// Blog Types
export async function getBlogTypes() {
  const result = await adminRequest("blog-types", { method: "GET", cache: "no-store" });
  return result?.data;
}

export async function createBlogType(data, toast) {
  return await adminRequest("blog-types", { method: "POST", body: data }, toast);
}

export async function updateBlogType(id, data, toast) {
  return await adminRequest(`blog-types/${id}`, { method: "PUT", body: data }, toast);
}

export async function deleteBlogType(id, toast) {
  return await adminRequest(`blog-types/${id}`, { method: "DELETE" }, toast);
}

// Pricing
export async function getPricings() {
  const result = await adminRequest("pricing", { method: "GET", cache: "no-store" });
  return result?.data;
}

export async function createPricing(data, toast) {
  return await adminRequest("pricing", { method: "POST", body: data }, toast);
}

export async function updatePricing(id, data, toast) {
  return await adminRequest(`pricing/${id}`, { method: "PUT", body: data }, toast);
}

export async function deletePricing(id, toast) {
  return await adminRequest(`pricing/${id}`, { method: "DELETE" }, toast);
}

// Partners
export async function getPartners() {
  const result = await adminRequest("partners", { method: "GET", cache: "no-store" });
  return result?.data;
}

export async function createPartner(data, toast) {
  return await adminRequest("partners", { method: "POST", body: data, isFormData: true }, toast);
}

export async function updatePartner(id, data, toast) {
  return await adminRequest(`partners/${id}`, { method: "PUT", body: data, isFormData: true }, toast);
}

export async function deletePartner(id, toast) {
  return await adminRequest(`partners/${id}`, { method: "DELETE" }, toast);
}

// Team
export async function getTeam() {
  const result = await adminRequest("team", { method: "GET", cache: "no-store" });
  return result?.data;
}

export async function createTeamMember(data, toast) {
  return await adminRequest("team", { method: "POST", body: data, isFormData: true }, toast);
}

export async function updateTeamMember(id, data, toast) {
  return await adminRequest(`team/${id}`, { method: "PUT", body: data, isFormData: true }, toast);
}

export async function deleteTeamMember(id, toast) {
  return await adminRequest(`team/${id}`, { method: "DELETE" }, toast);
}

// About
export async function getAbout() {
  const result = await adminRequest("about", { method: "GET", cache: "no-store" });
  return result?.data;
}

export async function updateAbout(data, toast) {
  return await adminRequest("about", { method: "POST", body: data, isFormData: true }, toast);
}

// Business Ads
export async function getBusinessAds() {
  const result = await adminRequest("business-ads", { method: "GET", cache: "no-store" });
  return result?.data;
}

export async function createBusinessAd(data, toast) {
  return await adminRequest("business-ads", { method: "POST", body: data, isFormData: true }, toast);
}

export async function updateBusinessAd(id, data, toast) {
  return await adminRequest(`business-ads/${id}`, { method: "PUT", body: data, isFormData: true }, toast);
}

export async function deleteBusinessAd(id, toast) {
  return await adminRequest(`business-ads/${id}`, { method: "DELETE" }, toast);
}

// Contact Messages
export async function getContactMessages(page = 1, perPage = 10) {
  const result = await adminRequest(`contact-messages?page=${page}&perPage=${perPage}`, { method: "GET", cache: "no-store" });
  return result?.data;
}

export async function updateContactMessage(id, data, toast) {
  return await adminRequest(`contact-messages/${id}`, { method: "PUT", body: data }, toast);
}

export async function deleteContactMessage(id, toast) {
  return await adminRequest(`contact-messages/${id}`, { method: "DELETE" }, toast);
}

// Company Reports
export async function getCompanyReports(page = 1, perPage = 10) {
  const result = await adminRequest(`company-reports?page=${page}&perPage=${perPage}`, { method: "GET", cache: "no-store" });
  return result?.data;
}

export async function deleteCompanyReport(id, toast) {
  return await adminRequest(`company-reports/${id}`, { method: "DELETE" }, toast);
}

// Company Emails
export async function getCompanyEmails(page = 1, perPage = 10) {
  const result = await adminRequest(`company-emails?page=${page}&perPage=${perPage}`, { method: "GET", cache: "no-store" });
  return result?.data;
}

export async function updateCompanyEmail(id, data, toast) {
  return await adminRequest(`company-emails/${id}`, { method: "PUT", body: data }, toast);
}

export async function deleteCompanyEmail(id, toast) {
  return await adminRequest(`company-emails/${id}`, { method: "DELETE" }, toast);
}

// Company Claims
export async function getCompanyClaims(page = 1, perPage = 10) {
  const result = await adminRequest(`company-claims?page=${page}&perPage=${perPage}`, { method: "GET", cache: "no-store" });
  return result?.data;
}

export async function updateClaimStatus(id, data, toast) {
  return await adminRequest(`company-claims/${id}/status`, { method: "POST", body: data }, toast);
}

// Newsletter
export async function getNewsletters(page = 1, perPage = 10) {
  const result = await adminRequest(`newsletter?page=${page}&perPage=${perPage}`, { method: "GET", cache: "no-store" });
  return result?.data;
}

export async function deleteNewsletter(id, toast) {
  return await adminRequest(`newsletter/${id}`, { method: "DELETE" }, toast);
}

// Site Settings
export async function getSiteSettings() {
  const result = await adminRequest("site-settings", { method: "GET", cache: "no-store" });
  return result?.data;
}

export async function updateSiteSettings(data, toast) {
  return await adminRequest("site-settings", { method: "POST", body: data }, toast);
}

// Sourcing Proposals (Admin)
export async function getAdminProposals(page = 1, perPage = 10) {
  const result = await adminRequest(`sourcing-proposals?page=${page}&perPage=${perPage}`, { method: "GET", cache: "no-store" });
  return result?.data;
}

export async function approveProposal(id, toast) {
  return await adminRequest(`sourcing-proposals/${id}/approve`, { method: "POST" }, toast);
}

export async function rejectProposal(id, toast) {
  return await adminRequest(`sourcing-proposals/${id}/reject`, { method: "POST" }, toast);
}

export async function deleteAdminProposal(id, toast) {
  return await adminRequest(`sourcing-proposals/${id}`, { method: "DELETE" }, toast);
}

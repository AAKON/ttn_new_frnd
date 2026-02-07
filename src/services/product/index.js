import { apiRequest } from "@/utils/api";
import { getSession } from "next-auth/react";

export async function uploadProductReq(slug, data, toast) {
  const session = await getSession();
  const token = session?.accessToken;
  const endpoint = `my/company/${slug}/product/store`;
  const options = { method: "POST", body: data, isFormData: true };
  return await apiRequest(endpoint, options, toast, token);
}

export async function updateProductReq(slug, id, data, toast) {
  const session = await getSession();
  const token = session?.accessToken;
  const endpoint = `my/company/${slug}/product/${id}/update`;
  const options = { method: "POST", body: data, isFormData: true };
  return await apiRequest(endpoint, options, toast, token);
}

export async function getCompanyProducts(slug) {
  const session = await getSession();
  const token = session?.accessToken;
  const endpoint = `my/company/${slug}/product`;
  const options = { method: "GET", cache: "no-store" };
  const result = await apiRequest(endpoint, options, null, token);
  return result?.data;
}

export async function delCompanyProduct(id, slug, toast) {
  const session = await getSession();
  const token = session?.accessToken;
  const endpoint = `my/company/${slug}/product/${id}/delete`;
  const options = { method: "GET" };
  const result = await apiRequest(endpoint, options, toast, token);
  return result?.status && result?.code === 200;
}

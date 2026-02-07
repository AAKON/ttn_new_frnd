import { apiRequest } from "@/utils/api";
import { getSession } from "next-auth/react";

export async function regAuth(data, toast) {
  const endpoint = "auth/register";
  const options = {
    method: "POST",
    body: data,
    isFormData: false,
  };
  return await apiRequest(endpoint, options, toast);
}

export async function forgotPassword(data, toast) {
  const endpoint = "auth/forgot-password";
  const options = {
    method: "POST",
    body: data,
    isFormData: false,
  };
  return await apiRequest(endpoint, options, toast);
}

export async function resetPassword(data, toast) {
  const endpoint = "auth/reset-password";
  const options = {
    method: "POST",
    body: data,
    isFormData: false,
  };
  return await apiRequest(endpoint, options, toast);
}

export async function getProfile() {
  const session = await getSession();
  const token = session?.accessToken;

  const endpoint = "auth/user";
  const options = { method: "GET" };
  const result = await apiRequest(endpoint, options, null, token);
  return result?.data;
}

export async function updateUserProfileReq(data, toast) {
  const session = await getSession();
  const token = session?.accessToken;

  const endpoint = `auth/user`;
  const options = {
    method: "POST",
    body: data,
    isFormData: true,
  };
  return await apiRequest(endpoint, options, toast, token);
}

export async function updateUserPasswordReq(data, toast) {
  const session = await getSession();
  const token = session?.accessToken;

  const endpoint = `auth/change-password`;
  const options = {
    method: "POST",
    body: data,
    isFormData: true,
  };
  return await apiRequest(endpoint, options, toast, token);
}

import { getSession } from "next-auth/react";

export async function getSSToken() {
  try {
    const session = await getSession();
    return session?.accessToken || null;
  } catch (error) {
    console.error("Error getting token:", error);
    return null;
  }
}

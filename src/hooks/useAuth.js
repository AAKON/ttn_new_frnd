"use client";
import { useSession } from "next-auth/react";

export function useIsAdmin() {
  const { data: session } = useSession();
  const roles = session?.user?.roles || [];
  return roles.includes("administrator");
}

export function useHasRole(roleName) {
  const { data: session } = useSession();
  const roles = session?.user?.roles || [];
  return roles.includes(roleName);
}

"use client";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, LogOut, Menu, X } from "lucide-react";

export default function AuthNavbar({ showMobileNav, setShowMobileNav }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const isHome = pathname === "/";

  if (status === "loading") {
    return <div className="w-20 h-9 bg-gray-200 rounded animate-pulse" />;
  }

  return (
    <div className="flex items-center gap-3">
      {session ? (
        <div className="flex items-center gap-3">
          <Link
            href="/myaccount/profile"
            className={`text-sm font-semibold hidden md:inline ${
              isHome ? "text-gray-200" : "text-gray-900"
            }`}
          >
            {session.user?.user_name || "Account"}
          </Link>
          {session.user?.roles?.includes("administrator") && (
            <Link
              href="/admin"
              className="text-xs font-semibold bg-brand-600 text-white px-3 py-1.5 rounded-md hidden md:inline"
            >
              Admin
            </Link>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className={`p-2 bg-transparent ${
              isHome ? "text-gray-200" : "text-gray-600"
            } hover:text-brand-600 hidden md:flex`}
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      ) : (
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className={`text-sm font-semibold ${
              isHome ? "text-gray-200" : "text-gray-700"
            }`}
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="text-sm font-semibold bg-brand-600 text-white px-4 py-2 rounded-md"
          >
            Sign up
          </Link>
        </div>
      )}

      <button
        onClick={() => setShowMobileNav(!showMobileNav)}
        className={`p-2 lg:hidden bg-transparent ${
          isHome ? "text-gray-200" : "text-gray-900"
        }`}
      >
        {showMobileNav ? <X size={24} /> : <Menu size={24} />}
      </button>
    </div>
  );
}

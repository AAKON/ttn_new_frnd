"use client";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User, LogOut, Menu, X, Plus } from "lucide-react";
import { useState } from "react";

export default function AuthNavbar({ showMobileNav, setShowMobileNav }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";
  const [showAddDropdown, setShowAddDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  if (status === "loading") {
    return <div className="w-20 h-9 bg-gray-200 rounded animate-pulse" />;
  }

  const handleAddOption = (type) => {
    setShowAddDropdown(false);

    if (!session) {
      router.push("/login");
      return;
    }

    if (type === "sourcing") {
      router.push("/sourcing/create");
    } else if (type === "listing") {
      router.push("/company/create");
    }
  };

  const handleDropdownNavigation = (path) => {
    router.push(path);
    setShowUserDropdown(false);
  };

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <button
          onClick={() => setShowAddDropdown(!showAddDropdown)}
          className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-4 py-2 rounded-md hidden md:flex items-center gap-2 transition-colors"
        >
          <Plus size={18} />
          Add
        </button>

        {showAddDropdown && (
          <div className="absolute top-full right-0 mt-2 bg-white shadow-lg rounded-md py-2 min-w-[160px] z-50">
            <span
              onClick={() => handleAddOption("sourcing")}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              Sourcing
            </span>
            <span
              onClick={() => handleAddOption("listing")}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              Listing
            </span>
          </div>
        )}
      </div>

      {session ? (
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 hidden md:flex items-center justify-center"
            title="User Menu"
          >
            <User size={20} />
          </button>

          {showUserDropdown && (
            <div className="absolute top-full right-0 mt-2 bg-white shadow-lg rounded-md py-2 min-w-[160px] z-50">
              <span
                onClick={() => handleDropdownNavigation("/myaccount/profile")}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                My Account
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Logout
              </button>
            </div>
          )}
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

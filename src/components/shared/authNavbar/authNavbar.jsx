"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User, Menu, X, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { getProfile } from "@/services/auth/auth";

export default function AuthNavbar({ showMobileNav, setShowMobileNav }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";
  const [showAddDropdown, setShowAddDropdown] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (session?.accessToken) {
      getProfile()
        .then((profile) => {
          if (profile?.profile_picture) {
            // Ensure URL is absolute
            let url = profile.profile_picture;
            if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
              // If relative URL, prepend API base URL
              const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
              url = url.startsWith('/') ? `${apiBase}${url}` : `${apiBase}/${url}`;
            }
            setProfilePicture(url);
            setImageError(false);
          }
        })
        .catch((err) => {
          console.error('Failed to fetch profile:', err);
          // Fallback to session profile_image if API fails
          if (session?.user?.profile_image) {
            let url = session.user.profile_image;
            if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
              const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
              url = url.startsWith('/') ? `${apiBase}${url}` : `${apiBase}/${url}`;
            }
            setProfilePicture(url);
            setImageError(false);
          }
        });
    } else if (session?.user?.profile_image) {
      let url = session.user.profile_image;
      if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
        const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
        url = url.startsWith('/') ? `${apiBase}${url}` : `${apiBase}/${url}`;
      }
      setProfilePicture(url);
      setImageError(false);
    }
  }, [session]);

  if (status === "loading") {
    return <div className="w-20 h-9 bg-gray-200 rounded animate-pulse" />;
  }

  const avatarUrl = profilePicture || null;
  const showImage = avatarUrl && !imageError;

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

  const displayName = session?.user?.full_name || session?.user?.user_name || "My Account";
  const displayEmail = session?.user?.email || "";

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <button
          onClick={() => setShowAddDropdown(!showAddDropdown)}
          className="h-9 md:h-10 px-3 md:px-5 text-xs md:text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-md flex items-center justify-center gap-1.5 md:gap-2 transition-colors"
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
        <div
          className="relative"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <Link
            href="/myaccount/profile"
            className={`flex items-center justify-center rounded-full overflow-hidden border relative w-11 h-11 ${
              showImage
                ? "border-gray-200 bg-gray-100"
                : "border-transparent bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            {showImage ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="absolute inset-0 w-full h-full object-cover object-center"
                onError={() => {
                  setImageError(true);
                }}
                onLoad={() => {
                  setImageError(false);
                }}
              />
            ) : (
              <User size={22} />
            )}
          </Link>

          {showTooltip && (
            <div className="absolute top-full right-0 mt-2 py-2 px-3 rounded-lg bg-gray-900 text-white text-xs shadow-lg z-50 min-w-[160px]">
              <p className="font-semibold text-white truncate">{displayName}</p>
              {displayEmail && (
                <p className="text-gray-300 truncate mt-0.5">{displayEmail}</p>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className={`h-9 md:h-10 px-3 md:px-5 text-xs md:text-sm font-semibold rounded-md flex items-center justify-center transition-colors ${
              isHome
                ? "text-gray-900 bg-white border border-gray-100 hover:bg-gray-50"
                : "text-gray-800 bg-white border border-gray-200 hover:bg-gray-50"
            }`}
          >
            Login
          </Link>
        </div>
      )}

      <button
        onClick={() => setShowMobileNav(!showMobileNav)}
        className={`p-2 lg:hidden bg-transparent ${
          isHome ? "text-gray-300" : "text-gray-900"
        }`}
      >
        {showMobileNav ? <X size={24} /> : <Menu size={24} />}
      </button>
    </div>
  );
}

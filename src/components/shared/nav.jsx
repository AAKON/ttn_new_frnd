"use client";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import AuthNavbar from "@/components/shared/authNavbar/authNavbar";

const menuItems = [
  { id: 1, label: "Home", path: "/" },
  { id: 2, label: "Company", path: "/company" },
  { id: 3, label: "Sourcing", path: "/sourcing" },
  { id: 4, label: "Blog", path: "/blog" },
  { id: 5, label: "Pricing", path: "/pricing" },
];

const moreItems = [
  { id: 1, label: "About Us", path: "/about" },
  { id: 2, label: "Partner", path: "/partner" },
  { id: 3, label: "Contact Us", path: "/contact" },
];

export const Nav = ({ showMobileNav, setShowMobileNav, isSticky }) => {
  const pathname = usePathname();
  const router = useRouter();

  const handleNavigate = (path) => {
    router.push(path);
    setShowMobileNav(false);
  };

  return (
    <>
      <nav>
        <div className="container mx-auto">
          <div className="flex justify-between items-center gap-12">
            <div className="logo">
              <Link href="/" className="font-bold text-xl">
                <span
                  className={`${
                    pathname === "/" && !isSticky
                      ? "text-white"
                      : "text-brand-600"
                  }`}
                >
                  Textile Network
                </span>
              </Link>
            </div>

            <div className="flex-1 hidden items-center lg:gap-6 lg:flex">
              <ul className="flex lg:gap-8 md:gap-6 items-center">
                {menuItems.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={item.path}
                      className={`text-base font-semibold ${
                        pathname === item.path ? "active-nav-item" : ""
                      } ${
                        pathname === "/" ? "text-gray-200" : "text-gray-900"
                      } ${isSticky ? "text-gray-900" : ""}`}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="relative group">
                <span
                  className={`text-base font-semibold flex gap-2 items-center cursor-pointer ${
                    pathname === "/partner" ||
                    pathname === "/about" ||
                    pathname === "/contact"
                      ? "active-nav-item"
                      : ""
                  } ${pathname === "/" ? "text-gray-200" : "text-gray-900"} ${
                    isSticky ? "text-gray-900" : ""
                  }`}
                >
                  More
                </span>
                <div className="absolute top-full left-0 hidden group-hover:block bg-white shadow-lg rounded-md py-2 min-w-[160px] z-50">
                  {moreItems.map((item) => (
                    <span
                      key={item.id}
                      onClick={() => handleNavigate(item.path)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                    >
                      {item.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <AuthNavbar
              showMobileNav={showMobileNav}
              setShowMobileNav={setShowMobileNav}
            />
          </div>
        </div>
      </nav>

      {showMobileNav && (
        <div className="h-screen w-screen bg-white fixed z-30 top-[76px] p-4 lg:hidden">
          <div className="mt-4 overflow-x-scroll max-h-[calc(100vh-300px)] scrollbar-hidden">
            <ul className="flex flex-col gap-3">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <span
                    className="bg-[#F4F5F6] p-2 text-gray-900 font-semibold text-base min-h-12 rounded-[8px] block cursor-pointer"
                    onClick={() => handleNavigate(item.path)}
                  >
                    {item.label}
                  </span>
                </li>
              ))}
              {moreItems.map((item) => (
                <li key={`more-${item.id}`}>
                  <span
                    className="bg-[#F4F5F6] p-2 text-gray-900 font-semibold text-base min-h-12 rounded-[8px] block cursor-pointer"
                    onClick={() => handleNavigate(item.path)}
                  >
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
};

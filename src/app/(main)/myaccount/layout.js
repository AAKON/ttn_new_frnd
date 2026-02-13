"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { User, Building2, Heart, ShoppingBag, Lock, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarItems = [
  { label: "Profile", href: "/myaccount/profile", icon: User },
  { label: "My Companies", href: "/myaccount/companies", icon: Building2 },
  { label: "Favorites", href: "/myaccount/favorites", icon: Heart },
  { label: "Sourcing Proposals", href: "/myaccount/sourcing-proposals", icon: ShoppingBag },
  { label: "Change Password", href: "/myaccount/change-password", icon: Lock },
];

export default function MyAccountLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">My Account</h1>
      <div className="flex flex-col md:flex-row gap-6">
        <aside className="w-full md:w-56 shrink-0">
          <nav className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-2 space-y-0.5">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-[rgba(247,147,30,0.12)] text-[rgb(247,147,30)]"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <Icon
                      size={18}
                      className={cn("flex-shrink-0", isActive ? "text-[rgb(247,147,30)]" : "text-gray-500")}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
            <div className="border-t border-gray-100 p-2">
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-lg text-sm font-semibold text-white bg-[rgb(247,147,30)] hover:bg-[rgb(230,130,20)] transition-colors"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </nav>
        </aside>
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}

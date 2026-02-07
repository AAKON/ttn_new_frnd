"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Building2, Heart, ShoppingBag, Lock } from "lucide-react";
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
      <h1 className="mb-6">My Account</h1>
      <div className="flex flex-col md:flex-row gap-6">
        <aside className="w-full md:w-64 shrink-0">
          <nav className="bg-white rounded-lg border border-gray-200 p-2 space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link key={item.href} href={item.href}
                  className={cn("flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                    isActive ? "bg-brand-50 text-brand-600" : "text-gray-600 hover:bg-gray-50")}>
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}

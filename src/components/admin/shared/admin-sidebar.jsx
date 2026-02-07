"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Shield,
  Users,
  UserCog,
  Building2,
  Layers,
  Award,
  FolderTree,
  FileText,
  Tag,
  DollarSign,
  Handshake,
  UsersRound,
  Info,
  Megaphone,
  Mail,
  AlertTriangle,
  AtSign,
  Gavel,
  Newspaper,
  Settings,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Roles", href: "/admin/roles", icon: Shield },
  { label: "Admins", href: "/admin/admins", icon: UserCog },
  { label: "Users", href: "/admin/users", icon: Users },
  { type: "divider", label: "Business" },
  { label: "Business Categories", href: "/admin/business-categories", icon: Layers },
  { label: "Business Types", href: "/admin/business-types", icon: Tag },
  { label: "Certificates", href: "/admin/certificates", icon: Award },
  { label: "Product Categories", href: "/admin/product-categories", icon: FolderTree },
  { type: "divider", label: "Content" },
  { label: "Blogs", href: "/admin/blogs", icon: FileText },
  { label: "Blog Types", href: "/admin/blog-types", icon: Tag },
  { label: "Pricing", href: "/admin/pricing", icon: DollarSign },
  { type: "divider", label: "More" },
  { label: "Partners", href: "/admin/partners", icon: Handshake },
  { label: "Team", href: "/admin/team", icon: UsersRound },
  { label: "About", href: "/admin/about", icon: Info },
  { label: "Business Ads", href: "/admin/business-ads", icon: Megaphone },
  { label: "Contact Messages", href: "/admin/contact-messages", icon: Mail },
  { label: "Company Reports", href: "/admin/company-reports", icon: AlertTriangle },
  { label: "Company Emails", href: "/admin/company-emails", icon: AtSign },
  { label: "Company Claims", href: "/admin/company-claims", icon: Gavel },
  { label: "Newsletter", href: "/admin/newsletter", icon: Newspaper },
  { label: "Site Settings", href: "/admin/site-settings", icon: Settings },
  { label: "Sourcing Proposals", href: "/admin/sourcing-proposals", icon: ShoppingBag },
];

export default function AdminSidebar({ open, onToggle }) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen bg-white border-r border-gray-200 transition-all duration-300 hidden lg:block",
          open ? "w-64" : "w-16"
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          {open && (
            <Link href="/admin" className="font-bold text-lg text-brand-600">
              TTN Admin
            </Link>
          )}
          <button
            onClick={onToggle}
            className="p-1 rounded hover:bg-gray-100 bg-transparent text-gray-600"
          >
            {open ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        <nav className="p-2 space-y-1 overflow-y-auto h-[calc(100vh-64px)] scrollbar-hidden">
          {menuItems.map((item, index) => {
            if (item.type === "divider") {
              return open ? (
                <div key={index} className="pt-4 pb-1 px-3">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {item.label}
                  </span>
                </div>
              ) : (
                <div key={index} className="pt-2 pb-1">
                  <hr className="border-gray-200" />
                </div>
              );
            }

            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-brand-50 text-brand-600"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
                title={!open ? item.label : undefined}
              >
                <Icon size={20} className="shrink-0" />
                {open && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onToggle}
        />
      )}
    </>
  );
}

"use client";
import { useSession, signOut } from "next-auth/react";
import { Menu, LogOut, User } from "lucide-react";
import Link from "next/link";

export default function AdminHeader({ onToggleSidebar }) {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-200 h-16">
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-md hover:bg-gray-100 bg-transparent text-gray-600 lg:hidden"
          >
            <Menu size={20} />
          </button>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            View Site
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center">
              <User size={16} className="text-brand-600" />
            </div>
            <span className="text-sm font-medium text-gray-700 hidden md:inline">
              {session?.user?.full_name || "Admin"}
            </span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="p-2 rounded-md hover:bg-gray-100 bg-transparent text-gray-600"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}

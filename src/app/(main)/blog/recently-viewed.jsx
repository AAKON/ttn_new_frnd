"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "recentlyViewedBlogs";

export default function RecentlyViewedBlogs() {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setBlogs(parsed);
      }
    } catch {
      // ignore parsing errors
    }
  }, []);

  if (!blogs.length) return null;

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Recently viewed</h3>
      <div className="space-y-3">
        {blogs.slice(0, 6).map((blog) => (
          <Link
            key={blog.id}
            href={`/blog/${blog.slug}`}
            className="block group"
          >
            <p className="text-xs font-medium text-gray-900 group-hover:text-brand-600 line-clamp-2">
              {blog.title}
            </p>
            {blog.created_at && (
              <p className="mt-1 text-[11px] text-gray-400">
                {new Date(blog.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}


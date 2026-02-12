"use client";

import { useEffect } from "react";
import { saveRecentlyViewedBlog } from "@/utils/recentlyViewedBlogs";

export default function BlogDetailClient({ blog }) {
  useEffect(() => {
    if (!blog) return;
    try {
      saveRecentlyViewedBlog({
        id: blog.id,
        slug: blog.slug,
        title: blog.title,
        created_at: blog.created_at,
      });
    } catch {
      // ignore storage errors
    }
  }, [blog]);

  return null;
}


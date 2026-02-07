import { getBlogs, getBlogTypes } from "@/services/blogs";
import Link from "next/link";

export default async function BlogPage({ searchParams }) {
  const params = await searchParams;
  const currentPage = Number(params?.page) || 1;
  const activeType = params?.type || "";
  const keyword = params?.keyword || "";

  let blogs = [];
  let blogTypes = [];
  let totalPages = 1;

  try {
    const [blogsData, typesData] = await Promise.all([
      getBlogs(activeType, keyword, currentPage),
      getBlogTypes(),
    ]);

    blogs = blogsData?.data || blogsData || [];
    blogTypes = typesData || [];
    totalPages = blogsData?.last_page || 1;
  } catch (error) {
    // Data will remain empty arrays
  }

  return (
    <div className="container mx-auto py-10">
      <div className="text-center mb-10">
        <h1>Our Blog</h1>
        <p className="mt-3 text-lg max-w-2xl mx-auto">
          Stay updated with the latest insights from the textile industry
        </p>
      </div>

      <div className="mb-8">
        <form method="GET" action="/blog" className="flex items-center gap-4 justify-center mb-6">
          {activeType && <input type="hidden" name="type" value={activeType} />}
          <input
            type="text"
            name="keyword"
            defaultValue={keyword}
            placeholder="Search blogs..."
            className="input_style max-w-md"
          />
          <button type="submit" className="bg-brand-600 text-white px-6 py-2 rounded-md">
            Search
          </button>
        </form>

        <div className="flex flex-wrap gap-2 justify-center">
          <Link
            href="/blog"
            className={`px-4 py-2 rounded-full text-sm border transition-colors ${
              !activeType
                ? "bg-brand-600 text-white border-brand-600"
                : "bg-white text-gray-700 border-gray-300 hover:border-brand-600"
            }`}
          >
            All
          </Link>
          {blogTypes.map((type) => (
            <Link
              key={type.id}
              href={`/blog?type=${type.id}${keyword ? `&keyword=${keyword}` : ""}`}
              className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                String(activeType) === String(type.id)
                  ? "bg-brand-600 text-white border-brand-600"
                  : "bg-white text-gray-700 border-gray-300 hover:border-brand-600"
              }`}
            >
              {type.name}
            </Link>
          ))}
        </div>
      </div>

      {blogs.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">No blogs found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <Link
              key={blog.id}
              href={`/blog/${blog.slug}`}
              className="border rounded-lg overflow-hidden hover:shadow-card-shadow transition-shadow group"
            >
              {blog.featured_image && (
                <div className="aspect-video overflow-hidden bg-gray-50">
                  <img
                    src={blog.featured_image}
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="p-5">
                {blog.blog_type && (
                  <span className="text-xs font-semibold text-brand-600 uppercase tracking-wide">
                    {blog.blog_type.name || blog.blog_type}
                  </span>
                )}
                <h3 className="text-lg font-semibold text-gray-900 mt-2 line-clamp-2">
                  {blog.title}
                </h3>
                {blog.short_description && (
                  <p className="text-sm text-gray-500 mt-2 line-clamp-3">
                    {blog.short_description}
                  </p>
                )}
                {blog.created_at && (
                  <p className="text-xs text-gray-400 mt-3">
                    {new Date(blog.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-10">
          {currentPage > 1 && (
            <Link
              href={`/blog?page=${currentPage - 1}${activeType ? `&type=${activeType}` : ""}${keyword ? `&keyword=${keyword}` : ""}`}
              className="px-4 py-2 border rounded-md text-sm text-gray-700 hover:bg-gray-50"
            >
              Previous
            </Link>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Link
              key={page}
              href={`/blog?page=${page}${activeType ? `&type=${activeType}` : ""}${keyword ? `&keyword=${keyword}` : ""}`}
              className={`px-4 py-2 border rounded-md text-sm ${
                page === currentPage
                  ? "bg-brand-600 text-white border-brand-600"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {page}
            </Link>
          ))}
          {currentPage < totalPages && (
            <Link
              href={`/blog?page=${currentPage + 1}${activeType ? `&type=${activeType}` : ""}${keyword ? `&keyword=${keyword}` : ""}`}
              className="px-4 py-2 border rounded-md text-sm text-gray-700 hover:bg-gray-50"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

import { getBlogs, getBlogTypes, getBlogTTNS } from "@/services/blogs";
import Link from "next/link";
import RecentlyViewedBlogs from "./recently-viewed";

export default async function BlogPage({ searchParams }) {
  const params = await searchParams;
  const currentPage = Number(params?.page) || 1;
  const activeType = params?.type || "";
  const keyword = params?.keyword || "";

  let blogs = [];
  let blogTypes = [];
  let featuredBlogs = [];
  let totalPages = 1;

  try {
    const [blogsData, typesData, featuredData] = await Promise.all([
      getBlogs(activeType, keyword, currentPage),
      getBlogTypes(),
      getBlogTTNS(),
    ]);

    // Support both paginated and plain array responses for main list
    blogs = blogsData?.data || blogsData || [];
    blogTypes = typesData || [];

    // Featured blogs – handle multiple possible API shapes safely
    if (Array.isArray(featuredData)) {
      featuredBlogs = featuredData;
    } else if (Array.isArray(featuredData?.data)) {
      featuredBlogs = featuredData.data;
    } else if (Array.isArray(featuredData?.data?.data)) {
      featuredBlogs = featuredData.data.data;
    } else {
      featuredBlogs = [];
    }

    // If API returns no featured blogs, gracefully fall back to first few blogs
    if ((!featuredBlogs || featuredBlogs.length === 0) && Array.isArray(blogs)) {
      featuredBlogs = blogs.slice(0, 3);
    }

    totalPages = blogsData?.last_page || 1;
  } catch (error) {
    // Data will remain empty arrays
  }

  const getImage = (blog) =>
    blog?.featured_image || blog?.featured_image_url || blog?.image || "";

  return (
    <div className="bg-[#f8fafc]">
      <div className="max-w-6xl mx-auto px-4 lg:px-0 py-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-900">
            Stitching Stories
          </h1>
          <p className="mt-3 text-sm md:text-base text-gray-500 max-w-2xl mx-auto">
            The latest stories, insights, and resources from the textile and
            apparel ecosystem.
          </p>
        </div>

        <div className="mb-6">
          <form
            method="GET"
            action="/blog"
            className="flex flex-col md:flex-row md:items-center gap-3 justify-center"
          >
            {activeType && <input type="hidden" name="type" value={activeType} />}
            <input
              type="text"
              name="keyword"
              defaultValue={keyword}
              placeholder="Search articles, topics or keywords"
              className="input_style max-w-xl w-full"
            />
            <button
              type="submit"
              className="bg-brand-600 text-white px-6 py-2 rounded-md text-sm font-medium"
            >
              Search
            </button>
          </form>

          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            <Link
              href="/blog"
              className={`px-4 py-1.5 rounded-full text-xs md:text-sm border transition-colors ${
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
                href={`/blog?type=${type.id}${
                  keyword ? `&keyword=${keyword}` : ""
                }`}
                className={`px-4 py-1.5 rounded-full text-xs md:text-sm border transition-colors ${
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
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2.5fr)_minmax(0,1fr)] gap-10">
            {/* Main list */}
            <div className="space-y-4">
              {blogs.map((blog) => {
                const tags =
                  blog.blog_types && Array.isArray(blog.blog_types)
                    ? blog.blog_types
                    : blog.blog_type
                    ? [blog.blog_type]
                    : [];

                return (
                  <Link
                    key={blog.id}
                    href={`/blog/${blog.slug}`}
                    className="group flex gap-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                  >
                    {getImage(blog) && (
                      <div className="w-40 md:w-56 bg-gray-100 overflow-hidden flex-shrink-0">
                        <img
                          src={getImage(blog)}
                          alt={blog.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0 py-3 pr-4">
                      {tags && tags.length > 0 && (
                        <div className="mb-1.5 flex flex-wrap gap-1">
                          {tags.slice(0, 3).map((tag, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-orange-50 text-[11px] font-medium text-orange-600 border border-orange-100"
                            >
                              {typeof tag === "string" ? tag : tag.name}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-start gap-1.5">
                        <h2 className="flex-1 text-sm md:text-base font-semibold text-gray-900 group-hover:text-brand-600 line-clamp-2">
                          {blog.title}
                        </h2>
                        <span className="mt-0.5 text-gray-300 group-hover:text-brand-500 transition-colors">
                          ↗
                        </span>
                      </div>

                      {blog.short_description && (
                        <p className="mt-1 text-xs md:text-sm text-gray-500 line-clamp-2">
                          {blog.short_description}
                        </p>
                      )}

                      {blog.created_at && (
                        <div className="mt-2 flex items-center gap-2 text-[11px] text-gray-400">
                          <span className="inline-flex items-center gap-1">
                            <span className="inline-block w-3 h-3 rounded-sm border border-gray-300 flex items-center justify-center text-[9px]">
                              {/* simple calendar icon substitute */}
                              📅
                            </span>
                            <span>
                              {new Date(blog.created_at).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )}
                            </span>
                          </span>
                          <span className="h-0.5 w-0.5 rounded-full bg-gray-300" />
                          <span className="text-gray-500">
                            Textile &amp; apparel
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 pt-4">
                  {currentPage > 1 && (
                    <Link
                      href={`/blog?page=${currentPage - 1}${
                        activeType ? `&type=${activeType}` : ""
                      }${keyword ? `&keyword=${keyword}` : ""}`}
                      className="px-3 py-1.5 border rounded-md text-xs md:text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Previous
                    </Link>
                  )}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <Link
                        key={page}
                        href={`/blog?page=${page}${
                          activeType ? `&type=${activeType}` : ""
                        }${keyword ? `&keyword=${keyword}` : ""}`}
                        className={`px-3 py-1.5 border rounded-md text-xs md:text-sm ${
                          page === currentPage
                            ? "bg-brand-600 text-white border-brand-600"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </Link>
                    )
                  )}
                  {currentPage < totalPages && (
                    <Link
                      href={`/blog?page=${currentPage + 1}${
                        activeType ? `&type=${activeType}` : ""
                      }${keyword ? `&keyword=${keyword}` : ""}`}
                      className="px-3 py-1.5 border rounded-md text-xs md:text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Next
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-8">
              {featuredBlogs.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    Featured
                  </h3>
                  <div className="space-y-3">
                    {featuredBlogs.slice(0, 3).map((blog) => (
                      <Link
                        key={blog.id}
                        href={`/blog/${blog.slug}`}
                        className="flex gap-3 group"
                      >
                        {getImage(blog) && (
                          <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                            <img
                              src={getImage(blog)}
                              alt={blog.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-gray-900 group-hover:text-brand-600 line-clamp-2">
                            {blog.title}
                          </p>
                          {blog.created_at && (
                            <p className="mt-1 text-[11px] text-gray-400">
                              {new Date(blog.created_at).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {blogTypes.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    Browse by topics
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {blogTypes.map((type) => (
                      <Link
                        key={type.id}
                        href={`/blog?type=${type.id}`}
                        className="px-3 py-1 rounded-full border border-gray-200 bg-white text-xs text-gray-700 hover:border-brand-600 hover:text-brand-700"
                      >
                        {type.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <RecentlyViewedBlogs />
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}

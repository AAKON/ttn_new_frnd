import { Container, Section } from "@/components/shared";
import Link from "next/link";

const Resources = async ({ blogsPromise }) => {
  let blogs = [];
  try {
    blogs = await blogsPromise;
  } catch (error) {
    console.error("Error loading blogs:", error);
  }

  if (!blogs || blogs.length === 0) return null;

  return (
    <Section>
      <Container>
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Resources</h2>
          <p className="text-gray-600">Latest industry insights and best practices</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {blogs.slice(0, 3).map((blog) => (
            <Link
              key={blog.id}
              href={`/blog/${blog.slug || blog.id}`}
              className="group"
            >
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all group-hover:border-brand-600 h-full">
                {blog.featured_image && (
                  <div className="relative overflow-hidden h-48">
                    <img
                      src={blog.featured_image}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="font-semibold text-gray-900 group-hover:text-brand-600 transition line-clamp-2 mb-2">
                    {blog.title}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {blog.created_at
                      ? new Date(blog.created_at).toLocaleDateString()
                      : ""}
                  </p>
                  {blog.excerpt && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {blog.excerpt || "No excerpt available"}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/blog"
            className="inline-block px-8 py-3 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 transition"
          >
            Load Articles
          </Link>
        </div>
      </Container>
    </Section>
  );
};

export default Resources;

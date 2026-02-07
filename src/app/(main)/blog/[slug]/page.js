import { getBlogDetails } from "@/services/blogs";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function BlogDetailPage({ params }) {
  const { slug } = await params;
  let blog = null;

  try {
    blog = await getBlogDetails(slug);
  } catch (error) {
    notFound();
  }

  if (!blog) {
    notFound();
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Link
          href="/blog"
          className="text-sm text-brand-600 hover:underline inline-flex items-center gap-1"
        >
          &larr; Back to Blog
        </Link>
      </div>

      <article className="max-w-4xl mx-auto blog-details-container">
        {blog.blog_type && (
          <span className="text-sm font-semibold text-brand-600 uppercase tracking-wide">
            {blog.blog_type.name || blog.blog_type}
          </span>
        )}

        <h1 className="mt-3 mb-4">{blog.title}</h1>

        {blog.created_at && (
          <p className="text-sm text-gray-400 mb-8">
            Published on{" "}
            {new Date(blog.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        )}

        {blog.featured_image && (
          <div className="mb-8 rounded-lg overflow-hidden">
            <img
              src={blog.featured_image}
              alt={blog.title}
              className="w-full h-auto object-cover max-h-[500px]"
            />
          </div>
        )}

        {blog.body && (
          <div
            className="paragraph prose max-w-none text-gray-600"
            dangerouslySetInnerHTML={{ __html: blog.body }}
          />
        )}
      </article>
    </div>
  );
}

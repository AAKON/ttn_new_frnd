"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createBlog, getBlogTypes } from "@/services/admin";
import { useToast } from "@/hooks/use-toast";
import FormWrapper from "@/components/admin/form-wrapper";

export default function CreateBlogPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [blogTypes, setBlogTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    body: "",
    featured_image: null,
    blog_types: [],
    is_featured: false,
  });

  const fetchBlogTypes = useCallback(async () => {
    try {
      const data = await getBlogTypes();
      setBlogTypes(data || []);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    fetchBlogTypes();
  }, [fetchBlogTypes]);

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setForm({
      ...form,
      title,
      slug: title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-"),
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, featured_image: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const toggleBlogType = (typeId) => {
    setForm((prev) => ({
      ...prev,
      blog_types: prev.blog_types.includes(typeId)
        ? prev.blog_types.filter((id) => id !== typeId)
        : [...prev.blog_types, typeId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("slug", form.slug);
      formData.append("body", form.body);
      formData.append("is_featured", form.is_featured ? "1" : "0");
      if (form.featured_image) {
        formData.append("featured_image", form.featured_image);
      }
      form.blog_types.forEach((typeId) => {
        formData.append("blog_types[]", typeId);
      });
      await createBlog(formData, toast);
      router.push("/admin/blogs");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormWrapper
      title="Create Blog"
      backHref="/admin/blogs"
      onSubmit={handleSubmit}
      loading={loading}
      submitLabel="Create Blog"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input
          type="text"
          value={form.title}
          onChange={handleTitleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
        <input
          type="text"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Body</label>
        <textarea
          value={form.body}
          onChange={(e) => setForm({ ...form, body: e.target.value })}
          rows={10}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Featured Image</label>
        {preview && (
          <img src={preview} alt="Preview" className="w-32 h-20 rounded object-cover mb-2" />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Blog Types</label>
        <div className="flex flex-wrap gap-2 border border-gray-200 rounded-lg p-3">
          {blogTypes.length === 0 && (
            <span className="text-sm text-gray-400">No blog types available</span>
          )}
          {blogTypes.map((type) => (
            <label
              key={type.id}
              className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={form.blog_types.includes(type.id)}
                onChange={() => toggleBlogType(type.id)}
                className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
              {type.name}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.is_featured}
            onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
            className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
          />
          <span className="text-sm font-medium text-gray-700">Featured Blog</span>
        </label>
      </div>
    </FormWrapper>
  );
}

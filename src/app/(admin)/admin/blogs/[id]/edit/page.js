"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { getAdminBlog, updateBlog, getBlogTypes } from "@/services/admin";

export default function EditBlogPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [blog, setBlog] = useState(null);
  const [blogTypes, setBlogTypes] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      getAdminBlog(id).then((d) => { setBlog(d); setSelectedTypes(d?.blog_types?.map((t) => t.id) || []); }),
      getBlogTypes().then(setBlogTypes),
    ]).finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", blog.title || "");
      fd.append("body", blog.body || "");
      fd.append("is_featured", blog.is_featured ? "1" : "0");
      selectedTypes.forEach((t) => fd.append("blog_type_ids[]", t));
      if (image) fd.append("featured_image", image);
      const result = await updateBlog(id, fd, toast);
      if (result?.status) router.push("/admin/blogs");
    } finally { setSaving(false); }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Edit Blog</h1>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="formLabelClasses block mb-1">Title</label>
            <input type="text" value={blog?.title || ""} onChange={(e) => setBlog({ ...blog, title: e.target.value })} className="input_style" required />
          </div>
          <div>
            <label className="formLabelClasses block mb-1">Body</label>
            <textarea value={blog?.body || ""} onChange={(e) => setBlog({ ...blog, body: e.target.value })} className="input_style min-h-[200px]" rows={8} />
          </div>
          <div>
            <label className="formLabelClasses block mb-1">Featured Image</label>
            <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} className="text-sm" />
          </div>
          <div>
            <label className="formLabelClasses block mb-2">Blog Types</label>
            <div className="flex flex-wrap gap-2">
              {blogTypes?.map((t) => (
                <button key={t.id} type="button" onClick={() => setSelectedTypes((prev) => prev.includes(t.id) ? prev.filter((x) => x !== t.id) : [...prev, t.id])}
                  className={`px-3 py-1.5 text-sm rounded-full border ${selectedTypes.includes(t.id) ? "tag-active" : "border-gray-200 text-gray-700 bg-white"}`}>{t.name}</button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={blog?.is_featured || false} onChange={(e) => setBlog({ ...blog, is_featured: e.target.checked })} className="rounded" />
            <label className="text-sm">Featured</label>
          </div>
          <button type="submit" disabled={saving} className="bg-brand-600 text-white rounded-lg px-6 py-2.5 font-semibold disabled:opacity-50">{saving ? "Saving..." : "Update Blog"}</button>
        </form>
      </div>
    </div>
  );
}

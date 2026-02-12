"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { getAdminBlog, updateBlog, getBlogTypes } from "@/services/admin";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TiptapLinkExtension from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import TipTapImage from "@tiptap/extension-image";
import { Node, Mark } from "@tiptap/core";

const TextColor = Mark.create({
  name: "textColor",
  inclusive: true,
  group: "inline",
  spanning: true,
  attrs: { color: { default: null } },
  parseHTML: () => [{ style: "color" }],
  renderHTML: ({ HTMLAttributes }) => ["span", HTMLAttributes, 0],
  addAttributes() {
    return {
      color: {
        default: null,
        parseHTML: (el) => el.style.color || null,
        renderHTML: (attrs) => (attrs.color ? { style: `color: ${attrs.color}` } : {}),
      },
    };
  },
});

const Columns = Node.create({
  name: "columns",
  group: "block",
  content: "block+",
  defining: true,
  draggable: true,
  isolating: true,
  addAttributes() {
    return {
      columns: {
        default: 2,
        parseHTML: (el) => {
          const n = parseInt(el.getAttribute("data-columns") || "2", 10);
          return Number.isNaN(n) ? 2 : n;
        },
        renderHTML: (attrs) => ({ "data-columns": attrs.columns || 2 }),
      },
      height: {
        default: 250,
        parseHTML: (el) => {
          const n = parseInt(el.getAttribute("data-height") || "250", 10);
          return Number.isNaN(n) ? 250 : n;
        },
        renderHTML: (attrs) => ({ "data-height": attrs.height || 250 }),
      },
    };
  },
  parseHTML: () => [{ tag: "div[data-columns]" }],
  renderHTML({ node }) {
    const cols = node.attrs.columns || 2;
    const height = node.attrs.height || 250;
    return [
      "div",
      {
        "data-columns": String(cols),
        class: "ttn-columns",
        "data-height": String(height),
        style: `margin:16px 0;gap:8px;align-items:stretch;height:${height}px;`,
      },
      0,
    ];
  },
});

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
  const [pendingImageColumns, setPendingImageColumns] = useState(1);
  const [sectionHeight, setSectionHeight] = useState("250");
  const bodyImageInputRef = useRef(null);

  useEffect(() => {
    Promise.all([
      getAdminBlog(id).then((d) => {
        setBlog(d);
        setSelectedTypes(d?.blog_types?.map((t) => t.id) || []);
      }),
      getBlogTypes().then(setBlogTypes),
    ]).finally(() => setLoading(false));
  }, [id]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      TiptapLinkExtension.configure({ openOnClick: false, linkOnPaste: true }),
      TextColor,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TipTapImage.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            style: {
              default: null,
              parseHTML: (el) => el.getAttribute("style") || null,
              renderHTML: (attrs) => (attrs.style ? { style: attrs.style } : {}),
            },
            draggable: {
              default: "true",
              parseHTML: (el) => el.getAttribute("draggable") || "true",
              renderHTML: (attrs) => (attrs.draggable ? { draggable: attrs.draggable } : {}),
            },
          };
        },
      }).configure({ inline: false, allowBase64: true }),
      Columns,
    ],
    content: blog?.content ?? "",
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setBlog((prev) => (prev ? { ...prev, content: editor.getHTML() } : prev));
    },
    editorProps: {
      attributes: { class: "min-h-[160px] outline-none p-3 text-sm text-gray-700" },
    },
  });

  // When navigating to another blog, sync editor content
  useEffect(() => {
    if (editor && blog?.content != null) {
      const current = editor.getHTML();
      if (current !== blog.content) editor.commands.setContent(blog.content, false);
    }
  }, [blog?.id, blog?.content, editor]);

  const compressBase64Image = (base64String, maxWidth = 1920, quality = 0.8) => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => resolve(base64String);
      img.src = base64String;
    });
  };

  const processBodyImages = async (html) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const images = doc.querySelectorAll("img[src^='data:']");
    for (const img of images) {
      const src = img.getAttribute("src");
      if (src?.startsWith("data:image")) {
        try {
          img.setAttribute("src", await compressBase64Image(src));
        } catch (e) {
          console.error(e);
        }
      }
    }
    return doc.documentElement.outerHTML.replace(/^<html><body>|<\/body><\/html>$/g, "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let content = editor?.getHTML() ?? blog?.content ?? "";
      if (content.includes("data:image")) {
        content = await processBodyImages(content);
      }
      const plainText = content
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      const shortDescription = plainText.slice(0, 255);

      const fd = new FormData();
      fd.append("title", blog.title || "");
      fd.append("content", content);
      fd.append("short_description", shortDescription);
      fd.append("is_featured", blog.is_featured ? "true" : "false");
      selectedTypes.forEach((t) => fd.append("blog_type_ids[]", t));
      if (image) fd.append("featured_image", image);

      const result = await updateBlog(id, fd, toast);
      if (result?.status) router.push("/admin/blogs");
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleBodyImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !editor) return;
    const cols = Math.min(Math.max(pendingImageColumns || 1, 1), 3);
    const limited = files.slice(0, cols);
    const read = (file) =>
      new Promise((resolve) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result);
        r.readAsDataURL(file);
      });
    Promise.all(limited.map(read)).then((urls) => {
      if (!urls.length) return;
      if (cols === 1) {
        editor.chain().focus().setImage({ src: urls[0], alt: "", style: "max-width:100%;height:auto;" }).run();
      } else {
        const content = urls.map((url) => ({
          type: "paragraph",
          content: [
            {
              type: "image",
              attrs: { src: url, alt: "", style: "width:100%;max-width:100%;border-radius:0.5rem;" },
            },
          ],
        }));
        editor.chain().focus().insertContent({ type: "columns", attrs: { columns: cols }, content }).run();
      }
    });
    e.target.value = "";
    setPendingImageColumns(1);
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!blog) return <div className="p-6">Blog not found.</div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Edit Blog</h1>
        <Link
          href="/admin/blogs"
          className="text-sm text-brand-600 hover:underline"
        >
          &larr; Back to Blogs
        </Link>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="formLabelClasses block mb-1">Title</label>
            <input
              type="text"
              value={blog.title || ""}
              onChange={(e) => setBlog({ ...blog, title: e.target.value })}
              className="input_style"
              required
            />
          </div>

          <div>
            <label className="formLabelClasses block mb-1">Body</label>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="flex flex-wrap items-center gap-1 px-2 py-1.5 border-b border-gray-200 bg-gray-50">
                <button type="button" onClick={() => editor?.chain().focus().toggleBold().run()} className={`px-1.5 py-1 rounded text-xs font-bold ${editor?.isActive("bold") ? "bg-gray-200" : "hover:bg-gray-100"}`}>B</button>
                <button type="button" onClick={() => editor?.chain().focus().toggleItalic().run()} className={`px-1.5 py-1 rounded text-xs italic ${editor?.isActive("italic") ? "bg-gray-200" : "hover:bg-gray-100"}`}>I</button>
                <button type="button" onClick={() => editor?.chain().focus().toggleUnderline().run()} className={`px-1.5 py-1 rounded text-xs underline ${editor?.isActive("underline") ? "bg-gray-200" : "hover:bg-gray-100"}`}>U</button>
                <div className="h-5 w-px bg-gray-200 mx-1" />
                {[1, 2, 3].map((level) => (
                  <button key={level} type="button" onClick={() => editor?.chain().focus().toggleHeading({ level }).run()} className={`px-1.5 py-1 rounded text-xs ${editor?.isActive("heading", { level }) ? "bg-gray-200" : "hover:bg-gray-100"}`}>H{level}</button>
                ))}
                <div className="h-5 w-px bg-gray-200 mx-1" />
                <button type="button" onClick={() => editor?.chain().focus().toggleBulletList().run()} className={`p-1.5 rounded ${editor?.isActive("bulletList") ? "bg-gray-200" : "hover:bg-gray-100"}`}>•</button>
                <button type="button" onClick={() => editor?.chain().focus().toggleOrderedList().run()} className={`p-1.5 rounded ${editor?.isActive("orderedList") ? "bg-gray-200" : "hover:bg-gray-100"}`}>1.</button>
                <div className="h-5 w-px bg-gray-200 mx-1" />
                {["left", "center", "right", "justify"].map((align, i) => (
                  <button key={align} type="button" onClick={() => editor?.chain().focus().setTextAlign(align).run()} className={`px-1.5 py-1 rounded text-[10px] ${editor?.isActive({ textAlign: align }) ? "bg-gray-200" : "hover:bg-gray-100"}`}>{["L", "C", "R", "J"][i]}</button>
                ))}
                <div className="h-5 w-px bg-gray-200 mx-1" />
                {[{ color: "#111827", className: "bg-gray-900" }, { color: "#ef4444", className: "bg-red-500" }, { color: "#22c55e", className: "bg-emerald-500" }, { color: "#3b82f6", className: "bg-blue-500" }, { color: "#f97316", className: "bg-orange-500" }].map((c) => (
                  <button key={c.color} type="button" onClick={() => editor?.chain().focus().setMark("textColor", { color: c.color }).run()} className={`w-5 h-5 rounded-full border border-gray-300 ${c.className}`} />
                ))}
                <button type="button" onClick={() => editor?.chain().focus().unsetMark("textColor").run()} className="px-1.5 py-1 rounded text-[11px] hover:bg-gray-100">Clear color</button>
                <div className="h-5 w-px bg-gray-200 mx-1" />
                <button type="button" onClick={() => { setPendingImageColumns(1); bodyImageInputRef.current?.click(); }} className="px-2 py-1 rounded text-xs hover:bg-gray-100">+ Image</button>
                <button type="button" onClick={() => { setPendingImageColumns(2); bodyImageInputRef.current?.click(); }} className="px-2 py-1 rounded text-xs hover:bg-gray-100">2 Img</button>
                <button type="button" onClick={() => { setPendingImageColumns(3); bodyImageInputRef.current?.click(); }} className="px-2 py-1 rounded text-xs hover:bg-gray-100">3 Img</button>
                <div className="h-5 w-px bg-gray-200 mx-1" />
                <button type="button" onClick={() => { if (!editor) return; const n = Math.min(Math.max(parseInt(prompt("Columns (1-4)?") || "2", 10), 1), 4); const content = Array.from({ length: n }, (_, i) => ({ type: "paragraph", content: [{ type: "text", text: `Column ${i + 1}` }] })); editor.chain().focus().insertContent({ type: "columns", attrs: { columns: n, height: parseInt(sectionHeight || "250", 10) || 250 }, content }).run(); }} className="px-2 py-1 rounded text-xs hover:bg-gray-100">Columns</button>
                <div className="flex items-center gap-1 ml-1">
                  <span className="text-[11px] text-gray-400">H(px):</span>
                  <input type="number" min={100} max={1000} value={sectionHeight} onChange={(e) => { setSectionHeight(e.target.value); const num = parseInt(e.target.value, 10); if (editor && !Number.isNaN(num)) editor.commands.updateAttributes("columns", { height: num }); }} className="w-14 px-1 py-0.5 border border-gray-200 rounded text-[11px]" />
                </div>
                <div className="h-5 w-px bg-gray-200 mx-1" />
                <button type="button" onClick={() => { const url = prompt("Link URL"); if (url) editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run(); }} className="px-2 py-1 rounded text-xs hover:bg-gray-100">Link</button>
                <button type="button" onClick={() => editor?.chain().focus().unsetLink().run()} className="px-2 py-1 rounded text-xs hover:bg-gray-100">Unlink</button>
                <div className="h-5 w-px bg-gray-200 mx-1" />
                <button type="button" onClick={() => editor?.chain().focus().unsetAllMarks().clearNodes().run()} className="px-2 py-1 rounded text-xs hover:bg-gray-100">Clear</button>
              </div>
              <EditorContent editor={editor} />
              <input ref={bodyImageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleBodyImagesChange} />
            </div>
          </div>

          <div>
            <label className="formLabelClasses block mb-1">Featured Image</label>
            {(blog.featured_image_url || image) && (
              <img src={image ? URL.createObjectURL(image) : blog.featured_image_url} alt="Featured" className="w-32 h-20 rounded object-cover mb-2" />
            )}
            <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0])} className="text-sm" />
          </div>

          <div>
            <label className="formLabelClasses block mb-2">Blog Types</label>
            <div className="flex flex-wrap gap-2">
              {blogTypes?.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTypes((prev) => (prev.includes(t.id) ? prev.filter((x) => x !== t.id) : [...prev, t.id]))}
                  className={`px-3 py-1.5 text-sm rounded-full border ${selectedTypes.includes(t.id) ? "tag-active" : "border-gray-200 text-gray-700 bg-white"}`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" checked={blog.is_featured || false} onChange={(e) => setBlog({ ...blog, is_featured: e.target.checked })} className="rounded" />
            <label className="text-sm">Featured</label>
          </div>

          <button type="submit" disabled={saving} className="bg-brand-600 text-white rounded-lg px-6 py-2.5 font-semibold disabled:opacity-50">
            {saving ? "Saving..." : "Update Blog"}
          </button>
        </form>
      </div>
    </div>
  );
}

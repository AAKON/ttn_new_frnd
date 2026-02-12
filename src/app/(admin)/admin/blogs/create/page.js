"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { createBlog, getBlogTypes } from "@/services/admin";
import { useToast } from "@/hooks/use-toast";
import FormWrapper from "@/components/admin/form-wrapper";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import TipTapImage from "@tiptap/extension-image";
import { Node, Mark } from "@tiptap/core";

const TextColor = Mark.create({
  name: "textColor",
  inclusive: true,
  group: "inline",
  spanning: true,
  attrs: {
    color: {
      default: null,
    },
  },
  parseHTML() {
    return [
      {
        style: "color",
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return ["span", HTMLAttributes, 0];
  },
  addAttributes() {
    return {
      color: {
        default: null,
        parseHTML: (element) => element.style.color || null,
        renderHTML: (attributes) =>
          attributes.color ? { style: `color: ${attributes.color}` } : {},
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
        parseHTML: (element) => {
          const attr = element.getAttribute("data-columns");
          const parsed = parseInt(attr || "2", 10);
          return Number.isNaN(parsed) ? 2 : parsed;
        },
        renderHTML: (attributes) => ({
          "data-columns": attributes.columns || 2,
        }),
      },
      height: {
        default: 250,
        parseHTML: (element) => {
          const raw = element.getAttribute("data-height");
          const parsed = parseInt(raw || "250", 10);
          return Number.isNaN(parsed) ? 250 : parsed;
        },
        renderHTML: (attributes) => ({
          "data-height": attributes.height || 250,
        }),
      },
    };
  },
  parseHTML() {
    return [
      {
        tag: 'div[data-columns]',
      },
    ];
  },
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
  const [pendingImageColumns, setPendingImageColumns] = useState(1);
  const bodyImageInputRef = useRef(null);
  const [sectionHeight, setSectionHeight] = useState("250");

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

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        linkOnPaste: true,
      }),
      TextColor,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TipTapImage.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            style: {
              default: null,
              parseHTML: (element) => element.getAttribute("style") || null,
              renderHTML: (attributes) =>
                attributes.style ? { style: attributes.style } : {},
            },
            draggable: {
              default: "true",
              parseHTML: (element) => element.getAttribute("draggable") || "true",
              renderHTML: (attributes) =>
                attributes.draggable ? { draggable: attributes.draggable } : {},
            },
          };
        },
      }).configure({
        inline: false,
        allowBase64: true,
      }),
      Columns,
    ],
    content: form.body,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setForm((prev) => ({ ...prev, body: editor.getHTML() }));
    },
    editorProps: {
      attributes: {
        class: "min-h-[160px] outline-none p-3 text-sm text-gray-700",
      },
    },
  });

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

        const compressed = canvas.toDataURL("image/jpeg", quality);
        resolve(compressed);
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
      const originalSrc = img.getAttribute("src");
      if (originalSrc && originalSrc.startsWith("data:image")) {
        try {
          const compressed = await compressBase64Image(originalSrc);
          img.setAttribute("src", compressed);
        } catch (e) {
          console.error("Failed to compress image:", e);
        }
      }
    }

    return doc.documentElement.outerHTML.replace(/^<html><body>|<\/body><\/html>$/g, "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let processedBody = form.body;
      if (form.body && form.body.includes("data:image")) {
        processedBody = await processBodyImages(form.body);
      }

      // Derive a short_description from the processed HTML (plain text, trimmed)
      const plainText = (processedBody || "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      const shortDescription = plainText.slice(0, 255);

      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("slug", form.slug);
      formData.append("content", processedBody);
      formData.append("short_description", shortDescription);
      formData.append("is_featured", form.is_featured ? "true" : "false");
      if (form.featured_image) {
        formData.append("featured_image", form.featured_image);
      }
      form.blog_types.forEach((typeId) => {
        formData.append("blog_type_ids[]", typeId);
      });
      await createBlog(formData, toast);
      router.push("/admin/blogs");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleBodyImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !editor) return;

    const cols = Math.min(Math.max(pendingImageColumns || 1, 1), 3);
    const limited = files.slice(0, cols);

    const readFileAsDataURL = (file) =>
      new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });

    Promise.all(limited.map((file) => readFileAsDataURL(file))).then((urls) => {
      if (!urls.length) return;

      if (cols === 1) {
        editor
          .chain()
          .focus()
          .setImage({
            src: urls[0],
            alt: "",
            style: "max-width:100%;height:auto;",
          })
          .run();
      } else {
        const content = urls.map((url) => ({
          type: "paragraph",
          content: [
            {
              type: "image",
              attrs: {
                src: url,
                alt: "",
                style: "width:100%;max-width:100%;border-radius:0.5rem;",
              },
            },
          ],
        }));

        editor
          .chain()
          .focus()
          .insertContent({
            type: "columns",
            attrs: { columns: cols },
            content,
          })
          .run();
      }
    });

    e.target.value = "";
    setPendingImageColumns(1);
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
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-1 px-2 py-1.5 border-b border-gray-200 bg-gray-50">
            {/* Basic styles */}
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleBold().run()}
              className={`px-1.5 py-1 rounded text-xs font-bold ${
                editor?.isActive("bold")
                  ? "bg-gray-200 text-gray-900"
                  : "bg-transparent text-gray-500 hover:bg-gray-100"
              }`}
            >
              B
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              className={`px-1.5 py-1 rounded text-xs italic ${
                editor?.isActive("italic")
                  ? "bg-gray-200 text-gray-900"
                  : "bg-transparent text-gray-500 hover:bg-gray-100"
              }`}
            >
              I
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleUnderline().run()}
              className={`px-1.5 py-1 rounded text-xs underline ${
                editor?.isActive("underline")
                  ? "bg-gray-200 text-gray-900"
                  : "bg-transparent text-gray-500 hover:bg-gray-100"
              }`}
            >
              U
            </button>

            {/* Headings (font size) */}
            <div className="h-5 w-px bg-gray-200 mx-1" />
            {[1, 2, 3].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() =>
                  editor?.chain().focus().toggleHeading({ level }).run()
                }
                className={`px-1.5 py-1 rounded text-xs ${
                  editor?.isActive("heading", { level })
                    ? "bg-gray-200 text-gray-900"
                    : "bg-transparent text-gray-500 hover:bg-gray-100"
                }`}
              >
                H{level}
              </button>
            ))}

            {/* Lists */}
            <div className="h-5 w-px bg-gray-200 mx-1" />
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              className={`p-1.5 rounded ${
                editor?.isActive("bulletList")
                  ? "bg-gray-200 text-gray-900"
                  : "bg-transparent text-gray-500 hover:bg-gray-100"
              }`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={() =>
                editor?.chain().focus().toggleOrderedList().run()
              }
              className={`p-1.5 rounded ${
                editor?.isActive("orderedList")
                  ? "bg-gray-200 text-gray-900"
                  : "bg-transparent text-gray-500 hover:bg-gray-100"
              }`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 6h13M7 12h13M7 18h13M3 6v.01M3 12v.01M3 18v.01"
                />
              </svg>
            </button>

            {/* Alignment */}
            <div className="h-5 w-px bg-gray-200 mx-1" />
            {[
              { value: "left", icon: "L" },
              { value: "center", icon: "C" },
              { value: "right", icon: "R" },
              { value: "justify", icon: "J" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() =>
                  editor
                    ?.chain()
                    .focus()
                    .setTextAlign(opt.value)
                    .run()
                }
                className={`px-1.5 py-1 rounded text-[10px] ${
                  editor?.isActive({ textAlign: opt.value })
                    ? "bg-gray-200 text-gray-900"
                    : "bg-transparent text-gray-500 hover:bg-gray-100"
                }`}
              >
                {opt.icon}
              </button>
            ))}

            {/* Colors */}
            <div className="h-5 w-px bg-gray-200 mx-1" />
            {[
              { color: "#111827", className: "bg-gray-900" },
              { color: "#ef4444", className: "bg-red-500" },
              { color: "#22c55e", className: "bg-emerald-500" },
              { color: "#3b82f6", className: "bg-blue-500" },
              { color: "#f97316", className: "bg-orange-500" },
            ].map((c) => (
              <button
                key={c.color}
                type="button"
                onClick={() =>
                  editor
                    ?.chain()
                    .focus()
                    .setMark("textColor", { color: c.color })
                    .run()
                }
                className={`w-5 h-5 rounded-full border border-gray-300 ${c.className}`}
              />
            ))}
            <button
              type="button"
              onClick={() =>
                editor?.chain().focus().unsetMark("textColor").run()
              }
              className="px-1.5 py-1 rounded text-[11px] text-gray-500 hover:bg-gray-100"
            >
              Clear color
            </button>

            {/* Columns layout block + height controls */}
            <div className="h-5 w-px bg-gray-200 mx-1" />
            <button
              type="button"
              onClick={() => {
                if (!editor) return;
                const input = window.prompt("How many desktop columns? (1-4, default 4)");
                if (input === null) return;
                const parsed = input === "" ? 4 : parseInt(input, 10);
                if (Number.isNaN(parsed)) return;
                const count = Math.min(Math.max(parsed, 1), 4);

                const content = Array.from({ length: count }).map((_, index) => ({
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: `Column ${index + 1}`,
                    },
                  ],
                }));

                editor
                  .chain()
                  .focus()
                  .insertContent({
                    type: "columns",
                    attrs: { columns: count, height: parseInt(sectionHeight || "250", 10) || 250 },
                    content,
                  })
                  .run();
              }}
              className="px-2 py-1 rounded text-xs text-gray-600 hover:bg-gray-100"
            >
              Columns layout
            </button>
            <div className="flex items-center gap-1 ml-1">
              <span className="text-[11px] text-gray-400">Section H(px):</span>
              <input
                type="number"
                min={100}
                max={1000}
                value={sectionHeight}
                onChange={(e) => {
                  const v = e.target.value;
                  setSectionHeight(v);
                  const num = parseInt(v, 10);
                  if (!editor || Number.isNaN(num)) return;
                  editor.commands.updateAttributes("columns", { height: num });
                }}
                className="w-16 px-1 py-0.5 border border-gray-200 rounded text-[11px] text-gray-600 bg-white"
              />
            </div>

            {/* Links */}
            <div className="h-5 w-px bg-gray-200 mx-1" />
            <button
              type="button"
              onClick={() => {
                const url = window.prompt("Link URL");
                if (!url) return;
                editor
                  ?.chain()
                  .focus()
                  .extendMarkRange("link")
                  .setLink({ href: url })
                  .run();
              }}
              className="px-2 py-1 rounded text-xs text-gray-600 hover:bg-gray-100"
            >
              Set Link
            </button>
            <button
              type="button"
              onClick={() =>
                editor
                  ?.chain()
                  .focus()
                  .unsetLink()
                  .run()
              }
              className="px-2 py-1 rounded text-xs text-gray-600 hover:bg-gray-100"
            >
              Remove Link
            </button>

            {/* Insert image(s) from upload */}
            <div className="h-5 w-px bg-gray-200 mx-1" />
            <button
              type="button"
              onClick={() => {
                setPendingImageColumns(1);
                bodyImageInputRef.current?.click();
              }}
              className="px-2 py-1 rounded text-xs text-gray-600 hover:bg-gray-100"
            >
              + Image
            </button>
            <button
              type="button"
              onClick={() => {
                setPendingImageColumns(2);
                bodyImageInputRef.current?.click();
              }}
              className="px-2 py-1 rounded text-xs text-gray-600 hover:bg-gray-100"
            >
              2 Images (columns)
            </button>
            <button
              type="button"
              onClick={() => {
                setPendingImageColumns(3);
                bodyImageInputRef.current?.click();
              }}
              className="px-2 py-1 rounded text-xs text-gray-600 hover:bg-gray-100"
            >
              3 Images (columns)
            </button>

            {/* Clear formatting */}
            <div className="h-5 w-px bg-gray-200 mx-1" />
            <button
              type="button"
              onClick={() =>
                editor
                  ?.chain()
                  .focus()
                  .unsetAllMarks()
                  .clearNodes()
                  .run()
              }
              className="px-2 py-1 rounded text-xs text-gray-600 hover:bg-gray-100"
            >
              Clear
            </button>
          </div>
          <EditorContent editor={editor} />
          <input
            ref={bodyImageInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleBodyImagesChange}
          />
        </div>
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

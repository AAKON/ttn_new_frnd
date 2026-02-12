"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { createBlog, getBlogTypes } from "@/services/admin";
import { useToast } from "@/hooks/use-toast";
import FormWrapper from "@/components/admin/form-wrapper";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import TipTapImage from "@tiptap/extension-image";
import { Node, Mark, Extension } from "@tiptap/core";
import { Plugin } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

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

const FontFamily = Mark.create({
  name: "fontFamily",
  inclusive: true,
  group: "inline",
  attrs: {
    fontFamily: {
      default: null,
    },
  },
  parseHTML() {
    return [
      {
        style: "font-family",
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return ["span", HTMLAttributes, 0];
  },
  addAttributes() {
    return {
      fontFamily: {
        default: null,
        parseHTML: (element) => element.style.fontFamily || null,
        renderHTML: (attrs) =>
          attrs.fontFamily ? { style: `font-family: ${attrs.fontFamily}` } : {},
      },
    };
  },
});

/** Normalize ratio string "1,2,1" to stored ratios "1,2,1". Returns null if invalid. */
function ratioToWidths(ratioStr, columnCount) {
  if (!ratioStr || typeof ratioStr !== "string") return null;
  const parts = ratioStr.split(/[\s,]+/).map((s) => parseFloat(s.trim()));
  if (parts.length !== columnCount || parts.some((n) => Number.isNaN(n) || n <= 0)) return null;
  return parts.join(",");
}

/** Build grid-template-columns from widths attribute (ratios or legacy %), or equal columns. */
function columnsGridStyle(widthsStr, cols) {
  if (widthsStr && typeof widthsStr === "string") {
    const parts = widthsStr.split(",").map((s) => parseFloat(s.trim()));
    if (parts.length === cols && parts.every((n) => !Number.isNaN(n) && n > 0)) {
      const sum = parts.reduce((a, b) => a + b, 0);
      // Legacy support: if it looks like percentages, convert to ratios.
      const ratios =
        sum > 95 && sum < 105
          ? parts.map((p) => Math.round((p / Math.min(...parts)) * 100) / 100)
          : parts;
      return ratios.map((r) => `${r}fr`).join(" ");
    }
  }
  return `repeat(${cols}, minmax(0, 1fr))`;
}

/** Get attrs of the columns node containing the current selection, or null. */
function getSelectedColumnsAttrs(editor) {
  if (!editor?.state?.selection?.$from) return null;
  const $from = editor.state.selection.$from;
  for (let d = $from.depth; d > 0; d--) {
    const node = $from.node(d);
    if (node.type.name === "columns") return { ...node.attrs };
  }
  return null;
}

/** Convert stored widths (ratios or legacy %) to ratio string "1,2,1" for display. */
function widthsToRatio(widthsStr) {
  if (!widthsStr || typeof widthsStr !== "string") return "";
  const parts = widthsStr.split(",").map((s) => parseFloat(s.trim()));
  if (parts.some((n) => Number.isNaN(n)) || parts.length === 0) return "";
  const sum = parts.reduce((a, b) => a + b, 0);
  const normalized = sum > 95 && sum < 105 ? parts.map((p) => p) : parts.map((p) => p);
  const min = Math.min(...normalized);
  if (min === 0) return widthsStr;
  const scale = normalized.map((p) => p / min);
  return scale.map((s) => Math.round(s * 100) / 100).join(",");
}

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
      widths: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-widths") || null,
        renderHTML: (attributes) =>
          attributes.widths ? { "data-widths": attributes.widths } : {},
      },
    };
  },
  parseHTML() {
    return [{ tag: "div[data-columns]" }];
  },
  addCommands() {
    const deleteColumnAt = (columnIndex, { state, dispatch }) => {
      const { $from } = state.selection;
      let columnsDepth = null;
      for (let d = $from.depth; d > 0; d--) {
        if ($from.node(d).type.name === "columns") {
          columnsDepth = d;
          break;
        }
      }
      if (columnsDepth == null || columnIndex < 0) return false;
      const columnsNode = $from.node(columnsDepth);
      if (columnIndex >= columnsNode.childCount) return false;
      const columnsPos = $from.before(columnsDepth);
      let startPos = columnsPos + 1;
      for (let i = 0; i < columnIndex; i++) {
        startPos += columnsNode.child(i).nodeSize;
      }
      const endPos = startPos + columnsNode.child(columnIndex).nodeSize;
      const tr = state.tr;
      if (columnsNode.childCount <= 1) {
        const child = columnsNode.child(0);
        tr.replaceWith(columnsPos, columnsPos + columnsNode.nodeSize, child.content);
      } else {
        tr.delete(startPos, endPos);
        const newCount = columnsNode.childCount - 1;
        const widths = (columnsNode.attrs.widths || "").split(",").map((s) => s.trim()).filter(Boolean);
        const newWidths =
          widths.length === columnsNode.childCount
            ? widths.filter((_, i) => i !== columnIndex).join(",")
            : null;
        tr.setNodeMarkup(columnsPos, null, {
          ...columnsNode.attrs,
          columns: newCount,
          ...(newWidths != null && { widths: newWidths }),
        });
      }
      if (dispatch) dispatch(tr);
      return true;
    };
    return {
      deleteCurrentColumn: () => (props) => {
        const { $from } = props.state.selection;
        let columnsDepth = null;
        for (let d = $from.depth; d > 0; d--) {
          if ($from.node(d).type.name === "columns") {
            columnsDepth = d;
            break;
          }
        }
        if (columnsDepth == null) return false;
        const columnIndex = $from.index(columnsDepth);
        return deleteColumnAt(columnIndex, props);
      },
      deleteColumnByIndex: (index) => (props) => deleteColumnAt(index, props),
      deleteSection:
        () =>
        ({ state, dispatch }) => {
          const { $from } = state.selection;
          let columnsDepth = null;
          for (let d = $from.depth; d > 0; d--) {
            if ($from.node(d).type.name === "columns") {
              columnsDepth = d;
              break;
            }
          }
          if (columnsDepth == null) return false;
          const columnsNode = $from.node(columnsDepth);
          const columnsPos = $from.before(columnsDepth);
          const tr = state.tr.delete(columnsPos, columnsPos + columnsNode.nodeSize);
          if (dispatch) dispatch(tr);
          return true;
        },
    };
  },
  renderHTML({ node }) {
    const cols = node.attrs.columns || 2;
    const height = node.attrs.height || 250;
    const gridCols = columnsGridStyle(node.attrs.widths, cols);
    const style = `margin:16px 0;gap:8px;align-items:stretch;height:${height}px;display:grid;grid-template-columns:${gridCols};`;
    const attrs = {
      "data-columns": String(cols),
      class: "ttn-columns",
      "data-height": String(height),
      style,
    };
    if (node.attrs.widths) attrs["data-widths"] = node.attrs.widths;
    return ["div", attrs, 0];
  },
});

/** When selection is inside a columns node, highlight the whole section. */
const ColumnsHighlight = Extension.create({
  name: "columnsHighlight",
  addProseMirrorPlugins() {
    return [
      new Plugin({
        state: {
          init() {
            return DecorationSet.empty;
          },
          apply(tr, value, oldState, newState) {
            if (!tr.selectionSet && !tr.docChanged) {
              return value.map(tr.mapping);
            }
            const { $from } = newState.selection;
            for (let d = $from.depth; d > 0; d--) {
              const node = $from.node(d);
              if (node.type.name === "columns") {
                const pos = $from.before(d);
                return DecorationSet.create(tr.doc, [
                  Decoration.node(pos, pos + node.nodeSize, {
                    class: "ttn-columns-selected",
                  }),
                ]);
              }
            }
            return DecorationSet.empty;
          },
        },
        props: {
          decorations(state) {
            return this.getState(state) ?? DecorationSet.empty;
          },
        },
      }),
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
  const [colorPresets, setColorPresets] = useState([
    "#1d4ed8",
    "#ef4444",
    "#a3e635",
  ]);
  const [colorSelectedIndex, setColorSelectedIndex] = useState(0);
  const [fontSelectedIndex, setFontSelectedIndex] = useState(0);
  const fontOptions = [
    { label: "Default", value: null, preview: "Aa" },
    {
      label: "Sans Serif",
      value:
        "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
      preview: "Aa",
    },
    {
      label: "Serif",
      value:
        "Georgia, 'Times New Roman', 'Palatino Linotype', 'EB Garamond', serif",
      preview: "Aa",
    },
    {
      label: "Monospace",
      value:
        "'SFMono-Regular', Menlo, Monaco, Consolas, 'Courier New', 'Comic Sans MS', monospace",
      preview: "Aa",
    },
    // Basic system fonts
    { label: "Arial", value: "Arial, 'Helvetica Neue', sans-serif", preview: "Aa" },
    { label: "Calibri", value: "Calibri, 'Segoe UI', sans-serif", preview: "Aa" },
    { label: "Comic Sans MS", value: "'Comic Sans MS', cursive, sans-serif", preview: "Aa" },
    { label: "Courier New", value: "'Courier New', monospace", preview: "Aa" },
    { label: "Verdana", value: "Verdana, Geneva, sans-serif", preview: "Aa" },
    // Display / Google-style fonts
    { label: "Amatic SC", value: "'Amatic SC', cursive", preview: "Aa" },
    { label: "Caveat", value: "'Caveat', cursive", preview: "Aa" },
    { label: "Comfortaa", value: "'Comfortaa', cursive", preview: "Aa" },
    { label: "EB Garamond", value: "'EB Garamond', 'Times New Roman', serif", preview: "Aa" },
    { label: "Georgia", value: "Georgia, 'Times New Roman', serif", preview: "Aa" },
    { label: "Impact", value: "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif", preview: "Aa" },
    { label: "Lexend", value: "'Lexend', system-ui, sans-serif", preview: "Aa" },
  ];
  const [columnDeleteRects, setColumnDeleteRects] = useState(null);
  const [measureTick, setMeasureTick] = useState(0);
  const editorWrapRef = useRef(null);

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

  const editorRef = useRef(null);

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
      FontFamily,
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
      ColumnsHighlight,
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

  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    const unsub = editor.on("selectionUpdate", () => setMeasureTick((t) => t + 1));
    return () => unsub?.destroy?.();
  }, [editor]);

  useEffect(() => {
    if (!editor || !editorWrapRef.current) {
      setColumnDeleteRects(null);
      return;
    }
    const inColumns = getSelectedColumnsAttrs(editor);
    if (!inColumns) {
      setColumnDeleteRects(null);
      return;
    }
    const measure = () => {
      const wrap = editorWrapRef.current;
      if (!wrap) return;
      const sel = wrap.querySelector(".ttn-columns-selected");
      if (!sel || !sel.children.length) {
        setColumnDeleteRects(null);
        return;
      }
      const rects = [];
      for (let i = 0; i < sel.children.length; i++) {
        const r = sel.children[i].getBoundingClientRect();
        rects.push({
          index: i,
          top: r.top + 4,
          left: r.right - 28,
        });
      }
      setColumnDeleteRects(rects);
    };
    const raf = requestAnimationFrame(measure);
    const onScrollOrResize = () => requestAnimationFrame(measure);
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [editor, measureTick]);

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
        <div ref={editorWrapRef} className="border border-gray-200 rounded-lg overflow-hidden relative">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-gray-200 bg-white">
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleBold().run()}
              className={`min-w-[28px] px-1.5 py-1.5 rounded-md text-xs font-bold ${
                editor?.isActive("bold")
                  ? "bg-gray-200 text-gray-900"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              B
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              className={`min-w-[28px] px-1.5 py-1.5 rounded-md text-xs italic ${
                editor?.isActive("italic")
                  ? "bg-gray-200 text-gray-900"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              I
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleUnderline().run()}
              className={`min-w-[28px] px-1.5 py-1.5 rounded-md text-xs underline ${
                editor?.isActive("underline")
                  ? "bg-gray-200 text-gray-900"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              U
            </button>

            <div className="h-4 w-px bg-gray-200 mx-1.5" />
            {[1, 2, 3].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() =>
                  editor?.chain().focus().toggleHeading({ level }).run()
                }
                className={`min-w-[28px] px-1.5 py-1.5 rounded-md text-xs ${
                  editor?.isActive("heading", { level })
                    ? "bg-gray-200 text-gray-900"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                H{level}
              </button>
            ))}

            <div className="h-4 w-px bg-gray-200 mx-1.5" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={`min-w-[28px] px-2 py-1.5 rounded-md text-xs font-medium flex items-center gap-1 ${
                    editor?.isActive("bulletList") || editor?.isActive("orderedList")
                      ? "bg-gray-200 text-gray-900"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
                  </svg>
                  <span>List</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-[160px]">
                <div className="p-1">
                  {/* Bullet List */}
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!editor) return;
                      if (editor.isActive("orderedList")) {
                        editor.chain().focus().toggleOrderedList().run();
                      }
                      if (!editor.isActive("bulletList")) {
                        editor.chain().focus().toggleBulletList().run();
                      }
                    }}
                    onSelect={(e) => e.preventDefault()}
                    className="flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                      <span>Bullet list</span>
                    </div>
                    {editor?.isActive("bulletList") && (
                      <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </DropdownMenuItem>

                  {/* Ordered List */}
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!editor) return;
                      if (editor.isActive("bulletList")) {
                        editor.chain().focus().toggleBulletList().run();
                      }
                      if (!editor.isActive("orderedList")) {
                        editor.chain().focus().toggleOrderedList().run();
                      }
                    }}
                    onSelect={(e) => e.preventDefault()}
                    className="flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-1.5 text-xs">
                      <span>1.</span>
                      <span>Numbered list</span>
                    </div>
                    {editor?.isActive("orderedList") && (
                      <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="h-4 w-px bg-gray-200 mx-1.5" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="px-2 py-1.5 rounded-md text-xs font-medium flex items-center gap-1 text-gray-700 hover:bg-gray-100"
                >
                  <span
                    className="text-xs"
                    style={{
                      fontFamily: fontOptions[fontSelectedIndex].value || "inherit",
                    }}
                  >
                    {fontOptions[fontSelectedIndex].preview}
                  </span>
                  <span>Font</span>
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-[190px]">
                <div className="flex flex-col gap-1 px-2 py-2">
                  {fontOptions.map((opt, index) => (
                    <DropdownMenuItem
                      key={opt.label}
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={() => {
                        setFontSelectedIndex(index);
                        const chain = editor?.chain().focus();
                        if (!chain) return;
                        if (opt.value) {
                          chain.setMark("fontFamily", { fontFamily: opt.value }).run();
                        } else {
                          chain.unsetMark("fontFamily").run();
                        }
                      }}
                    >
                      <input
                        type="radio"
                        name="font-family"
                        className="h-3 w-3 text-blue-600 border-gray-300"
                        checked={fontSelectedIndex === index}
                        readOnly
                      />
                      <span
                        className="text-xs"
                        style={{ fontFamily: opt.value || "inherit" }}
                      >
                        {opt.label}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="h-4 w-px bg-gray-200 mx-1.5" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={`min-w-[28px] px-2 py-1.5 rounded-md text-xs font-medium flex items-center gap-1 ${
                    editor?.isActive({ textAlign: "left" }) ||
                    editor?.isActive({ textAlign: "center" }) ||
                    editor?.isActive({ textAlign: "right" }) ||
                    editor?.isActive({ textAlign: "justify" })
                      ? "bg-gray-200 text-gray-900"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M3 12h12M3 18h18" />
                  </svg>
                  <span>Align</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-[140px]">
                <DropdownMenuItem
                  onClick={() => editor?.chain().focus().setTextAlign("left").run()}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M3 12h12M3 18h18" />
                  </svg>
                  <span>Left</span>
                  {editor?.isActive({ textAlign: "left" }) && (
                    <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => editor?.chain().focus().setTextAlign("center").run()}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M6 12h12M3 18h18" />
                  </svg>
                  <span>Center</span>
                  {editor?.isActive({ textAlign: "center" }) && (
                    <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => editor?.chain().focus().setTextAlign("right").run()}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M9 12h12M3 18h18" />
                  </svg>
                  <span>Right</span>
                  {editor?.isActive({ textAlign: "right" }) && (
                    <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => editor?.chain().focus().setTextAlign("justify").run()}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M3 12h18M3 18h18" />
                  </svg>
                  <span>Justify</span>
                  {editor?.isActive({ textAlign: "justify" }) && (
                    <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="h-4 w-px bg-gray-200 mx-1.5" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="px-2 py-1.5 rounded-md text-xs font-medium flex items-center gap-1 text-gray-700 hover:bg-gray-100"
                >
                  <span
                    className="inline-block w-3 h-3 rounded-full border border-gray-300"
                    style={{ backgroundColor: colorPresets[colorSelectedIndex] }}
                  />
                  <span>Color</span>
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-[190px]">
                <div className="flex flex-col gap-2 px-2 py-2">
                  {colorPresets.map((color, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="text-color-preset"
                        className="h-3 w-3 text-blue-600 border-gray-300"
                        checked={colorSelectedIndex === index}
                        onChange={() => {
                          setColorSelectedIndex(index);
                          const color = colorPresets[index];
                          editor
                            ?.chain()
                            .focus()
                            .setMark("textColor", { color })
                            .run();
                        }}
                      />
                      <div className="relative w-6 h-6">
                        <button
                          type="button"
                          className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center hover:ring-1 hover:ring-gray-400 transition-shadow"
                          style={{ backgroundColor: color }}
                          title="Set text color"
                          onClick={() =>
                            editor
                              ?.chain()
                              .focus()
                              .setMark("textColor", { color })
                              .run()
                          }
                        />
                        <input
                          type="color"
                          value={color}
                          aria-label={`Preset color ${index + 1}`}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={(e) => {
                            const next = [...colorPresets];
                            next[index] = e.target.value;
                            setColorPresets(next);
                            const picked = next[index];
                            editor
                              ?.chain()
                              .focus()
                              .setMark("textColor", { color: picked })
                              .run();
                          }}
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      editor?.chain().focus().unsetMark("textColor").run();
                    }}
                    className="mt-1 px-2 py-1.5 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-100 self-start"
                  >
                    Clear color
                  </button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="h-4 w-px bg-gray-200 mx-1.5" />
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

                const height = parseInt(sectionHeight || "250", 10) || 250;
                const equalWidths = Array.from({ length: count }, () => "1").join(",");
                editor
                  .chain()
                  .focus()
                  .insertContent({
                    type: "columns",
                    attrs: { columns: count, height, widths: equalWidths },
                    content,
                  })
                  .run();
              }}
              className="px-2.5 py-1.5 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-100 border border-transparent hover:border-gray-200"
            >
              Columns
            </button>
            {editor && (() => {
              const sel = getSelectedColumnsAttrs(editor);
              const cols = sel?.columns ?? 2;
              const h = sel?.height ?? 250;
              const ratioDisplay = sel?.widths ? widthsToRatio(sel.widths) : "";
              const ratioPresets =
                cols === 2
                  ? [
                      { label: "1:1", ratio: "1,1" },
                      { label: "1:2", ratio: "1,2" },
                      { label: "2:1", ratio: "2,1" },
                    ]
                  : cols === 3
                  ? [
                      { label: "1:1:1", ratio: "1,1,1" },
                      { label: "1:2:1", ratio: "1,2,1" },
                      { label: "1:1:2", ratio: "1,1,2" },
                      { label: "2:1:1", ratio: "2,1,1" },
                    ]
                  : cols === 4
                  ? [
                      { label: "1:1:1:1", ratio: "1,1,1,1" },
                      { label: "1:2:2:1", ratio: "1,2,2,1" },
                      { label: "2:1:1:2", ratio: "2,1,1,2" },
                    ]
                  : [];
              return sel ? (
                <div className="flex flex-wrap items-center gap-2 ml-1.5 pl-1.5 border-l border-gray-200">
                  <span className="text-[11px] text-gray-500 font-medium">Section</span>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().deleteSection().run()}
                    className="px-2.5 py-1.5 rounded-md text-xs font-medium text-red-600 hover:bg-red-50"
                    title="Delete entire section"
                  >
                    Delete section
                  </button>
                  <label className="flex items-center gap-1 text-[11px] text-gray-500">
                    H(px):
                    <input
                      type="number"
                      min={100}
                      max={1000}
                      value={h}
                      onChange={(e) => {
                        const num = parseInt(e.target.value, 10);
                        if (!Number.isNaN(num))
                          editor.commands.updateAttributes("columns", { height: num });
                      }}
                      className="w-14 px-1 py-0.5 border border-gray-200 rounded text-[11px]"
                    />
                  </label>
                  <label className="flex items-center gap-1 text-[11px] text-gray-500">
                    Ratio:
                    <input
                      key={`ratio-${cols}-${ratioDisplay}`}
                      type="text"
                      placeholder="e.g. 1,2,1"
                      defaultValue={ratioDisplay}
                      onBlur={(e) => {
                        const widths = ratioToWidths(e.target.value.trim(), cols);
                        if (widths)
                          editor.commands.updateAttributes("columns", { widths });
                      }}
                      className="w-20 px-1 py-0.5 border border-gray-200 rounded text-[11px] font-mono"
                    />
                  </label>
                  {ratioPresets.map((preset) => {
                    const widths = ratioToWidths(preset.ratio, cols);
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() =>
                          widths &&
                          editor.commands.updateAttributes("columns", { widths })
                        }
                        className="px-2 py-1 rounded-md text-[10px] border border-gray-200 hover:bg-gray-100 text-gray-700"
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              ) : null;
            })()}

            <div className="h-4 w-px bg-gray-200 mx-1.5" />
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
              className="px-2.5 py-1.5 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-100"
            >
              Link
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
              className="px-2.5 py-1.5 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-100"
            >
              Unlink
            </button>

            {/* Insert image(s) from upload */}
            <div className="h-5 w-px bg-gray-200 mx-1" />
            <button
              type="button"
              onClick={() => {
                setPendingImageColumns(1);
                bodyImageInputRef.current?.click();
              }}
              className="px-2.5 py-1.5 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-100 border border-transparent hover:border-gray-200"
            >
              Insert image
            </button>

            <div className="h-4 w-px bg-gray-200 mx-1.5" />
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
              className="px-2.5 py-1.5 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-100"
            >
              Clear format
            </button>
          </div>
          <div className="tiptap-content">
            <EditorContent editor={editor} />
          </div>
          {columnDeleteRects &&
            columnDeleteRects.length > 0 &&
            createPortal(
              <div className="pointer-events-none fixed inset-0 z-10" aria-hidden>
                {columnDeleteRects.map(({ index, top, left }) => (
                  <button
                    key={index}
                    type="button"
                    className="ttn-column-delete-btn pointer-events-auto absolute z-10"
                    style={{ position: "fixed", top: `${top}px`, left: `${left}px` }}
                    aria-label="Remove column"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      editorRef.current?.commands?.deleteColumnByIndex?.(index);
                    }}
                  >
                    ×
                  </button>
                ))}
              </div>,
              document.body
            )}
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

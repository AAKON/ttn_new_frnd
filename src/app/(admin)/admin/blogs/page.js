"use client";
import { useEffect, useState, useCallback } from "react";
import { getAdminBlogs, deleteBlog, toggleBlogStatus } from "@/services/admin";
import { useToast } from "@/hooks/use-toast";
import DataTable from "@/components/admin/data-table";
import DeleteDialog from "@/components/admin/delete-dialog";
import StatusBadge from "@/components/admin/status-badge";
import Link from "next/link";
import { Pencil, Plus, ToggleLeft, ToggleRight } from "lucide-react";

export default function BlogsPage() {
  const { toast } = useToast();
  const [blogs, setBlogs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminBlogs(page);
      setBlogs(data?.data || data || []);
      if (data?.current_page) {
        setPagination({
          current_page: data.current_page,
          last_page: data.last_page,
          total: data.total,
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const handleToggleStatus = async (id) => {
    await toggleBlogStatus(id, toast);
    fetchBlogs();
  };

  const handleDelete = async (id) => {
    await deleteBlog(id, toast);
    fetchBlogs();
  };

  const columns = [
    { key: "title", label: "Title" },
    { key: "slug", label: "Slug" },
    {
      key: "is_featured",
      label: "Featured",
      render: (row) => (
        <span className={`text-xs font-medium ${row.is_featured ? "text-brand-600" : "text-gray-400"}`}>
          {row.is_featured ? "Yes" : "No"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusBadge status={row.status || (row.is_published ? "published" : "draft")} />,
    },
    {
      key: "created_at",
      label: "Created",
      render: (row) => (
        <span className="text-sm text-gray-500">
          {row.created_at ? new Date(row.created_at).toLocaleDateString() : "-"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleToggleStatus(row.id)}
            className="p-1.5 rounded bg-transparent text-yellow-600 hover:bg-yellow-50"
            title="Toggle Status"
          >
            {row.status === "published" || row.is_published ? (
              <ToggleRight size={16} />
            ) : (
              <ToggleLeft size={16} />
            )}
          </button>
          <Link
            href={`/admin/blogs/${row.id}/edit`}
            className="p-1.5 rounded bg-transparent text-brand-600 hover:bg-brand-50"
            title="Edit"
          >
            <Pencil size={16} />
          </Link>
          <DeleteDialog onConfirm={() => handleDelete(row.id)} />
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Blogs</h1>
        <Link
          href="/admin/blogs/create"
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-semibold hover:bg-brand-700"
        >
          <Plus size={16} /> Create Blog
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={blogs}
        loading={loading}
        pagination={pagination}
        onPageChange={setPage}
      />
    </div>
  );
}

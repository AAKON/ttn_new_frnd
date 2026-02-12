"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ToggleLeft, ToggleRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  getAdminCompanies,
  deleteAdminCompany,
  toggleCompanyActive,
} from "@/services/admin";
import DataTable from "@/components/admin/data-table";
import DeleteDialog from "@/components/admin/delete-dialog";
import StatusBadge from "@/components/admin/status-badge";

export default function AdminCompaniesPage() {
  const { toast } = useToast();
  const [companies, setCompanies] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminCompanies(page, 10, search);
      setCompanies(data?.data || data || []);
      if (data?.pagination) {
        setPagination(data.pagination);
      } else if (data?.current_page) {
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
  }, [page, search]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleToggleActive = async (id) => {
    await toggleCompanyActive(id, toast);
    fetchCompanies();
  };

  const handleDelete = async (id) => {
    await deleteAdminCompany(id, toast);
    fetchCompanies();
  };

  const columns = [
    {
      key: "name",
      label: "Company",
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.profile_pic_url && (
            <img
              src={row.profile_pic_url}
              alt={row.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          )}
          <div>
            <div className="text-sm font-medium text-gray-900">
              {row.name}
            </div>
            {row.slug && (
              <div className="text-xs text-gray-400">/{row.slug}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "location",
      label: "Location",
      render: (row) =>
        row.location ? (
          <span className="text-sm text-gray-700">{row.location.name}</span>
        ) : (
          <span className="text-xs text-gray-400">-</span>
        ),
    },
    {
      key: "business_category",
      label: "Category",
      render: (row) =>
        row.business_category ? (
          <span className="inline-flex px-2 py-0.5 rounded-full text-xs bg-gray-50 text-gray-700 border border-gray-200">
            {row.business_category.name}
          </span>
        ) : (
          <span className="text-xs text-gray-400">-</span>
        ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusBadge status={row.status || "active"} />,
    },
    {
      key: "is_active",
      label: "Active",
      render: (row) =>
        row.is_active ? (
          <span className="text-xs text-green-600 font-medium">Active</span>
        ) : (
          <span className="text-xs text-gray-400">Inactive</span>
        ),
    },
    {
      key: "created_at",
      label: "Created",
      render: (row) => (
        <span className="text-xs text-gray-500">
          {row.created_at
            ? new Date(row.created_at).toLocaleDateString()
            : "-"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleToggleActive(row.id)}
            className="p-1.5 rounded bg-transparent text-yellow-600 hover:bg-yellow-50"
            title={row.is_active ? "Deactivate company" : "Activate company"}
          >
            {row.is_active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
          </button>
          <Link
            href={`/company/${row.slug}/edit`}
            className="px-2 py-1 text-xs text-brand-600 hover:text-brand-700"
          >
            Edit
          </Link>
          <DeleteDialog onConfirm={() => handleDelete(row.id)} />
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Companies</h1>
        <Link
          href="/company/create"
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-semibold hover:bg-brand-700"
        >
          + Add Company
        </Link>
      </div>

      <form onSubmit={handleSearch} className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Search companies..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-semibold hover:bg-brand-700"
        >
          Search
        </button>
      </form>

      <DataTable
        columns={columns}
        data={companies}
        loading={loading}
        pagination={pagination}
        onPageChange={setPage}
      />
    </div>
  );
}


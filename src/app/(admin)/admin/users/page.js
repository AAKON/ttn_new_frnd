"use client";
import { useEffect, useState, useCallback } from "react";
import { getUsers, deleteUser, toggleBan } from "@/services/admin";
import { useToast } from "@/hooks/use-toast";
import DataTable from "@/components/admin/data-table";
import DeleteDialog from "@/components/admin/delete-dialog";
import StatusBadge from "@/components/admin/status-badge";
import { Ban, ShieldCheck, Search } from "lucide-react";

export default function UsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUsers(page, 10, search);
      setUsers(data?.data || data || []);
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
  }, [page, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleToggleBan = async (id) => {
    await toggleBan(id, toast);
    fetchUsers();
  };

  const handleDelete = async (id) => {
    await deleteUser(id, toast);
    fetchUsers();
  };

  const columns = [
    {
      key: "name",
      label: "Name",
      render: (row) => (
        <span className="text-sm font-medium text-gray-900">
          {row.first_name} {row.last_name}
        </span>
      ),
    },
    { key: "email", label: "Email" },
    {
      key: "roles",
      label: "Roles",
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {(row.roles || []).map((role) => (
            <span
              key={typeof role === "object" ? role.name : role}
              className="px-2 py-0.5 text-xs bg-brand-50 text-brand-700 rounded-full"
            >
              {typeof role === "object" ? role.name : role}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusBadge status={row.status || "active"} />,
    },
    {
      key: "is_banned",
      label: "Banned",
      render: (row) =>
        row.is_banned ? (
          <StatusBadge status="banned" />
        ) : (
          <span className="text-xs text-gray-400">No</span>
        ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleToggleBan(row.id)}
            className={`p-1.5 rounded bg-transparent ${
              row.is_banned
                ? "text-green-600 hover:bg-green-50"
                : "text-yellow-600 hover:bg-yellow-50"
            }`}
            title={row.is_banned ? "Unban User" : "Ban User"}
          >
            {row.is_banned ? <ShieldCheck size={16} /> : <Ban size={16} />}
          </button>
          <DeleteDialog onConfirm={() => handleDelete(row.id)} />
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
      </div>

      <form onSubmit={handleSearch} className="mb-4 flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-semibold hover:bg-brand-700"
        >
          Search
        </button>
      </form>

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        pagination={pagination}
        onPageChange={setPage}
      />
    </div>
  );
}

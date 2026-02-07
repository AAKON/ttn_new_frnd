"use client";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { getCompanyClaims, updateClaimStatus } from "@/services/admin";
import DataTable from "@/components/admin/data-table";
import StatusBadge from "@/components/admin/status-badge";

export default function CompanyClaimsPage() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const load = (p = page) => {
    setLoading(true);
    getCompanyClaims(p, 10).then((d) => {
      setItems(d?.data || d || []);
      if (d?.current_page) setPagination({ current_page: d.current_page, last_page: d.last_page, total: d.total });
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page]);

  const handleAction = async (id, status) => {
    const result = await updateClaimStatus(id, { status }, toast);
    if (result?.status) load();
  };

  const columns = [
    { key: "id", label: "ID", width: "60px" },
    { key: "user", label: "Claimant", render: (row) => row.user?.name || row.name || "-" },
    { key: "email", label: "Email", render: (row) => row.user?.email || row.email || "-" },
    { key: "company", label: "Company", render: (row) => row.company?.name || row.company_name || "-" },
    { key: "message", label: "Message", render: (row) => <span className="line-clamp-2 text-xs">{row.message}</span> },
    { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status || "pending"} /> },
    { key: "created_at", label: "Date", render: (row) => row.created_at ? new Date(row.created_at).toLocaleDateString() : "-" },
    { key: "actions", label: "Actions", width: "150px", render: (row) => (
      row.status === "pending" ? (
        <div className="flex gap-2">
          <button onClick={() => handleAction(row.id, "approved")} className="text-xs text-green-600 bg-transparent font-medium">Approve</button>
          <button onClick={() => handleAction(row.id, "rejected")} className="text-xs text-red-600 bg-transparent font-medium">Reject</button>
        </div>
      ) : <span className="text-xs text-gray-400">-</span>
    )},
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Company Claims</h1>
      <DataTable columns={columns} data={items} loading={loading} pagination={pagination} onPageChange={setPage} />
    </div>
  );
}

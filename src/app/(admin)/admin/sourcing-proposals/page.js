"use client";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { getAdminProposals, approveProposal, rejectProposal, deleteAdminProposal } from "@/services/admin";
import DataTable from "@/components/admin/data-table";
import DeleteDialog from "@/components/admin/delete-dialog";
import StatusBadge from "@/components/admin/status-badge";

export default function AdminSourcingProposalsPage() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const load = (p = page) => {
    setLoading(true);
    getAdminProposals(p, 10).then((d) => {
      setItems(d?.data || d || []);
      if (d?.current_page) setPagination({ current_page: d.current_page, last_page: d.last_page, total: d.total });
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page]);

  const handleApprove = async (id) => {
    const result = await approveProposal(id, toast);
    if (result?.status) load();
  };

  const handleReject = async (id) => {
    const result = await rejectProposal(id, toast);
    if (result?.status) load();
  };

  const columns = [
    { key: "id", label: "ID", width: "60px" },
    { key: "title", label: "Title" },
    { key: "company_name", label: "Company" },
    { key: "user", label: "User", render: (row) => row.user?.name || "-" },
    { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status || "pending"} /> },
    { key: "view_count", label: "Views", width: "70px" },
    { key: "created_at", label: "Date", render: (row) => row.created_at ? new Date(row.created_at).toLocaleDateString() : "-" },
    { key: "actions", label: "Actions", width: "200px", render: (row) => (
      <div className="flex gap-2">
        {row.status === "pending" && (
          <>
            <button onClick={() => handleApprove(row.id)} className="text-xs text-green-600 bg-transparent font-medium">Approve</button>
            <button onClick={() => handleReject(row.id)} className="text-xs text-red-600 bg-transparent font-medium">Reject</button>
          </>
        )}
        {row.status === "approved" && (
          <button onClick={() => handleReject(row.id)} className="text-xs text-red-600 bg-transparent font-medium">Reject</button>
        )}
        {row.status === "rejected" && (
          <button onClick={() => handleApprove(row.id)} className="text-xs text-green-600 bg-transparent font-medium">Approve</button>
        )}
        <DeleteDialog onConfirm={() => { deleteAdminProposal(row.id, toast).then(() => load()); }} />
      </div>
    )},
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Sourcing Proposals</h1>
      <DataTable columns={columns} data={items} loading={loading} pagination={pagination} onPageChange={setPage} />
    </div>
  );
}

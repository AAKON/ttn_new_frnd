"use client";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { getContactMessages, updateContactMessage, deleteContactMessage } from "@/services/admin";
import DataTable from "@/components/admin/data-table";
import DeleteDialog from "@/components/admin/delete-dialog";
import StatusBadge from "@/components/admin/status-badge";

export default function ContactMessagesPage() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const load = (p = page) => {
    setLoading(true);
    getContactMessages(p, 10).then((d) => {
      setItems(d?.data || d || []);
      if (d?.current_page) setPagination({ current_page: d.current_page, last_page: d.last_page, total: d.total });
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page]);

  const handleStatusChange = async (id, lead_status) => {
    const result = await updateContactMessage(id, { lead_status }, toast);
    if (result?.status) load();
  };

  const columns = [
    { key: "id", label: "ID", width: "60px" },
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "message", label: "Message", render: (row) => <span className="line-clamp-2 text-xs">{row.message}</span> },
    { key: "lead_status", label: "Status", render: (row) => (
      <select value={row.lead_status || "new"} onChange={(e) => handleStatusChange(row.id, e.target.value)} className="text-xs border rounded px-2 py-1">
        <option value="new">New</option>
        <option value="contacted">Contacted</option>
        <option value="closed">Closed</option>
      </select>
    )},
    { key: "created_at", label: "Date", render: (row) => row.created_at ? new Date(row.created_at).toLocaleDateString() : "-" },
    { key: "actions", label: "", width: "60px", render: (row) => (
      <DeleteDialog onConfirm={() => { deleteContactMessage(row.id, toast).then(() => load()); }} />
    )},
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Contact Messages</h1>
      <DataTable columns={columns} data={items} loading={loading} pagination={pagination} onPageChange={setPage} />
    </div>
  );
}

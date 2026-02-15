"use client";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { getCompanyEmails, updateCompanyEmail, deleteCompanyEmail } from "@/services/admin";
import DataTable from "@/components/admin/data-table";
import DeleteDialog from "@/components/admin/delete-dialog";

export default function CompanyEmailsPage() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const load = (p = page) => {
    setLoading(true);
    getCompanyEmails(p, 10)
      .then((res) => {
        // API returns { data: array, pagination } or sometimes the array at top level
        const raw = res?.data ?? res;
        const list = Array.isArray(raw) ? raw : (raw?.data ?? []);
        setItems(Array.isArray(list) ? list : []);
        const pag = res?.pagination ?? raw?.pagination ?? (res?.current_page != null ? { current_page: res.current_page, last_page: res.last_page, total: res.total, per_page: res.per_page } : null);
        setPagination(pag);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page]);

  const columns = [
    { key: "id", label: "ID", width: "60px" },
    { key: "email", label: "Email" },
    { key: "subject", label: "Subject", render: (row) => <span className="line-clamp-1 text-xs">{row.subject || "-"}</span> },
    { key: "company", label: "Company", render: (row) => row.company?.name || "-" },
    { key: "message", label: "Message", render: (row) => <span className="line-clamp-2 text-xs">{row.message || "-"}</span> },
    { key: "created_at", label: "Date", render: (row) => row.created_at ? new Date(row.created_at).toLocaleDateString() : "-" },
    { key: "actions", label: "", width: "60px", render: (row) => (
      <DeleteDialog onConfirm={() => { deleteCompanyEmail(row.id, toast).then(() => load()); }} />
    )},
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Company Emails</h1>
      <DataTable columns={columns} data={items} loading={loading} pagination={pagination} onPageChange={setPage} />
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { getCompanyReports, deleteCompanyReport } from "@/services/admin";
import DataTable from "@/components/admin/data-table";
import DeleteDialog from "@/components/admin/delete-dialog";

export default function CompanyReportsPage() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const load = (p = page) => {
    setLoading(true);
    getCompanyReports(p, 10).then((d) => {
      setItems(d?.data || d || []);
      if (d?.pagination) {
        setPagination(d.pagination);
      } else if (d?.current_page) {
        setPagination({ current_page: d.current_page, last_page: d.last_page, total: d.total });
      }
    }).catch((err) => {
      console.error("Error loading company reports:", err);
      setItems([]);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page]);

  const columns = [
    { key: "id", label: "ID", width: "60px" },
    { key: "name", label: "Reporter" },
    { key: "email", label: "Email" },
    { key: "company", label: "Company", render: (row) => row.company?.name || row.company_name || "-" },
    { key: "reason", label: "Reason", render: (row) => <span className="line-clamp-2 text-xs">{row.reason || row.message}</span> },
    { key: "created_at", label: "Date", render: (row) => row.created_at ? new Date(row.created_at).toLocaleDateString() : "-" },
    { key: "actions", label: "", width: "60px", render: (row) => (
      <DeleteDialog onConfirm={() => { deleteCompanyReport(row.id, toast).then(() => load()); }} />
    )},
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Company Reports</h1>
      <DataTable columns={columns} data={items} loading={loading} pagination={pagination} onPageChange={setPage} />
    </div>
  );
}

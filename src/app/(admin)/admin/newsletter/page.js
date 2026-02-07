"use client";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { getNewsletters, deleteNewsletter } from "@/services/admin";
import DataTable from "@/components/admin/data-table";
import DeleteDialog from "@/components/admin/delete-dialog";

export default function NewsletterPage() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const load = (p = page) => {
    setLoading(true);
    getNewsletters(p, 10).then((d) => {
      setItems(d?.data || d || []);
      if (d?.current_page) setPagination({ current_page: d.current_page, last_page: d.last_page, total: d.total });
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page]);

  const columns = [
    { key: "id", label: "ID", width: "60px" },
    { key: "email", label: "Email" },
    { key: "created_at", label: "Subscribed", render: (row) => row.created_at ? new Date(row.created_at).toLocaleDateString() : "-" },
    { key: "actions", label: "", width: "60px", render: (row) => (
      <DeleteDialog onConfirm={() => { deleteNewsletter(row.id, toast).then(() => load()); }} />
    )},
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Newsletter Subscribers</h1>
      <DataTable columns={columns} data={items} loading={loading} pagination={pagination} onPageChange={setPage} />
    </div>
  );
}

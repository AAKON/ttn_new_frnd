"use client";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { getContactMessages, updateContactMessage, deleteContactMessage } from "@/services/admin";
import DataTable from "@/components/admin/data-table";
import DeleteDialog from "@/components/admin/delete-dialog";
import { X, MessageSquare } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "New", label: "New" },
  { value: "MQL", label: "MQL" },
  { value: "SQL", label: "SQL" },
  { value: "Conversion", label: "New Conversion" },
  { value: "Not_Qualified", label: "Not Qualified" },
];

export default function ContactMessagesPage() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusModal, setStatusModal] = useState(null); // { id, currentStatus, comment }
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const load = (p = page) => {
    setLoading(true);
    getContactMessages(p, 10).then((d) => {
      setItems(d?.data || d || []);
      if (d?.current_page) setPagination({ current_page: d.current_page, last_page: d.last_page, total: d.total });
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page]);

  const openStatusModal = (row) => {
    setStatusModal({ id: row.id, currentStatus: row.lead_status || "New", comment: row.comment || "" });
    setComment(row.comment || "");
  };

  const closeStatusModal = () => {
    setStatusModal(null);
    setComment("");
  };

  const handleStatusSave = async () => {
    if (!statusModal) return;
    setSaving(true);
    try {
      const result = await updateContactMessage(statusModal.id, {
        lead_status: statusModal.currentStatus,
        comment: comment.trim() || null,
      }, toast);
      if (result?.status) {
        closeStatusModal();
        load();
      }
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: "id", label: "ID", width: "60px" },
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    {
      key: "message",
      label: "Message",
      render: (row) => <span className="line-clamp-2 text-xs">{row.message}</span>,
    },
    {
      key: "lead_status",
      label: "Status",
      render: (row) => {
        const currentStatus = STATUS_OPTIONS.find((s) => s.value === row.lead_status) || STATUS_OPTIONS[0];
        return (
          <div className="flex items-center gap-2">
            <select
              value={row.lead_status || "New"}
              onChange={(e) => {
                setStatusModal({ id: row.id, currentStatus: e.target.value, comment: row.comment || "" });
                setComment(row.comment || "");
              }}
              className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => openStatusModal(row)}
              className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
                row.comment
                  ? "bg-[rgb(247,147,30)] hover:bg-[rgb(230,130,20)]"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
              title={row.comment ? "View/Edit Comment" : "Add Comment"}
            >
              <MessageSquare
                size={18}
                strokeWidth={2.5}
                className={`flex-shrink-0 ${
                  row.comment ? "text-white" : "text-gray-500"
                }`}
              />
            </button>
          </div>
        );
      },
    },
    {
      key: "comment",
      label: "Comment",
      render: (row) =>
        row.comment ? (
          <span className="text-xs text-gray-600 line-clamp-1 max-w-[200px]" title={row.comment}>
            {row.comment}
          </span>
        ) : (
          <span className="text-xs text-gray-400">-</span>
        ),
    },
    {
      key: "created_at",
      label: "Date",
      render: (row) => (row.created_at ? new Date(row.created_at).toLocaleDateString() : "-"),
    },
    {
      key: "actions",
      label: "",
      width: "60px",
      render: (row) => (
        <DeleteDialog onConfirm={() => { deleteContactMessage(row.id, toast).then(() => load()); }} />
      ),
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Contact Messages</h1>
      <DataTable columns={columns} data={items} loading={loading} pagination={pagination} onPageChange={setPage} />

      {/* Status Update Modal */}
      {statusModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={closeStatusModal}>
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Update Status</h3>
              <button
                onClick={closeStatusModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={statusModal.currentStatus}
                  onChange={(e) =>
                    setStatusModal({ ...statusModal, currentStatus: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment about this status change..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none resize-y"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200">
              <button
                type="button"
                onClick={closeStatusModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStatusSave}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

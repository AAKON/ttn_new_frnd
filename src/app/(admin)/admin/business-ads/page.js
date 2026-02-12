"use client";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { getBusinessAds, createBusinessAd, updateBusinessAd, deleteBusinessAd } from "@/services/admin";
import DataTable from "@/components/admin/data-table";
import DeleteDialog from "@/components/admin/delete-dialog";

export default function BusinessAdsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({ link: "" });
  const [image, setImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const load = () => { setLoading(true); getBusinessAds().then((d) => setItems(d || [])).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("link", formData.link || "");
      if (image) fd.append("image", image);
      const result = editItem
        ? await updateBusinessAd(editItem.id, fd, toast)
        : await createBusinessAd(fd, toast);
      if (result?.status) {
        setShowForm(false);
        setEditItem(null);
        setImage(null);
        setFormData({ link: "" });
        load();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setFormData({ link: item.link || "" });
    setImage(null);
    setShowForm(true);
  };

  const columns = [
    { key: "id", label: "ID", width: "60px" },
    { key: "link", label: "URL" },
    {
      key: "image",
      label: "Image",
      render: (row) =>
        row.image ? (
          <img src={row.image} alt="" className="h-8 w-auto rounded" />
        ) : (
          "-"
        ),
    },
    {
      key: "actions",
      label: "Actions",
      width: "120px",
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="text-sm text-brand-600 bg-transparent font-medium"
          >
            Edit
          </button>
          <DeleteDialog
            onConfirm={() => {
              deleteBusinessAd(row.id, toast).then(load);
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Business Ads</h1>
        <button onClick={() => { setShowForm(true); setEditItem(null); setFormData({ title: "", url: "", is_active: true }); setImage(null); }} className="bg-brand-600 text-white px-4 py-2 rounded-lg font-semibold text-sm">Add Ad</button>
      </div>
      {showForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="formLabelClasses block mb-1">URL</label>
              <input
                type="text"
                value={formData.link ?? ""}
                onChange={(e) =>
                  setFormData({ ...formData, link: e.target.value })
                }
                className="input_style"
                required
              />
            </div>
            <div>
              <label className="formLabelClasses block mb-1">Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
                className="text-sm"
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="bg-brand-600 text-white px-4 py-2.5 rounded-lg font-semibold text-sm disabled:opacity-50">{saving ? "Saving..." : editItem ? "Update" : "Create"}</button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-white text-gray-600 border border-gray-200 px-4 py-2.5 rounded-lg text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}
      <DataTable columns={columns} data={items} loading={loading} />
    </div>
  );
}

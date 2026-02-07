"use client";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { getBlogTypes, createBlogType, updateBlogType, deleteBlogType } from "@/services/admin";
import DataTable from "@/components/admin/data-table";
import DeleteDialog from "@/components/admin/delete-dialog";

export default function BlogTypesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const load = () => { setLoading(true); getBlogTypes().then((d) => setItems(d || [])).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const result = editItem ? await updateBlogType(editItem.id, { name }, toast) : await createBlogType({ name }, toast);
      if (result?.status) { setShowForm(false); setEditItem(null); setName(""); load(); }
    } finally { setSaving(false); }
  };

  const handleEdit = (item) => { setEditItem(item); setName(item.name); setShowForm(true); };
  const handleDelete = async (id) => { await deleteBlogType(id, toast); load(); };

  const columns = [
    { key: "id", label: "ID", width: "80px" },
    { key: "name", label: "Name" },
    { key: "actions", label: "Actions", width: "120px", render: (row) => (
      <div className="flex gap-2">
        <button onClick={() => handleEdit(row)} className="text-sm text-brand-600 bg-transparent font-medium">Edit</button>
        <DeleteDialog onConfirm={() => handleDelete(row.id)} />
      </div>
    )},
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Blog Types</h1>
        <button onClick={() => { setShowForm(true); setEditItem(null); setName(""); }} className="bg-brand-600 text-white px-4 py-2 rounded-lg font-semibold text-sm">Add Blog Type</button>
      </div>
      {showForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <form onSubmit={handleSubmit} className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="formLabelClasses block mb-1">Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input_style" required />
            </div>
            <button type="submit" disabled={saving} className="bg-brand-600 text-white px-4 py-2.5 rounded-lg font-semibold text-sm disabled:opacity-50">{saving ? "Saving..." : editItem ? "Update" : "Create"}</button>
            <button type="button" onClick={() => { setShowForm(false); setEditItem(null); }} className="bg-white text-gray-600 border border-gray-200 px-4 py-2.5 rounded-lg text-sm">Cancel</button>
          </form>
        </div>
      )}
      <DataTable columns={columns} data={items} loading={loading} />
    </div>
  );
}

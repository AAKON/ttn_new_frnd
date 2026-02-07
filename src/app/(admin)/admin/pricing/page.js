"use client";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { getPricings, createPricing, updatePricing, deletePricing } from "@/services/admin";
import DataTable from "@/components/admin/data-table";
import DeleteDialog from "@/components/admin/delete-dialog";

export default function PricingPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({ name: "", price: "", type: "monthly", benefits: "", services: "", is_popular: false });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const load = () => { setLoading(true); getPricings().then((d) => setItems(d || [])).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);

  const handleChange = (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: val });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = { ...formData, benefits: formData.benefits, services: formData.services };
      const result = editItem ? await updatePricing(editItem.id, data, toast) : await createPricing(data, toast);
      if (result?.status) { setShowForm(false); setEditItem(null); load(); }
    } finally { setSaving(false); }
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setFormData({ name: item.name, price: item.price, type: item.type, benefits: typeof item.benefits === "string" ? item.benefits : JSON.stringify(item.benefits || []), services: typeof item.services === "string" ? item.services : JSON.stringify(item.services || []), is_popular: item.is_popular });
    setShowForm(true);
  };

  const columns = [
    { key: "id", label: "ID", width: "60px" },
    { key: "name", label: "Name" },
    { key: "price", label: "Price", render: (row) => `$${row.price}` },
    { key: "type", label: "Type" },
    { key: "is_popular", label: "Popular", render: (row) => row.is_popular ? "Yes" : "No" },
    { key: "actions", label: "Actions", width: "120px", render: (row) => (
      <div className="flex gap-2">
        <button onClick={() => handleEdit(row)} className="text-sm text-brand-600 bg-transparent font-medium">Edit</button>
        <DeleteDialog onConfirm={() => { deletePricing(row.id, toast).then(load); }} />
      </div>
    )},
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Pricing</h1>
        <button onClick={() => { setShowForm(true); setEditItem(null); setFormData({ name: "", price: "", type: "monthly", benefits: "", services: "", is_popular: false }); }} className="bg-brand-600 text-white px-4 py-2 rounded-lg font-semibold text-sm">Add Plan</button>
      </div>
      {showForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div><label className="formLabelClasses block mb-1">Name</label><input type="text" name="name" value={formData.name} onChange={handleChange} className="input_style" required /></div>
              <div><label className="formLabelClasses block mb-1">Price</label><input type="number" name="price" value={formData.price} onChange={handleChange} className="input_style" required /></div>
              <div><label className="formLabelClasses block mb-1">Type</label><select name="type" value={formData.type} onChange={handleChange} className="input_style"><option value="monthly">Monthly</option><option value="annual">Annual</option></select></div>
            </div>
            <div><label className="formLabelClasses block mb-1">Benefits (JSON array)</label><textarea name="benefits" value={formData.benefits} onChange={handleChange} className="input_style" rows={3} placeholder='["Benefit 1", "Benefit 2"]' /></div>
            <div><label className="formLabelClasses block mb-1">Services (JSON array)</label><textarea name="services" value={formData.services} onChange={handleChange} className="input_style" rows={3} placeholder='["Service 1", "Service 2"]' /></div>
            <div className="flex items-center gap-2"><input type="checkbox" name="is_popular" checked={formData.is_popular} onChange={handleChange} /><label className="text-sm">Popular</label></div>
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

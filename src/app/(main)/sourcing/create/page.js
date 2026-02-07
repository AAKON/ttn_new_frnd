"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import { createSourcingProposal, getSourcingFilterOptions } from "@/services/sourcing";
import { useDropzone } from "react-dropzone";
import { X } from "lucide-react";

export default function CreateSourcingProposalPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [filterOptions, setFilterOptions] = useState(null);
  const [images, setImages] = useState([]);
  const [formData, setFormData] = useState({
    title: "", description: "", company_name: "", quantity: "", unit: "pieces",
    price_from: "", price_to: "", currency: "USD", payment_method: "LC",
    delivery_date: "", product_category_ids: [],
  });

  useEffect(() => {
    getSourcingFilterOptions().then((res) => setFilterOptions(res?.data));
  }, []);

  const onDrop = useCallback((files) => {
    setImages((prev) => [...prev, ...files].slice(0, 5));
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: { "image/*": [] }, maxFiles: 5 });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleCategoryToggle = (id) => {
    setFormData((prev) => ({
      ...prev,
      product_category_ids: prev.product_category_ids.includes(id)
        ? prev.product_category_ids.filter((c) => c !== id)
        : [...prev.product_category_ids, id],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => {
        if (k === "product_category_ids") {
          v.forEach((id) => fd.append("product_category_ids[]", id));
        } else {
          fd.append(k, v);
        }
      });
      images.forEach((img) => fd.append("images", img));
      const result = await createSourcingProposal(fd, toast, session?.accessToken);
      if (result?.status) router.push("/myaccount/sourcing-proposals");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-12 max-w-3xl">
      <h1 className="mb-8">Create Sourcing Proposal</h1>
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="formLabelClasses block mb-1">Title</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} className="input_style" required />
          </div>
          <div>
            <label className="formLabelClasses block mb-1">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} className="input_style min-h-[100px]" rows={4} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="formLabelClasses block mb-1">Company Name</label>
              <input type="text" name="company_name" value={formData.company_name} onChange={handleChange} className="input_style" />
            </div>
            <div>
              <label className="formLabelClasses block mb-1">Quantity</label>
              <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} className="input_style" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="formLabelClasses block mb-1">Unit</label>
              <select name="unit" value={formData.unit} onChange={handleChange} className="input_style">
                <option value="pieces">Pieces</option>
                <option value="meters">Meters</option>
                <option value="yards">Yards</option>
                <option value="kgs">KGs</option>
                <option value="tons">Tons</option>
              </select>
            </div>
            <div>
              <label className="formLabelClasses block mb-1">Price From</label>
              <input type="number" name="price_from" value={formData.price_from} onChange={handleChange} className="input_style" />
            </div>
            <div>
              <label className="formLabelClasses block mb-1">Price To</label>
              <input type="number" name="price_to" value={formData.price_to} onChange={handleChange} className="input_style" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="formLabelClasses block mb-1">Currency</label>
              <select name="currency" value={formData.currency} onChange={handleChange} className="input_style">
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="BDT">BDT</option>
              </select>
            </div>
            <div>
              <label className="formLabelClasses block mb-1">Payment</label>
              <select name="payment_method" value={formData.payment_method} onChange={handleChange} className="input_style">
                <option value="LC">LC</option>
                <option value="TT">TT</option>
                <option value="DP">DP</option>
                <option value="DA">DA</option>
                <option value="CAD">CAD</option>
              </select>
            </div>
            <div>
              <label className="formLabelClasses block mb-1">Delivery Date</label>
              <input type="date" name="delivery_date" value={formData.delivery_date} onChange={handleChange} className="input_style" />
            </div>
          </div>
          {filterOptions?.productCategories?.length > 0 && (
            <div>
              <label className="formLabelClasses block mb-2">Product Categories</label>
              <div className="flex flex-wrap gap-2">
                {filterOptions.productCategories.map((c) => (
                  <button key={c.id} type="button" onClick={() => handleCategoryToggle(c.id)}
                    className={`px-3 py-1.5 text-sm rounded-full border ${formData.product_category_ids.includes(c.id) ? "tag-active" : "border-gray-200 text-gray-700 bg-white"}`}>
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div>
            <label className="formLabelClasses block mb-2">Images (max 5)</label>
            <div {...getRootProps()} className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-brand-600">
              <input {...getInputProps()} />
              <p className="text-sm text-gray-500">Drag & drop images or click to browse</p>
            </div>
            {images.length > 0 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {images.map((f, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border">
                    <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setImages(images.filter((_, j) => j !== i))}
                      className="absolute top-0.5 right-0.5 bg-white rounded-full p-0.5"><X size={12} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button type="submit" disabled={loading} className="w-full bg-brand-600 text-white rounded-lg py-2.5 font-semibold hover:bg-brand-700 disabled:opacity-50">
            {loading ? "Submitting..." : "Submit Proposal"}
          </button>
        </form>
      </div>
    </div>
  );
}

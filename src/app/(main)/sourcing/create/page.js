"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import {
  createSourcingProposal,
  getSourcingFilterOptions,
} from "@/services/sourcing";
import { useDropzone } from "react-dropzone";
import { X } from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import PhoneCountryInput from "@/components/PhoneCountryInput";

export default function CreateSourcingProposalPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [filterOptions, setFilterOptions] = useState(null);
  const [images, setImages] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    company_name: "",
    email: "",
    phone: "",
    whatsapp: "",
    address: "",
    quantity: "",
    unit: "yard",
    price: "",
    currency: "USD",
    payment_method: "bank_transfer",
    delivery_info: "",
    product_category_ids: [],
    location_id: "",
  });
  const [phoneCountry, setPhoneCountry] = useState("US");
  const [whatsappCountry, setWhatsappCountry] = useState("US");

  const editor = useEditor({
    extensions: [StarterKit],
    content: formData.description,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setFormData((prev) => ({ ...prev, description: editor.getHTML() }));
    },
    editorProps: {
      attributes: {
        class: "min-h-[120px] outline-none p-3 text-sm text-gray-700",
      },
    },
  });

  useEffect(() => {
    getSourcingFilterOptions().then((res) => setFilterOptions(res?.data));
  }, []);

  const onDrop = useCallback((files) => {
    setImages((prev) => [...prev, ...files].slice(0, 5));
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 5,
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleNext = () => {
    if (!formData.location_id || formData.product_category_ids.length === 0 || !formData.company_name) {
      toast({ title: "Please fill Category, Country and Company Name", variant: "destructive" });
      return;
    }
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!formData.title) {
      toast({ title: "Please fill Proposal Title", variant: "destructive" });
      return;
    }
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
      const result = await createSourcingProposal(
        fd,
        toast,
        session?.accessToken
      );
      if (result?.status) router.push("/myaccount/sourcing-proposals");
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryToggle = (id) => {
    setFormData((prev) => ({
      ...prev,
      product_category_ids: prev.product_category_ids.includes(id)
        ? prev.product_category_ids.filter((c) => c !== id)
        : [...prev.product_category_ids, id],
    }));
  };

  return (
    <div className="container mx-auto py-8 max-w-lg px-4">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="!text-lg !font-bold !text-gray-900">
            Sourcing Proposal
          </h2>
          <button
            onClick={() => router.back()}
            className="!bg-transparent !p-1 !text-gray-400 hover:!text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-5 pt-6 pb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  step >= 2
                    ? "border-brand-500 bg-brand-500"
                    : step === 1
                    ? "border-brand-500"
                    : "border-gray-300"
                }`}
              >
                {step >= 2 && (
                  <svg
                    className="w-3.5 h-3.5 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
              <span
                className={`text-sm font-medium ${
                  step >= 1 ? "text-brand-600" : "text-gray-500"
                }`}
              >
                Basic Info
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  step === 2 ? "border-brand-500" : "border-gray-300"
                }`}
              />
              <span
                className={`text-sm font-medium ${
                  step === 2 ? "text-gray-900" : "text-gray-400"
                }`}
              >
                Inquiry Details
              </span>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="flex gap-1">
            <div
              className={`h-1 flex-1 rounded-full ${
                step >= 1 ? "bg-brand-500" : "bg-gray-200"
              }`}
            />
            <div
              className={`h-1 flex-1 rounded-full ${
                step >= 2 ? "bg-brand-500" : "bg-gray-200"
              }`}
            />
          </div>
        </div>

        <div>
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="px-5 pb-6">
              {/* Category & Country */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1.5">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="product_category_ids"
                    value={formData.product_category_ids[0] || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        product_category_ids: e.target.value
                          ? [Number(e.target.value)]
                          : [],
                      })
                    }
                    className="input_style"
                  >
                    <option value="">Select category</option>
                    {filterOptions?.categories?.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1.5">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="location_id"
                    value={formData.location_id}
                    onChange={handleChange}
                    className="input_style"
                  >
                    <option value="">Select country</option>
                    {filterOptions?.locations?.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Company Name */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-900 mb-1.5">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  placeholder="Type your company name"
                  className="input_style"
                />
              </div>

              <hr className="mb-5" />

              {/* Email */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-900 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Ex: demo@email.com"
                  className="input_style"
                />
              </div>

              {/* Phone & WhatsApp */}
              <div className="grid grid-cols-2 gap-4">
                <PhoneCountryInput
                  countryCode={phoneCountry}
                  phoneNumber={formData.phone}
                  onCountryChange={setPhoneCountry}
                  onPhoneChange={(val) =>
                    setFormData({ ...formData, phone: val })
                  }
                  locations={filterOptions?.locations || []}
                  label="Phone"
                  placeholder="Ex: 123654789"
                />
                <PhoneCountryInput
                  countryCode={whatsappCountry}
                  phoneNumber={formData.whatsapp}
                  onCountryChange={setWhatsappCountry}
                  onPhoneChange={(val) =>
                    setFormData({ ...formData, whatsapp: val })
                  }
                  locations={filterOptions?.locations || []}
                  label="WhatsApp"
                  placeholder="Ex: 123654789"
                />
              </div>

              {/* Address */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-900 mb-1.5">
                  Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter your address"
                  rows={2}
                  className="input_style"
                />
              </div>
            </div>
          )}

          {/* Step 2: Inquiry Details */}
          {step === 2 && (
            <div className="px-5 pb-6">
              {/* Proposal Title */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-900 mb-1.5">
                  Proposal Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter proposal title"
                  className="input_style"
                />
              </div>

              {/* Proposal Description - Rich Text */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-900 mb-1.5">
                  Proposal Description
                </label>
                <div className="border border-gray-200 rounded-md overflow-hidden tiptap-content">
                  {/* Toolbar */}
                  <div className="flex items-center gap-1 px-2 py-1.5 border-b border-gray-200 bg-gray-50">
                    <button
                      type="button"
                      onClick={() =>
                        editor?.chain().focus().toggleBold().run()
                      }
                      className={`!p-1.5 !rounded !text-sm !font-bold ${
                        editor?.isActive("bold")
                          ? "!bg-gray-200 !text-gray-900"
                          : "!bg-transparent !text-gray-500 hover:!bg-gray-100"
                      }`}
                    >
                      B
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        editor?.chain().focus().toggleItalic().run()
                      }
                      className={`!p-1.5 !rounded !text-sm !italic ${
                        editor?.isActive("italic")
                          ? "!bg-gray-200 !text-gray-900"
                          : "!bg-transparent !text-gray-500 hover:!bg-gray-100"
                      }`}
                    >
                      I
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        editor?.chain().focus().toggleBulletList().run()
                      }
                      className={`!p-1.5 !rounded ${
                        editor?.isActive("bulletList")
                          ? "!bg-gray-200 !text-gray-900"
                          : "!bg-transparent !text-gray-500 hover:!bg-gray-100"
                      }`}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"
                        />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        editor?.chain().focus().toggleOrderedList().run()
                      }
                      className={`!p-1.5 !rounded ${
                        editor?.isActive("orderedList")
                          ? "!bg-gray-200 !text-gray-900"
                          : "!bg-transparent !text-gray-500 hover:!bg-gray-100"
                      }`}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M7 6h13M7 12h13M7 18h13M3 6v.01M3 12v.01M3 18v.01"
                        />
                      </svg>
                    </button>
                  </div>
                  <EditorContent editor={editor} />
                </div>
              </div>

              {/* Quantity & Target Price */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1.5">
                    Quantity
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      placeholder="qty"
                      className="input_style w-24"
                    />
                    <select
                      name="unit"
                      value={formData.unit}
                      onChange={handleChange}
                      className="input_style flex-1"
                    >
                      <option value="yard">Yard</option>
                      <option value="pieces">Pieces</option>
                      <option value="meter">Meter</option>
                      <option value="kg">KG</option>
                      <option value="ton">Ton</option>
                      <option value="liter">Liter</option>
                      <option value="box">Box</option>
                      <option value="container">Container</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1.5">
                    Target Price Per Unit
                  </label>
                  <div className="flex gap-2">
                    <div className="flex items-center border border-gray-200 rounded-md px-3 bg-white">
                      <span className="text-sm text-gray-500">$</span>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        className="w-full border-none outline-none bg-transparent text-sm px-1 py-2"
                      />
                    </div>
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleChange}
                      className="input_style w-20"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="BDT">BDT</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-900 mb-1.5">
                  Payment Methods
                </label>
                <select
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={handleChange}
                  className="input_style"
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="letter_of_credit">Letter of Credit</option>
                  <option value="cash">Cash</option>
                  <option value="paypal">PayPal</option>
                  <option value="escrow">Escrow</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="advance_payment">Advance Payment</option>
                  <option value="payment_on_delivery">Payment on Delivery</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Delivery Information */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-900 mb-1.5">
                  Delivery Information
                </label>
                <input
                  type="text"
                  name="delivery_info"
                  value={formData.delivery_info}
                  onChange={handleChange}
                  placeholder="Type your delivery details"
                  className="input_style"
                />
              </div>

              {/* Image Upload */}
              <div>
                <div
                  {...getRootProps()}
                  className="border-2 border-dashed border-brand-200 bg-brand-50/30 rounded-lg p-8 text-center cursor-pointer hover:border-brand-400 transition-colors"
                >
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-brand-500"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                        />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-600">
                      Drag or click to upload new photo/logo
                    </p>
                  </div>
                </div>
                {images.length > 0 && (
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {images.map((f, i) => (
                      <div
                        key={i}
                        className="relative w-20 h-20 rounded-lg overflow-hidden border"
                      >
                        <img
                          src={URL.createObjectURL(f)}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setImages(images.filter((_, j) => j !== i))
                          }
                          className="absolute top-0.5 right-0.5 !bg-white !rounded-full !p-0.5"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex gap-3 px-5 py-4 border-t">
            {step === 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 !bg-white !text-gray-700 !border !border-gray-300 !py-3 !rounded-lg text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 !bg-brand-500 hover:!bg-brand-600 !text-white !py-3 !rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
                >
                  Next
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 !bg-white !text-gray-700 !border !border-gray-300 !py-3 !rounded-lg text-sm font-semibold"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 !bg-brand-500 hover:!bg-brand-600 !text-white !py-3 !rounded-lg text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? "Submitting..." : "Submit"}
                  {!loading && (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

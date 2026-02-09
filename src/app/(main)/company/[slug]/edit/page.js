"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { apiRequest } from "@/utils/api";
import { getMyCompanies } from "@/services/company";
import { Trash2, Plus, ChevronLeft, ChevronRight, X } from "lucide-react";

export default function EditCompanyPage() {
  const router = useRouter();
  const params = useParams();
  const { slug } = params;
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submittingBasicInfo, setSubmittingBasicInfo] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [filterOptions, setFilterOptions] = useState({
    locations: [],
    businessCategories: [],
    businessTypes: [],
  });

  const [formData, setFormData] = useState({
    name: "",
    company_size: "",
    location_id: "",
    business_category_ids: [],
    business_type_ids: [],
    company_motto: "",
    description: "",
    image: null,
    imageUrl: "",
  });

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);

  const [products, setProducts] = useState([]);
  const [productImagePreview, setProductImagePreview] = useState(null);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [editingProductId, setEditingProductId] = useState(null);
  const [newProduct, setNewProduct] = useState({
    product_category_id: "",
    name: "",
    price_range: "",
    price_max: "",
    moq: "",
    image: null,
  });

  const [overview, setOverview] = useState({
    is_manufacturer: "",
    capacity: "",
    moq: "",
    lead_time: "",
    payment_policy: "",
    delivery_terms: "",
  });

  const [marketShare, setMarketShare] = useState([]);
  const [yearlyTurnover, setYearlyTurnover] = useState([]);

  // Fetch company details
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    const fetchCompanyData = async () => {
      // Check if user owns this company
      try {
        const myCompanies = await getMyCompanies();
        const owned = myCompanies.some(
          (c) => c.slug === slug || c.id === slug
        );
        if (!owned) {
          router.push("/company/" + slug);
          return;
        }
      } catch (error) {
        console.error("Error checking company ownership:", error);
        router.push("/company/" + slug);
        return;
      }
      try {
        const result = await apiRequest(
          `my/company/edit/${slug}`,
          {
            method: "GET",
            cache: "no-store",
          },
          null,
          session?.accessToken
        );

        if (result?.data) {
          const company = result.data;
          setFormData({
            name: company.name || "",
            company_size: company.manpower || "",
            location_id: company.location?.id || company.location_id || "",
            business_category_ids: company.business_categories || [],
            business_type_ids: company.business_types || [],
            company_motto: company.moto || "",
            description: company.about || "",
            image: null,
            imageUrl: company.thumbnail_url || company.profile_pic_url || "",
          });

          // Handle products with proper field mapping
          const productsData = company.products || [];
          console.log("Products loaded from API:", productsData);
          setProducts(productsData);

          setSelectedCategories(company.business_categories || company.businessCategories || []);
          setSelectedTypes(company.business_types || company.businessTypes || []);
          setOverview(company.overview || {});
        }
      } catch (error) {
        console.error("Failed to fetch company", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchFilterOptions = async () => {
      try {
        const result = await apiRequest("company/filter-options", {
          method: "GET",
          cache: "no-store",
        });
        if (result?.data) {
          setFilterOptions({
            locations: result.data.locations || [],
            businessCategories: result.data.businessCategories || result.data.business_categories || [],
            businessTypes: result.data.businessTypes || result.data.business_types || [],
          });
        }
      } catch (error) {
        console.error("Failed to fetch filter options", error);
      }
    };

    if (status === "authenticated") {
      fetchCompanyData();
      fetchFilterOptions();
    }
  }, [status, slug, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
      }));
    }
  };

  const handleProductChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProductImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewProduct((prev) => ({
        ...prev,
        image: file,
      }));
      const reader = new FileReader();
      reader.onload = (event) => {
        setProductImagePreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const addProduct = async () => {
    if (!newProduct.name || !newProduct.product_category_id || !newProduct.moq) {
      alert("Please fill all required fields (Category, Title, MOQ)");
      return;
    }

    try {
      const data = new FormData();
      data.append("name", newProduct.name);
      data.append("product_category_id", parseInt(newProduct.product_category_id) || 0);
      data.append("price_range", newProduct.price_range || 0);
      data.append("price_max", newProduct.price_max || 0);
      data.append("moq", parseInt(newProduct.moq) || 0);

      // Only append image if it's a File object (newly selected), not if it's a URL string
      if (newProduct.image && newProduct.image instanceof File) {
        data.append("image", newProduct.image);
      }

      let result;
      let successMessage;

      if (editingProductId) {
        // Update existing product
        result = await apiRequest(
          `my/company/${slug}/product/${editingProductId}/update`,
          {
            method: "POST",
            isFormData: true,
            body: data,
          },
          null,
          session?.accessToken
        );
        successMessage = "Product updated successfully!";
      } else {
        // Create new product
        result = await apiRequest(
          `my/company/${slug}/product/store`,
          {
            method: "POST",
            isFormData: true,
            body: data,
          },
          null,
          session?.accessToken
        );
        successMessage = "Product added successfully!";
      }

      if (result?.status || result?.data) {
        // Refresh products list
        const productsResult = await apiRequest(
          `my/company/${slug}/product`,
          { method: "GET", cache: "no-store" },
          null,
          session?.accessToken
        );

        if (Array.isArray(productsResult?.data)) {
          setProducts(productsResult.data);
        }

        // Reset form
        setNewProduct({
          product_category_id: "",
          name: "",
          price_range: "",
          price_max: "",
          moq: "",
          image: null,
        });
        setProductImagePreview(null);
        setEditingProductId(null);
        alert(successMessage);
      }
    } catch (error) {
      console.error("Failed to save product", error);
      const errorMsg = error?.data?.message || error?.message || "Unknown error";
      alert("Failed to save product: " + errorMsg);
    }
  };

  const deleteProduct = async (productId) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await apiRequest(
        `my/company/${slug}/product/${productId}/delete`,
        {
          method: "GET",
        },
        null,
        session?.accessToken
      );
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      alert("Product deleted successfully!");
    } catch (error) {
      console.error("Failed to delete product", error);
      alert("Failed to delete product");
    }
  };

  const handleOverviewChange = (e) => {
    const { name, value } = e.target;
    setOverview((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitBasicInfo = async (e) => {
    e.preventDefault();
    setSubmittingBasicInfo(true);

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("manpower", formData.company_size);
      data.append("location_id", formData.location_id);

      // Append business categories as individual items
      selectedCategories.forEach((cat) => {
        data.append("business_categories[]", cat.id || cat);
      });

      // Append business types as individual items
      selectedTypes.forEach((type) => {
        data.append("business_types[]", type.id || type);
      });

      data.append("moto", formData.company_motto);
      data.append("about", formData.description);

      if (formData.image) {
        data.append("image", formData.image);
      }

      const result = await apiRequest(
        `my/company/update/${slug}`,
        {
          method: "POST",
          isFormData: true,
          body: data,
        },
        null,
        session?.accessToken
      );

      if (result?.data || result?.status) {
        alert("Company information updated successfully!");
      }
    } catch (error) {
      console.error("Failed to update company", error);
      alert("Failed to update company information");
    } finally {
      setSubmittingBasicInfo(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("manpower", formData.company_size);
      data.append("location_id", formData.location_id);

      // Append business categories as individual items
      selectedCategories.forEach((cat) => {
        data.append("business_categories[]", cat.id || cat);
      });

      // Append business types as individual items
      selectedTypes.forEach((type) => {
        data.append("business_types[]", type.id || type);
      });

      data.append("moto", formData.company_motto);
      data.append("about", formData.description);

      if (formData.image) {
        data.append("image", formData.image);
      }

      const result = await apiRequest(`company/${slug}`, {
        method: "PUT",
        isFormData: true,
        body: data,
      });

      if (result?.data) {
        router.push(`/company/${slug}`);
      }
    } catch (error) {
      console.error("Failed to update company", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading" || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Edit Company</h1>
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
            >
              Preview
            </button>
          </div>

          {/* Company Information Section */}
          <form onSubmit={handleSubmitBasicInfo} className="space-y-8 mb-8">
            <div className="bg-white rounded-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Company Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Size <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="company_size"
                    value={formData.company_size}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600"
                  >
                    <option value="">Select Category</option>
                    <option value="1-50">1-50 employees</option>
                    <option value="51-100">51-100 employees</option>
                    <option value="101-500">101-500 employees</option>
                    <option value="501-1000">501-1000 employees</option>
                    <option value="1000+">1000+ employees</option>
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country <span className="text-red-500">*</span>
                </label>
                <select
                  name="location_id"
                  value={formData.location_id}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600"
                >
                  <option value="">Select country</option>
                  {filterOptions.locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedCategories.map((category, index) => (
                    <div
                      key={index}
                      className="bg-gray-200 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {category.name || category}
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedCategories((prev) => prev.filter((_, i) => i !== index))
                        }
                        className="text-gray-600 hover:text-gray-900"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      const selected = filterOptions.businessCategories.find(
                        (cat) => cat.id === parseInt(e.target.value)
                      );
                      if (selected && !selectedCategories.some((c) => c.id === selected.id)) {
                        setSelectedCategories((prev) => [...prev, selected]);
                      }
                      e.target.value = "";
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600"
                >
                  <option value="">Add new...</option>
                  {filterOptions.businessCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedTypes.map((type, index) => (
                    <div
                      key={index}
                      className="bg-gray-200 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {type.name || type}
                      <button
                        type="button"
                        onClick={() => setSelectedTypes((prev) => prev.filter((_, i) => i !== index))}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      const selected = filterOptions.businessTypes.find(
                        (type) => type.id === parseInt(e.target.value)
                      );
                      if (selected && !selectedTypes.some((t) => t.id === selected.id)) {
                        setSelectedTypes((prev) => [...prev, selected]);
                      }
                      e.target.value = "";
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600"
                >
                  <option value="">Add new...</option>
                  {filterOptions.businessTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Motto
                </label>
                <input
                  type="text"
                  name="company_motto"
                  value={formData.company_motto}
                  onChange={handleInputChange}
                  placeholder="Enter company motto"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  About us
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter a description"
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600 resize-none"
                />
              </div>

              {/* Profile Image */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Image
                </label>
                <div className="flex gap-6 items-end">
                  {formData.imageUrl && !formData.image && (
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      <img
                        src={formData.imageUrl}
                        alt="Company"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="px-4 py-2 border border-gray-300 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Done Button */}
              <button
                type="submit"
                disabled={submittingBasicInfo}
                className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-8 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submittingBasicInfo ? "Saving..." : "Done"}
              </button>
            </div>
          </form>

          {/* Products Section */}
          <div className="space-y-8" id="products-section">
            <div className="bg-white rounded-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Products/Services</h2>

              {/* Add Product Form */}
              <div className="space-y-6">
                {/* Category Select - Full Width */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="product_category_id"
                    value={newProduct.product_category_id}
                    onChange={handleProductChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600"
                  >
                    <option value="">Select Category</option>
                    {filterOptions.businessCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Image Upload and Form Fields Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Product Image - Left Side */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Image <span className="text-red-500">*</span>
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50 hover:bg-gray-100 transition-colors">
                      {productImagePreview ? (
                        <div className="flex flex-col items-center">
                          <img
                            src={productImagePreview}
                            alt="Preview"
                            className="w-24 h-24 object-cover rounded-lg mb-3"
                          />
                          <label className="text-xs text-brand-600 cursor-pointer hover:text-brand-700 font-medium">
                            Change Image
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleProductImageChange}
                              className="hidden"
                            />
                          </label>
                        </div>
                      ) : (
                        <label className="cursor-pointer">
                          <div className="text-4xl text-brand-600 mb-2">⊕</div>
                          <p className="text-xs sm:text-sm text-gray-600">Drag or click to upload files</p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleProductImageChange}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Form Fields - Right Side */}
                  <div className="md:col-span-2 space-y-4">
                    {/* Product Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={newProduct.name}
                        onChange={handleProductChange}
                        placeholder="Enter product title"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600"
                      />
                    </div>

                    {/* Price Min and Max */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Product Price (Min) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          name="price_range"
                          value={newProduct.price_range}
                          onChange={handleProductChange}
                          placeholder="Your Product Price"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Product Price (Max)
                        </label>
                        <input
                          type="number"
                          name="price_max"
                          value={newProduct.price_max}
                          onChange={handleProductChange}
                          placeholder="Your Product Price"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600"
                        />
                      </div>
                    </div>

                    {/* MOQ */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum Order Quantity (MOQ) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="moq"
                        value={newProduct.moq}
                        onChange={handleProductChange}
                        placeholder="500 Piece/Pieces (Min. Order)"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Done Button */}
                <div className="flex justify-end gap-3">
                  {editingProductId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProductId(null);
                        setNewProduct({
                          product_category_id: "",
                          name: "",
                          price_range: "",
                          price_max: "",
                          moq: "",
                          image: null,
                        });
                        setProductImagePreview(null);
                      }}
                      className="bg-gray-400 hover:bg-gray-500 text-white font-semibold px-8 py-2 rounded-md transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={addProduct}
                    className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-12 py-2 rounded-md transition-colors"
                  >
                    {editingProductId ? "Update" : "Done"}
                  </button>
                </div>
              </div>

              {/* Products List - Carousel View */}
              {products && products.length >= 0 && (
                <div className="border-t pt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Available Products</h3>

                  <div className="flex items-center justify-between gap-4">
                    {/* Left Arrow - Only show if more than 4 products */}
                    {products.length > 4 && (
                      <button
                        onClick={() => setCurrentProductIndex(Math.max(0, currentProductIndex - 1))}
                        disabled={currentProductIndex === 0}
                        className="flex-shrink-0 bg-white border border-gray-300 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed rounded-full p-2 transition-colors"
                      >
                        <ChevronLeft size={24} className="text-gray-600" />
                      </button>
                    )}
                    {products.length <= 4 && <div className="w-12" />}

                    {/* Products Carousel with smooth transition - 1 card at a time */}
                    <div className="flex-1 overflow-hidden">
                      {products.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          No products added yet
                        </div>
                      ) : (
                        <div
                          className="flex gap-4 transition-all duration-500 ease-in-out"
                          style={{
                            width: `${Math.ceil(products.length / 4) * 100}%`,
                            transform: `translateX(-${currentProductIndex * (25 / Math.ceil(products.length / 4))}%)`,
                          }}
                        >
                          {products.map((product) => {
                            const productImage = product.image || product.image_url;
                            const productName = product.name || product.title || "Unnamed Product";
                            const categoryName = product.product_category?.name || product.category?.name || "Uncategorized";
                            const price = product.price_range || product.price_max || product.price_usd || product.price_inr || "N/A";
                            const moq = product.moq || "N/A";

                            return (
                              <div
                                key={product.id}
                                style={{
                                  flex: `0 0 ${25 / Math.ceil(products.length / 4)}%`
                                }}
                                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
                              >
                                {/* Product Image */}
                                <div className="w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                                  {productImage ? (
                                    <img
                                      src={productImage}
                                      alt={productName}
                                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                                    />
                                  ) : (
                                    <span className="text-gray-400 text-sm">No image</span>
                                  )}
                                </div>

                                {/* Product Info */}
                                <div className="p-4">
                                  {/* Category */}
                                  <p className="text-xs font-semibold text-brand-600 mb-2 uppercase tracking-widest">
                                    {categoryName}
                                  </p>

                                  {/* Product Name */}
                                  <h4 className="font-semibold text-gray-900 mb-2 text-sm line-clamp-2 h-10">
                                    {productName}
                                  </h4>

                                  {/* Price */}
                                  <p className="text-gray-900 font-bold text-2xl mb-1">
                                    ${price}
                                  </p>

                                  {/* MOQ */}
                                  <p className="text-xs text-gray-500 mb-4">
                                    {moq}(Min. order)
                                  </p>

                                  {/* Action Buttons */}
                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      onClick={() => deleteProduct(product.id)}
                                      className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2 rounded-lg flex items-center justify-center gap-2 transition-all duration-200"
                                      title="Delete"
                                    >
                                      Delete <Trash2 size={16} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingProductId(product.id);
                                        setNewProduct({
                                          product_category_id: product.product_category_id || "",
                                          name: product.name || "",
                                          price_range: product.price_range || "",
                                          price_max: product.price_max || "",
                                          moq: product.moq || "",
                                          image: null,
                                        });
                                        if (productImage) {
                                          setProductImagePreview(productImage);
                                        }
                                        // Scroll to products section
                                        setTimeout(() => {
                                          const element = document.getElementById('products-section');
                                          if (element) {
                                            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                          }
                                        }, 0);
                                      }}
                                      className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2 rounded-lg flex items-center justify-center gap-2 transition-all duration-200"
                                      title="Edit"
                                    >
                                      Edit ✎
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Right Arrow - Only show if more than 4 products */}
                    {products.length > 4 && (
                      <button
                        onClick={() => setCurrentProductIndex(Math.min(products.length - 4, currentProductIndex + 1))}
                        disabled={currentProductIndex >= products.length - 4}
                        className="flex-shrink-0 bg-white border border-gray-300 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed rounded-full p-2 transition-colors"
                      >
                        <ChevronRight size={24} className="text-gray-600" />
                      </button>
                    )}
                    {products.length <= 4 && <div className="w-12" />}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Section with Tabs */}
            <div className="bg-white rounded-lg p-8">
              <div className="flex gap-6 border-b mb-6">
                {["profile", "clients", "certificates", "contacts", "faq"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 font-semibold ${
                      activeTab === tab
                        ? "text-brand-600 border-b-2 border-brand-600"
                        : "text-gray-600"
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {/* Profile Tab Content */}
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Are You Manufacturer?
                    </label>
                    <select
                      name="is_manufacturer"
                      value={overview.is_manufacturer || ""}
                      onChange={handleOverviewChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600"
                    >
                      <option value="">Select</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Capacity
                    </label>
                    <input
                      type="text"
                      name="capacity"
                      value={overview.capacity || ""}
                      onChange={handleOverviewChange}
                      placeholder="Enter capacity"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Order Quantity (MOQ)
                    </label>
                    <input
                      type="text"
                      name="moq"
                      value={overview.moq || ""}
                      onChange={handleOverviewChange}
                      placeholder="Enter MOQ"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lead Time
                    </label>
                    <input
                      type="text"
                      name="lead_time"
                      value={overview.lead_time || ""}
                      onChange={handleOverviewChange}
                      placeholder="Enter lead time"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Policy
                    </label>
                    <input
                      type="text"
                      name="payment_policy"
                      value={overview.payment_policy || ""}
                      onChange={handleOverviewChange}
                      placeholder="Enter payment policy"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Terms
                    </label>
                    <input
                      type="text"
                      name="delivery_terms"
                      value={overview.delivery_terms || ""}
                      onChange={handleOverviewChange}
                      placeholder="Enter delivery terms"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600"
                    />
                  </div>
                </div>
              )}

              {/* Other tabs - placeholder */}
              {activeTab !== "profile" && (
                <div className="text-center py-8 text-gray-600">
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} section coming soon...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { apiRequest } from "@/utils/api";

export default function CreateCompanyPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
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
  });

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
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
    fetchFilterOptions();
  }, []);

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

  const handleAddCategory = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const value = e.target.value.trim();
      if (value) {
        setSelectedCategories((prev) => [...prev, value]);
        e.target.value = "";
      }
    }
  };

  const handleAddType = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const value = e.target.value.trim();
      if (value) {
        setSelectedTypes((prev) => [...prev, value]);
        e.target.value = "";
      }
    }
  };

  const removeCategory = (index) => {
    setSelectedCategories((prev) => prev.filter((_, i) => i !== index));
  };

  const removeType = (index) => {
    setSelectedTypes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("company_size", formData.company_size);
      data.append("location_id", formData.location_id);
      data.append("business_category_ids", JSON.stringify(selectedCategories));
      data.append("business_type_ids", JSON.stringify(selectedTypes));
      data.append("company_motto", formData.company_motto);
      data.append("description", formData.description);
      if (formData.image) {
        data.append("image", formData.image);
      }

      const result = await apiRequest("company", {
        method: "POST",
        isFormData: true,
        body: data,
      });

      if (result?.data) {
        router.push(`/company/${result.data.slug || result.data.id}`);
      }
    } catch (error) {
      console.error("Failed to create company", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Create Company</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Name and Company Size */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Write your company name"
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

            {/* Country */}
            <div>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedCategories.map((category, index) => (
                    <div
                      key={index}
                      className="bg-gray-200 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {category}
                      <button
                        type="button"
                        onClick={() => removeCategory(index)}
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
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedTypes.map((type, index) => (
                    <div
                      key={index}
                      className="bg-gray-200 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {type}
                      <button
                        type="button"
                        onClick={() => removeType(index)}
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
            </div>

            {/* Company Motto */}
            <div>
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

            {/* About us */}
            <div>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Image
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-input"
                />
                <label htmlFor="image-input" className="cursor-pointer">
                  {formData.image ? (
                    <div>
                      <p className="text-sm font-medium text-gray-700">{formData.image.name}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-600">Click to upload image</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6">
              <button
                type="submit"
                disabled={loading}
                className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-8 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Creating..." : "Create Company"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

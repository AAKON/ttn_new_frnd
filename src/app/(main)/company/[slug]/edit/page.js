"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { apiRequest } from "@/utils/api";
import { getMyCompanies } from "@/services/company";
import { Trash2, Plus, ChevronLeft, ChevronRight, X } from "lucide-react";
import PhoneCountryInput from "@/components/PhoneCountryInput";

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
    certificates: [],
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
  const [itemsPerSlide, setItemsPerSlide] = useState(4);
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

  const [clients, setClients] = useState([]);
  const [clientFile, setClientFile] = useState(null);
  const [clientImagePreview, setClientImagePreview] = useState(null);
  const [uploadingClient, setUploadingClient] = useState(false);

  const [certificates, setCertificates] = useState([]);
  const [selectedCertificateId, setSelectedCertificateId] = useState("");
  const [availableCertificates, setAvailableCertificates] = useState([]);
  const [showCertificateDropdown, setShowCertificateDropdown] = useState(false);

  const [contact, setContact] = useState({
    address: "",
    factory_address: "",
    email: "",
    phone: "",
    phone_code: "US",
    whatsapp: "",
    whatsapp_code: "US",
    website: "",
    latitude: "",
    longitude: "",
  });

  const [decisionMakers, setDecisionMakers] = useState([]);
  const [newDecisionMaker, setNewDecisionMaker] = useState({
    name: "",
    designation: "",
    email: "",
    phone: "",
    phone_code: "US",
    whatsapp: "",
    whatsapp_code: "US",
  });

  // Handle responsive slider items
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        if (window.innerWidth < 640) {
          setItemsPerSlide(1); // Mobile
        } else if (window.innerWidth < 1024) {
          setItemsPerSlide(2); // Tablet
        } else {
          setItemsPerSlide(4); // Desktop
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

          // Load clients
          const clientsResult = await apiRequest(
            `my/company/${slug}/client`,
            { method: "GET", cache: "no-store" },
            null,
            session?.accessToken
          );
          if (Array.isArray(clientsResult?.data)) {
            setClients(clientsResult.data);
          }

          // Load certificates
          if (company.certificates && Array.isArray(company.certificates)) {
            setCertificates(company.certificates);
          }

          // Load contact information
          if (company.contact) {
            setContact({
              address: company.contact.address || "",
              factory_address: company.contact.factory_address || "",
              email: company.contact.email || "",
              phone: company.contact.phone || "",
              phone_code: company.contact.phone_code || "US",
              whatsapp: company.contact.whatsapp || "",
              whatsapp_code: company.contact.whatsapp_code || "US",
              website: company.contact.website || "",
              latitude: company.contact.latitude || "",
              longitude: company.contact.longitude || "",
            });
          }

          // Load decision makers
          if (company.decision_makers && Array.isArray(company.decision_makers)) {
            setDecisionMakers(company.decision_makers);
          }

          setSelectedCategories(company.business_categories || company.businessCategories || []);
          setSelectedTypes(company.business_types || company.businessTypes || []);

          // Set overview and extract market share and yearly turnover
          if (company.overview) {
            setOverview({
              is_manufacturer: company.overview.is_manufacturer ? "yes" : "no",
              capacity: company.overview.production_capacity || "",
              moq: company.overview.moq || "",
              lead_time: company.overview.lead_time || "",
              payment_policy: company.overview.payment_policy || "",
              delivery_terms: company.overview.shipment_term || "",
            });

            // Populate market share - convert location_id to country
            if (company.overview.market_share && Array.isArray(company.overview.market_share)) {
              setMarketShare(
                company.overview.market_share.map((item) => ({
                  country: String(item.location_id),
                  percentage: item.percentage || "",
                }))
              );
            }

            // Populate yearly turnover
            if (company.overview.yearly_turnover && Array.isArray(company.overview.yearly_turnover)) {
              setYearlyTurnover(
                company.overview.yearly_turnover.map((item) => ({
                  year: item.year || "",
                  turnover: item.turnover || "",
                }))
              );
            }
          }
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
            certificates: result.data.certificates || [],
          });
          setAvailableCertificates(result.data.certificates || []);
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

  const handleClientFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setClientFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setClientImagePreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadClient = async () => {
    if (!clientFile) {
      alert("Please select a client logo");
      return;
    }

    setUploadingClient(true);
    try {
      const data = new FormData();
      data.append("image", clientFile);

      const result = await apiRequest(
        `my/company/${slug}/client/store`,
        {
          method: "POST",
          isFormData: true,
          body: data,
        },
        null,
        session?.accessToken
      );

      if (result?.status || result?.data) {
        // Refresh clients list
        const clientsResult = await apiRequest(
          `my/company/${slug}/client`,
          { method: "GET", cache: "no-store" },
          null,
          session?.accessToken
        );

        if (Array.isArray(clientsResult?.data)) {
          setClients(clientsResult.data);
        }

        // Reset form
        setClientFile(null);
        setClientImagePreview(null);
        alert("Client logo added successfully!");
      }
    } catch (error) {
      console.error("Failed to upload client", error);
      const errorMsg = error?.data?.message || error?.message || "Unknown error";
      alert("Failed to upload client: " + errorMsg);
    } finally {
      setUploadingClient(false);
    }
  };

  const deleteClient = async (clientId) => {
    if (!confirm("Are you sure you want to delete this client?")) return;

    try {
      const result = await apiRequest(
        `my/company/${slug}/client/${clientId}/delete`,
        { method: "POST" },
        null,
        session?.accessToken
      );

      if (result?.status || result?.data) {
        // Refresh clients list
        const clientsResult = await apiRequest(
          `my/company/${slug}/client`,
          { method: "GET", cache: "no-store" },
          null,
          session?.accessToken
        );

        if (Array.isArray(clientsResult?.data)) {
          setClients(clientsResult.data);
        }

        alert("Client deleted successfully!");
      }
    } catch (error) {
      console.error("Failed to delete client", error);
      alert("Failed to delete client");
    }
  };

  const addCertificate = () => {
    if (!selectedCertificateId) {
      alert("Please select a certificate");
      return;
    }

    // Check if certificate already added
    if (certificates.some(c => c.id === parseInt(selectedCertificateId))) {
      alert("This certificate is already added");
      return;
    }

    const selected = availableCertificates.find(c => c.id === parseInt(selectedCertificateId));
    if (selected) {
      setCertificates([...certificates, selected]);
      setSelectedCertificateId("");
      setShowCertificateDropdown(false);
    }
  };

  const removeCertificate = (certificateId) => {
    setCertificates(certificates.filter(c => c.id !== certificateId));
  };

  const saveCertificates = async () => {
    try {
      const certificateIds = certificates.map(c => c.id);
      const result = await apiRequest(
        `my/company/certificates/${slug}`,
        {
          method: "POST",
          body: { certificates: certificateIds }
        },
        null,
        session?.accessToken
      );

      if (result?.status || result?.data) {
        alert("Certificates updated successfully!");
      }
    } catch (error) {
      console.error("Failed to update certificates", error);
      alert("Failed to update certificates: " + (error?.data?.message || error?.message));
    }
  };

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContact((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhoneCountryChange = (countryCode) => {
    setContact((prev) => ({
      ...prev,
      phone_code: countryCode,
    }));
  };

  const handlePhoneNumberChange = (phoneNumber) => {
    setContact((prev) => ({
      ...prev,
      phone: phoneNumber,
    }));
  };

  const handleWhatsappCountryChange = (countryCode) => {
    setContact((prev) => ({
      ...prev,
      whatsapp_code: countryCode,
    }));
  };

  const handleWhatsappNumberChange = (whatsappNumber) => {
    setContact((prev) => ({
      ...prev,
      whatsapp: whatsappNumber,
    }));
  };

  const handleDecisionMakerChange = (e) => {
    const { name, value } = e.target;
    setNewDecisionMaker((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDMPhoneCountryChange = (countryCode) => {
    setNewDecisionMaker((prev) => ({
      ...prev,
      phone_code: countryCode,
    }));
  };

  const handleDMPhoneNumberChange = (phoneNumber) => {
    setNewDecisionMaker((prev) => ({
      ...prev,
      phone: phoneNumber,
    }));
  };

  const handleDMWhatsappCountryChange = (countryCode) => {
    setNewDecisionMaker((prev) => ({
      ...prev,
      whatsapp_code: countryCode,
    }));
  };

  const handleDMWhatsappNumberChange = (whatsappNumber) => {
    setNewDecisionMaker((prev) => ({
      ...prev,
      whatsapp: whatsappNumber,
    }));
  };

  const addDecisionMaker = () => {
    if (!newDecisionMaker.name || !newDecisionMaker.designation) {
      alert("Please fill in Name and Designation");
      return;
    }
    setDecisionMakers((prev) => [...prev, { ...newDecisionMaker, id: Date.now() }]);
    setNewDecisionMaker({
      name: "",
      designation: "",
      email: "",
      phone: "",
      whatsapp: "",
    });
  };

  const removeDecisionMaker = (id) => {
    setDecisionMakers((prev) => prev.filter((dm) => dm.id !== id));
  };

  const saveContact = async () => {
    try {
      const payload = {
        address: contact.address || null,
        factory_address: contact.factory_address || null,
        email: contact.email || null,
        phone: contact.phone || null,
        phone_code: contact.phone_code || null,
        whatsapp: contact.whatsapp || null,
        whatsapp_code: contact.whatsapp_code || null,
        website: contact.website || null,
        latitude: contact.latitude || null,
        longitude: contact.longitude || null,
      };

      const result = await apiRequest(
        `my/company/${slug}/contact/store-or-update`,
        {
          method: "POST",
          body: payload,
        },
        null,
        session?.accessToken
      );

      if (result?.status || result?.data) {
        alert("Contact information saved successfully!");
      }
    } catch (error) {
      console.error("Failed to save contact", error);
      alert("Failed to save contact: " + (error?.data?.message || error?.message));
    }
  };

  const saveDecisionMakers = async () => {
    try {
      const payload = {
        decision_makers: decisionMakers.map((dm) => ({
          name: dm.name,
          designation: dm.designation,
          email: dm.email || null,
          phone: dm.phone || null,
          phone_code: dm.phone_code || null,
          whatsapp: dm.whatsapp || null,
          whatsapp_code: dm.whatsapp_code || null,
        })),
      };

      const result = await apiRequest(
        `my/company/${slug}/decision-makers`,
        {
          method: "POST",
          body: payload,
        },
        null,
        session?.accessToken
      );

      if (result?.status || result?.data) {
        alert("Decision makers saved successfully!");
      }
    } catch (error) {
      console.error("Failed to save decision makers", error);
      alert("Failed to save decision makers: " + (error?.data?.message || error?.message));
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

  const addMarketShare = () => {
    setMarketShare((prev) => [...prev, { country: "", percentage: "" }]);
  };

  const removeMarketShare = (index) => {
    setMarketShare((prev) => prev.filter((_, i) => i !== index));
  };

  const updateMarketShare = (index, field, value) => {
    setMarketShare((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const addYearlyTurnover = () => {
    setYearlyTurnover((prev) => [...prev, { year: "", turnover: "" }]);
  };

  const removeYearlyTurnover = (index) => {
    setYearlyTurnover((prev) => prev.filter((_, i) => i !== index));
  };

  const updateYearlyTurnover = (index, field, value) => {
    setYearlyTurnover((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleSubmitOverview = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Market share array
      const marketShareData = marketShare
        .filter((item) => item.country && item.percentage)
        .map((item) => ({
          location_id: item.country,
          percentage: parseInt(item.percentage) || 0,
        }));

      // Yearly turnover array
      const yearlyTurnoverData = yearlyTurnover
        .filter((item) => item.year && item.turnover)
        .map((item) => ({
          year: item.year,
          turnover: parseInt(item.turnover) || 0,
        }));

      const payload = {
        is_manufacturer: overview.is_manufacturer === "yes" ? true : false,
        moq: overview.moq || null,
        lead_time: overview.lead_time || null,
        lead_time_unit: overview.lead_time ? "days" : null,
        shipment_term: overview.delivery_terms || null,
        payment_policy: overview.payment_policy || null,
        total_units: null,
        production_capacity: overview.capacity || null,
        production_capacity_unit: overview.capacity ? "units" : null,
        market_share: marketShareData.length > 0 ? marketShareData : null,
        yearly_turnover: yearlyTurnoverData.length > 0 ? yearlyTurnoverData : null,
      };

      const result = await apiRequest(
        `my/company/${slug}/overview/store-or-update`,
        {
          method: "POST",
          body: payload,
        },
        null,
        session?.accessToken
      );

      if (result?.status || result?.data) {
        alert("Overview updated successfully!");
      }
    } catch (error) {
      console.error("Failed to save overview", error);
      alert("Failed to save overview: " + (error?.data?.message || error?.message));
    } finally {
      setSubmitting(false);
    }
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
                      className="bg-gray-100 border border-gray-200 px-3 py-2 text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-gray-700 font-medium">{category.name || category}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedCategories((prev) => prev.filter((_, i) => i !== index))
                        }
                        className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-300 transition-colors text-lg"
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
                      className="bg-gray-100 border border-gray-200 px-3 py-2 text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-gray-700 font-medium">{type.name || type}</span>
                      <button
                        type="button"
                        onClick={() => setSelectedTypes((prev) => prev.filter((_, i) => i !== index))}
                        className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-300 transition-colors text-lg"
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
                    {/* Left Arrow - Only show if more products than items per slide */}
                    {products.length > itemsPerSlide && (
                      <button
                        onClick={() => setCurrentProductIndex(Math.max(0, currentProductIndex - 1))}
                        disabled={currentProductIndex === 0}
                        className="flex-shrink-0 bg-white border border-gray-300 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed rounded-full p-2 transition-colors"
                      >
                        <ChevronLeft size={24} className="text-gray-600" />
                      </button>
                    )}
                    {products.length <= itemsPerSlide && <div className="w-12" />}

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
                            width: `${Math.ceil(products.length / itemsPerSlide) * 100}%`,
                            transform: `translateX(-${currentProductIndex * (100 / Math.ceil(products.length / itemsPerSlide))}%)`,
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
                                  flex: `0 0 ${100 / Math.ceil(products.length / itemsPerSlide) / itemsPerSlide}%`
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

                    {/* Right Arrow - Only show if more products than items per slide */}
                    {products.length > itemsPerSlide && (
                      <button
                        onClick={() => setCurrentProductIndex(Math.min(products.length - itemsPerSlide, currentProductIndex + 1))}
                        disabled={currentProductIndex >= products.length - itemsPerSlide}
                        className="flex-shrink-0 bg-white border border-gray-300 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed rounded-full p-2 transition-colors"
                      >
                        <ChevronRight size={24} className="text-gray-600" />
                      </button>
                    )}
                    {products.length <= itemsPerSlide && <div className="w-12" />}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Section with Tabs */}
            <div className="bg-white rounded-lg">
              <div className="border-b border-gray-300 px-8">
                <div className="flex gap-12">
                  {["profile", "clients", "certificates", "contacts", "faq"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`bg-transparent border-none p-0 pb-4 text-base cursor-pointer transition-all relative ${
                        activeTab === tab
                          ? "font-bold text-gray-900"
                          : "font-normal text-gray-600 hover:text-gray-800"
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      {activeTab === tab && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-600"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <div className="px-8 py-8">

                {/* Profile Tab Content */}
                {activeTab === "profile" && (
                  <form onSubmit={handleSubmitOverview} className="space-y-8">
                  {/* Overview Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-brand-600 mb-6">Overview</h3>

                    {/* Are You Manufacturer? with Yes/No buttons */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-900 mb-3">
                        Are You Manufacturer?
                      </label>
                      <div className="flex gap-4">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="is_manufacturer"
                            value="yes"
                            checked={overview.is_manufacturer === "yes"}
                            onChange={handleOverviewChange}
                            className="w-4 h-4"
                          />
                          <span className="ml-2 text-sm text-gray-700">Yes</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="is_manufacturer"
                            value="no"
                            checked={overview.is_manufacturer === "no"}
                            onChange={handleOverviewChange}
                            className="w-4 h-4"
                          />
                          <span className="ml-2 text-sm text-gray-700">No</span>
                        </label>
                      </div>
                    </div>

                    {/* Two Column Grid */}
                    <div className="grid grid-cols-2 gap-8 mb-6">

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">
                          Capacity
                        </label>
                        <input
                          type="text"
                          name="capacity"
                          value={overview.capacity || ""}
                          onChange={handleOverviewChange}
                          placeholder="Enter capacity"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">
                          No of Machines
                        </label>
                        <input
                          type="text"
                          placeholder="Enter number"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-brand-600 mb-2 uppercase tracking-wide">
                          Minimum Order Quantity (MOQ)
                        </label>
                        <input
                          type="text"
                          name="moq"
                          value={overview.moq || ""}
                          onChange={handleOverviewChange}
                          placeholder="500"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-brand-600 mb-2 uppercase tracking-wide">
                          Lead Time
                        </label>
                        <input
                          type="text"
                          name="lead_time"
                          value={overview.lead_time || ""}
                          onChange={handleOverviewChange}
                          placeholder="45"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">
                          Payment Policy
                        </label>
                        <input
                          type="text"
                          name="payment_policy"
                          value={overview.payment_policy || ""}
                          onChange={handleOverviewChange}
                          placeholder="Bank Transfer, T.T"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">
                          Delivery Terms
                        </label>
                        <input
                          type="text"
                          name="delivery_terms"
                          value={overview.delivery_terms || ""}
                          onChange={handleOverviewChange}
                          placeholder="FOB"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600 text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Business Insight Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-brand-600 mb-6">Business Insight</h3>

                    {/* Market Share */}
                    <div className="mb-8">
                      <h4 className="text-sm font-medium text-gray-900 mb-4">Market Share</h4>
                      {marketShare.map((item, index) => (
                        <div key={index} className="grid grid-cols-2 gap-4 mb-4">
                          <select
                            value={item.country}
                            onChange={(e) => updateMarketShare(index, "country", e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600 text-sm"
                          >
                            <option value="">Select Country *</option>
                            {filterOptions.locations.map((location) => (
                              <option key={location.id} value={location.id}>
                                {location.name}
                              </option>
                            ))}
                          </select>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={item.percentage}
                              onChange={(e) => updateMarketShare(index, "percentage", e.target.value)}
                              placeholder="Enter market share"
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600 text-sm"
                            />
                            <button
                              type="button"
                              onClick={() => removeMarketShare(index)}
                              className="bg-brand-600 hover:bg-brand-700 text-white p-2 rounded-lg transition-colors flex items-center justify-center"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addMarketShare}
                        className="w-full border border-gray-300 rounded-lg py-3 px-4 text-gray-700 font-medium text-sm bg-transparent hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 mb-6"
                      >
                        <Plus size={20} />
                        Add new Country
                      </button>
                      <div className="h-64 bg-gray-100 rounded-lg p-6 flex flex-col">
                        {marketShare.filter((item) => item.country && item.percentage).length > 0 ? (
                          <div className="w-full h-full flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                              <div className="text-sm font-medium text-gray-700">Market Share</div>
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-brand-600 rounded-sm"></div>
                                <span className="text-xs text-gray-600">Market Share</span>
                              </div>
                            </div>
                            {(() => {
                              const validItems = marketShare.filter((item) => item.country && item.percentage);
                              const maxValue = Math.max(...validItems.map((item) => parseInt(item.percentage) || 0), 60);
                              const scale = 200 / maxValue;
                              const step = Math.ceil(maxValue / 4);
                              const ySteps = Array.from({ length: 5 }, (_, i) => i * step);

                              return (
                                <div className="flex-1 flex gap-4">
                                  {/* Y-Axis */}
                                  <div className="flex flex-col-reverse justify-between text-xs text-gray-600 pr-2 min-w-fit">
                                    {ySteps.map((val) => (
                                      <div key={val}>{val}</div>
                                    ))}
                                  </div>
                                  {/* Chart Area */}
                                  <div className="flex-1 flex items-end justify-between gap-3 border-l border-b border-gray-400">
                                    {validItems.map((item, idx) => {
                                      const locationName = filterOptions.locations.find(
                                        (loc) => loc.id == item.country
                                      )?.name || "Unknown";
                                      const percentage = parseInt(item.percentage) || 0;
                                      const barHeight = percentage * scale;

                                      return (
                                        <div key={idx} className="flex flex-col items-center gap-2 flex-1 h-full">
                                          <div className="w-full h-full flex items-end justify-center">
                                            <div
                                              className="w-3/4 bg-brand-600"
                                              style={{ height: `${barHeight}px`, minHeight: '2px' }}
                                            ></div>
                                          </div>
                                          <div className="text-xs text-gray-700 font-medium text-center whitespace-nowrap">{locationName}</div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        ) : (
                          <span className="text-gray-500 flex items-center justify-center h-full">Add market share data to see chart</span>
                        )}
                      </div>
                    </div>

                    {/* Yearly Turnover */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-4">Yearly Turnover</h4>
                      {yearlyTurnover.map((item, index) => {
                        const currentYear = new Date().getFullYear();
                        const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i);
                        return (
                          <div key={index} className="grid grid-cols-2 gap-4 mb-4">
                            <select
                              value={item.year}
                              onChange={(e) => updateYearlyTurnover(index, "year", e.target.value)}
                              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600 text-sm"
                            >
                              <option value="">Select Year *</option>
                              {years.map((year) => (
                                <option key={year} value={year}>
                                  {year}
                                </option>
                              ))}
                            </select>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={item.turnover}
                              onChange={(e) => updateYearlyTurnover(index, "turnover", e.target.value)}
                              placeholder="Enter turnover"
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600 text-sm"
                            />
                            <button
                              type="button"
                              onClick={() => removeYearlyTurnover(index)}
                              className="bg-brand-600 hover:bg-brand-700 text-white p-2 rounded-lg transition-colors flex items-center justify-center"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                        );
                      })}
                      <button
                        type="button"
                        onClick={addYearlyTurnover}
                        className="w-full border border-gray-300 rounded-lg py-3 px-4 text-gray-700 font-medium text-sm bg-transparent hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 mb-6"
                      >
                        <Plus size={20} />
                        Add new Turnover
                      </button>
                      <div className="h-64 bg-gray-100 rounded-lg p-6 flex flex-col">
                        {yearlyTurnover.filter((item) => item.year && item.turnover).length > 0 ? (
                          <div className="w-full h-full flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                              <div className="text-sm font-medium text-gray-700">Yearly Turnover (Million USD)</div>
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-brand-600 rounded-sm"></div>
                                <span className="text-xs text-gray-600">Turnover</span>
                              </div>
                            </div>
                            {(() => {
                              const validItems = yearlyTurnover.filter((item) => item.year && item.turnover);
                              const maxValue = Math.max(...validItems.map((item) => parseInt(item.turnover) || 0), 60);
                              const scale = 200 / maxValue;
                              const step = Math.ceil(maxValue / 4);
                              const ySteps = Array.from({ length: 5 }, (_, i) => i * step);

                              return (
                                <div className="flex-1 flex gap-4">
                                  {/* Y-Axis */}
                                  <div className="flex flex-col-reverse justify-between text-xs text-gray-600 pr-2 min-w-fit">
                                    {ySteps.map((val) => (
                                      <div key={val}>{val}</div>
                                    ))}
                                  </div>
                                  {/* Chart Area */}
                                  <div className="flex-1 flex items-end justify-between gap-3 border-l border-b border-gray-400">
                                    {validItems.map((item, idx) => {
                                      const turnover = parseInt(item.turnover) || 0;
                                      const barHeight = turnover * scale;

                                      return (
                                        <div key={idx} className="flex flex-col items-center gap-2 flex-1 h-full">
                                          <div className="w-full h-full flex items-end justify-center">
                                            <div
                                              className="w-3/4 bg-brand-600"
                                              style={{ height: `${barHeight}px`, minHeight: '2px' }}
                                            ></div>
                                          </div>
                                          <div className="text-xs text-gray-700 font-medium text-center">{item.year}</div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        ) : (
                          <span className="text-gray-500 flex items-center justify-center h-full">Add yearly turnover data to see chart</span>
                        )}
                      </div>
                    </div>
                  </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {submitting ? "Submitting..." : "Submit"}
                    </button>
                  </form>
                )}

                {/* Clients Tab */}
                {activeTab === "clients" && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-6">Clients</h2>

                      {/* Client Logo Upload */}
                      <div className="mb-8">
                        <label className="block text-sm font-medium text-gray-700 mb-3">Client logo</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => document.getElementById('clientFileInput').click()}
                        >
                          <div className="flex flex-col items-center justify-center">
                            <div className="w-12 h-12 bg-brand-600 rounded-full flex items-center justify-center mb-3">
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            </div>
                            <p className="text-brand-600 font-medium">Drag or click to upload files</p>
                          </div>
                          <input
                            id="clientFileInput"
                            type="file"
                            accept="image/*"
                            onChange={handleClientFileChange}
                            className="hidden"
                          />
                        </div>

                        {/* Preview */}
                        {clientImagePreview && (
                          <div className="mt-4 flex justify-center">
                            <img src={clientImagePreview} alt="Preview" className="h-20 w-20 object-contain" />
                          </div>
                        )}
                      </div>

                      {/* Done Button */}
                      <button
                        onClick={uploadClient}
                        disabled={uploadingClient || !clientFile}
                        className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {uploadingClient ? "Uploading..." : "Done"}
                      </button>
                    </div>

                    {/* Existing Clients */}
                    {clients.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">Existing Clients</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
                          {clients.map((client) => (
                            <div key={client.id} className="relative group">
                              <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center h-24">
                                {client.image_url ? (
                                  <img
                                    src={client.image_url}
                                    alt="Client"
                                    className="h-full w-full object-contain"
                                  />
                                ) : (
                                  <span className="text-gray-400 text-xs">No image</span>
                                )}
                              </div>
                              <button
                                onClick={() => deleteClient(client.id)}
                                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Certificates Tab */}
                {activeTab === "certificates" && (
                  <div className="space-y-8">
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Certificates
                      </label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {certificates.map((certificate, index) => (
                          <div
                            key={index}
                            className="bg-gray-100 border border-gray-200 px-3 py-2 text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors"
                          >
                            <span className="text-gray-700 font-medium">{certificate.name || certificate}</span>
                            <button
                              type="button"
                              onClick={() =>
                                setCertificates((prev) => prev.filter((_, i) => i !== index))
                              }
                              className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-300 transition-colors text-lg"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            const selected = availableCertificates.find(
                              (cert) => cert.id === parseInt(e.target.value)
                            );
                            if (selected && !certificates.some((c) => c.id === selected.id)) {
                              setCertificates((prev) => [...prev, selected]);
                            }
                            e.target.value = "";
                          }
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600"
                      >
                        <option value="">Add new...</option>
                        {availableCertificates
                          .filter((cert) => !certificates.some((c) => c.id === cert.id))
                          .map((certificate) => (
                            <option key={certificate.id} value={certificate.id}>
                              {certificate.name}
                            </option>
                          ))}
                      </select>
                    </div>

                    {/* Save Button */}
                    <button
                      onClick={saveCertificates}
                      className="bg-brand-600 hover:bg-brand-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                    >
                      Done
                    </button>
                  </div>
                )}

                {/* Contacts Tab */}
                {activeTab === "contacts" && (
                  <div className="space-y-8">
                    {/* Contact Section */}
                    <div>
                      <h3 className="text-lg font-semibold text-brand-600 mb-6">Contact</h3>

                      <div className="space-y-6">
                        {/* Business Section Header */}
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-900">Business</h4>
                        </div>

                        {/* Address (Office) */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Address (Office) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="address"
                            value={contact.address}
                            onChange={handleContactChange}
                            placeholder="Enter office address"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600"
                          />
                        </div>

                        {/* Address (Factory) */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Address (Factory)
                          </label>
                          <input
                            type="text"
                            name="factory_address"
                            value={contact.factory_address}
                            onChange={handleContactChange}
                            placeholder="Enter factory address"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600"
                          />
                        </div>

                        {/* Email */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={contact.email}
                            onChange={handleContactChange}
                            placeholder="example@email.com"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600"
                          />
                        </div>

                        {/* Phone with Country Code */}
                        <PhoneCountryInput
                          label="Phone"
                          required={true}
                          countryCode={contact.phone_code}
                          phoneNumber={contact.phone}
                          onCountryChange={handlePhoneCountryChange}
                          onPhoneChange={handlePhoneNumberChange}
                          locations={filterOptions.locations}
                          placeholder="Enter phone number"
                        />

                        {/* WhatsApp with Country Code */}
                        <PhoneCountryInput
                          label="WhatsApp"
                          countryCode={contact.whatsapp_code}
                          phoneNumber={contact.whatsapp}
                          onCountryChange={handleWhatsappCountryChange}
                          onPhoneChange={handleWhatsappNumberChange}
                          locations={filterOptions.locations}
                          placeholder="Enter WhatsApp number"
                        />

                        {/* Website */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Website
                          </label>
                          <input
                            type="url"
                            name="website"
                            value={contact.website}
                            onChange={handleContactChange}
                            placeholder="https://example.com"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600"
                          />
                        </div>

                        {/* Location Latitude and Longitude - 2 columns */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Location Latitude
                            </label>
                            <input
                              type="text"
                              name="latitude"
                              value={contact.latitude}
                              onChange={handleContactChange}
                              placeholder="40.7128"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Location Longitude
                            </label>
                            <input
                              type="text"
                              name="longitude"
                              value={contact.longitude}
                              onChange={handleContactChange}
                              placeholder="-74.0060"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600"
                            />
                          </div>
                        </div>

                        {/* Map Placeholder */}
                        <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center border border-gray-300">
                          <span className="text-gray-500">Map preview (coordinates: {contact.latitude || "N/A"}, {contact.longitude || "N/A"})</span>
                        </div>

                        {/* Save Button */}
                        <button
                          onClick={saveContact}
                          className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-lg transition-colors"
                        >
                          Submit
                        </button>
                      </div>
                    </div>

                    {/* Decision Maker Section */}
                    <div className="border-t pt-8">
                      <h3 className="text-lg font-semibold text-brand-600 mb-6">Decision Maker</h3>

                      <div className="space-y-6">
                        {/* Form for New Decision Maker */}
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              name="name"
                              value={newDecisionMaker.name}
                              onChange={handleDecisionMakerChange}
                              placeholder="Enter Name"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Designation <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              name="designation"
                              value={newDecisionMaker.designation}
                              onChange={handleDecisionMakerChange}
                              placeholder="Enter Designation"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Email <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="email"
                              name="email"
                              value={newDecisionMaker.email}
                              onChange={handleDecisionMakerChange}
                              placeholder="Enter Email"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600"
                            />
                          </div>

                          {/* Phone with Country Code */}
                          <PhoneCountryInput
                            label="Phone"
                            countryCode={newDecisionMaker.phone_code}
                            phoneNumber={newDecisionMaker.phone}
                            onCountryChange={handleDMPhoneCountryChange}
                            onPhoneChange={handleDMPhoneNumberChange}
                            locations={filterOptions.locations}
                            placeholder="Enter phone number"
                          />

                          {/* WhatsApp with Country Code */}
                          <PhoneCountryInput
                            label="WhatsApp"
                            countryCode={newDecisionMaker.whatsapp_code}
                            phoneNumber={newDecisionMaker.whatsapp}
                            onCountryChange={handleDMWhatsappCountryChange}
                            onPhoneChange={handleDMWhatsappNumberChange}
                            locations={filterOptions.locations}
                            placeholder="Enter WhatsApp number"
                          />

                          <button
                            type="button"
                            onClick={addDecisionMaker}
                            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-2 rounded-lg transition-colors"
                          >
                            Done
                          </button>
                        </div>

                        {/* Decision Makers List */}
                        {decisionMakers.length > 0 && (
                          <div className="border-t pt-6">
                            <h4 className="text-sm font-medium text-gray-900 mb-4">Added Decision Makers</h4>
                            <div className="space-y-4">
                              {decisionMakers.map((dm) => {
                                const phoneDisplay = dm.phone_code && dm.phone ? `${dm.phone_code} ${dm.phone}` : dm.phone;
                                const whatsappDisplay = dm.whatsapp_code && dm.whatsapp ? `${dm.whatsapp_code} ${dm.whatsapp}` : dm.whatsapp;
                                return (
                                  <div key={dm.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                    <div className="flex justify-between items-start mb-3">
                                      <div>
                                        <h5 className="font-semibold text-gray-900">{dm.name}</h5>
                                        <p className="text-xs text-brand-600 mb-2">{dm.designation}</p>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => removeDecisionMaker(dm.id)}
                                        className="text-red-500 hover:text-red-700 font-medium text-sm"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                    {dm.email && <p className="text-xs text-gray-600">{dm.email}</p>}
                                    {dm.phone && <p className="text-xs text-gray-600">{phoneDisplay}</p>}
                                    {dm.whatsapp && <p className="text-xs text-gray-600">WhatsApp: {whatsappDisplay}</p>}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Save All Button */}
                        {decisionMakers.length > 0 && (
                          <button
                            onClick={saveDecisionMakers}
                            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-lg transition-colors"
                          >
                            Save Decision Makers
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* FAQ Tab - placeholder */}
                {activeTab === "faq" && (
                  <div className="text-center py-8 text-gray-600">
                    FAQ section coming soon...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

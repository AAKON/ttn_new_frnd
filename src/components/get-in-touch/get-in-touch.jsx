"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Container, Section } from "@/components/shared";
import { useToast } from "@/hooks/use-toast";
import { submitContactForm } from "@/services/contact/submitForm";
import PhoneCountryInput from "@/components/PhoneCountryInput";

const GetInTouch = ({ locations = [] }) => {
  const [formData, setFormData] = useState({
    company_name: "",
    name: "",
    designation: "",
    email: "",
    phone_country_code: "US",
    phone: "",
    message: "",
    privacy_accepted: false,
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleChange = (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handlePhoneCountryChange = (countryCode) => {
    setFormData({ ...formData, phone_country_code: countryCode });
  };

  const handlePhoneChange = (phoneNumber) => {
    setFormData({ ...formData, phone: phoneNumber });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.privacy_accepted) {
      toast({
        title: "Privacy Policy Required",
        description: "Please accept the privacy policy to continue.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      // Combine phone country code and phone number
      const phoneWithCode = formData.phone
        ? `${formData.phone_country_code ? locations.find(l => l.country_code === formData.phone_country_code)?.phone_code || "" : ""} ${formData.phone}`.trim()
        : "";
      
      const submitData = {
        name: formData.name,
        organization: formData.company_name,
        email: formData.email,
        phone: phoneWithCode,
        message: formData.message,
      };

      const result = await submitContactForm(submitData, toast);
      if (result?.status) {
        setFormData({
          company_name: "",
          name: "",
          designation: "",
          email: "",
          phone_country_code: "US",
          phone: "",
          message: "",
          privacy_accepted: false,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Section className="bg-gray-50 py-12 sm:py-16 lg:py-20">
      <Container>
        <div className="relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-start lg:items-center">
            {/* Left Side - Text Content */}
            <div className="relative pb-8 sm:pb-12 lg:pb-0">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-normal text-gray-900 mb-3 sm:mb-4 leading-tight px-4 sm:px-0">
                We empowering business networking that can help develop business growth.
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 leading-relaxed px-4 sm:px-0">
                Leading apparel and textile industry-based business promotion and networking platform.
              </p>
            </div>

          {/* Right Side - Contact Form Card */}
          <div className="bg-white p-6 sm:p-8 lg:p-10 rounded-xl sm:rounded-2xl border border-gray-200 shadow-lg">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 text-center">
              Get in touch
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Company Name - Full Width */}
              <div>
                <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="company_name"
                  name="company_name"
                  type="text"
                  value={formData.company_name}
                  onChange={handleChange}
                  placeholder="Enter your company name"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(247,147,30)] focus:border-transparent outline-none transition"
                />
              </div>

              {/* Your Name and Designation - Side by Side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(247,147,30)] focus:border-transparent outline-none transition"
                  />
                </div>
                <div>
                  <label htmlFor="designation" className="block text-sm font-medium text-gray-700 mb-2">
                    Designation
                  </label>
                  <input
                    id="designation"
                    name="designation"
                    type="text"
                    value={formData.designation}
                    onChange={handleChange}
                    placeholder="Enter your designation"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(247,147,30)] focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              {/* Email and Phone - Side by Side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(247,147,30)] focus:border-transparent outline-none transition"
                  />
                </div>
                <div>
                  <PhoneCountryInput
                    countryCode={formData.phone_country_code}
                    phoneNumber={formData.phone}
                    onCountryChange={handlePhoneCountryChange}
                    onPhoneChange={handlePhoneChange}
                    locations={locations}
                    label="Phone Number"
                    placeholder="Enter phone number"
                    showLabel={true}
                  />
                </div>
              </div>

              {/* Message - Full Width */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows="4"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Enter your message..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(247,147,30)] focus:border-transparent outline-none resize-y transition"
                ></textarea>
              </div>

              {/* Privacy Policy Checkbox */}
              <div className="flex items-start gap-2">
                <input
                  id="privacy_accepted"
                  name="privacy_accepted"
                  type="checkbox"
                  checked={formData.privacy_accepted}
                  onChange={handleChange}
                  className="mt-1 h-4 w-4 text-[rgb(247,147,30)] border-gray-300 rounded focus:ring-[rgb(247,147,30)]"
                />
                <label htmlFor="privacy_accepted" className="text-sm text-gray-600">
                  You agree to our friendly{" "}
                  <Link href="/privacy-policy" className="text-blue-600 hover:underline">
                    privacy policy
                  </Link>
                  .
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !formData.privacy_accepted}
                className="w-full px-6 py-3.5 bg-[rgb(247,147,30)] text-white rounded-xl font-semibold hover:bg-[rgb(230,130,20)] transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                {loading ? "Sending..." : "Send message"}
              </button>
            </form>
          </div>
          </div>
          
          {/* Spiral Arrow - positioned to curve from left text towards form (desktop only) */}
          <div className="hidden lg:block absolute left-[174px] z-10" style={{ top: "calc(100% - 280px)", right: "1rem" }}>
            <Image
              src="/spiral-arrow.png"
              alt="Decorative spiral arrow"
              width={400}
              height={150}
              className="opacity-90"
              style={{ width: "100%", maxWidth: "450px", height: "auto", objectFit: "contain", objectPosition: "left center" }}
            />
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default GetInTouch;

"use client";

import { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";

export default function PhoneCountryInput({
  countryCode,
  phoneNumber,
  onCountryChange,
  onPhoneChange,
  locations = [],
  label = "Phone",
  placeholder = "Enter phone number",
  required = false,
  showLabel = true,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Get phone code (dialing code) from country code
  const getPhoneCode = (code) => {
    const location = locations.find((loc) => loc.country_code === code);
    return location?.phone_code || "";
  };

  // Get country name from country code
  const getCountryName = (code) => {
    const location = locations.find((loc) => loc.country_code === code);
    return location?.name || code;
  };

  // Get flag URL from location object
  const getFlagUrl = (code) => {
    const location = locations.find((loc) => loc.country_code === code);
    return location?.flag_path || null;
  };

  // Filter countries based on search term
  const filteredLocations = locations.filter((loc) =>
    loc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loc.country_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loc.phone_code?.includes(searchTerm)
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  const currentPhoneCode = getPhoneCode(countryCode);
  const currentCountryName = getCountryName(countryCode);

  return (
    <div>
      {showLabel && (
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Main Container */}
      <div className="relative w-full" ref={dropdownRef}>
        {/* Input Container */}
        <div className="flex gap-2 items-center mb-2">
          {/* Country Code Selector Button */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="px-3 py-2 border border-gray-300 rounded flex items-center gap-2 bg-white hover:bg-gray-100 transition-colors min-w-fit"
          >
            {/* Flag */}
            {countryCode && (
              <img
                src={getFlagUrl(countryCode)}
                alt={countryCode}
                className="w-5 h-4 object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            )}
            {/* Divider */}
            <div className="w-px h-5 bg-gray-300"></div>
            {/* Phone Code */}
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
              {currentPhoneCode}
            </span>
          </button>

          {/* Phone Number Input */}
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => onPhoneChange(e.target.value)}
            placeholder={placeholder}
            className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-400"
          />
        </div>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-50 max-w-sm">
            {/* Search Input */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-2">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded text-sm focus:outline-none"
                />
              </div>
            </div>

            {/* Country List */}
            <div className="overflow-y-auto max-h-64">
              {filteredLocations.length > 0 ? (
                filteredLocations.map((location) => (
                  <button
                    key={location.country_code}
                    type="button"
                    onClick={() => {
                      onCountryChange(location.country_code);
                      setIsOpen(false);
                      setSearchTerm("");
                    }}
                    className="w-full px-3 py-2 text-left text-sm flex items-center gap-3 bg-white hover:bg-gray-100 transition-colors border-b border-gray-100 last:border-b-0"
                  >
                    {/* Flag */}
                    <img
                      src={getFlagUrl(location.country_code)}
                      alt={location.country_code}
                      className="w-5 h-4 object-cover flex-shrink-0"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />

                    {/* Country Name */}
                    <span className="text-gray-700">
                      {location.name}
                    </span>

                    {/* Phone Code */}
                    <span className="text-gray-600 ml-auto whitespace-nowrap">
                      {location.phone_code}
                    </span>
                  </button>
                ))
              ) : (
                <div className="px-3 py-6 text-center text-sm text-gray-500">
                  No countries found
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Full phone number display */}
      {phoneNumber && currentPhoneCode && (
        <p className="text-xs text-gray-500 mt-2">
          {currentPhoneCode} {phoneNumber}
        </p>
      )}
    </div>
  );
}

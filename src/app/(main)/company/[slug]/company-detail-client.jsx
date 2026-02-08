"use client";

import { useState } from "react";
import Link from "next/link";

function TabContent({ company, activeTab }) {
  const overview = company.overview || {};
  const faqs = company.faqs || [];
  const clients = company.clients || [];
  const contact = company.contact || {};
  const decisionMakers = company.decision_makers || company.decisionMakers || [];
  const products = company.products || [];

  return (
    <div className="mt-8">
      {/* Overview Tab */}
      {activeTab === "overview" && (
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-3">Overview</h2>
          {overview.description ? (
            <div
              className="paragraph text-gray-600"
              dangerouslySetInnerHTML={{ __html: overview.description }}
            />
          ) : company.moto ? (
            <p className="text-gray-600">{company.moto}</p>
          ) : (
            <p className="text-gray-400">No overview available.</p>
          )}

          {overview.year_established && (
            <div className="mt-4">
              <span className="text-sm font-semibold text-gray-700">Year Established: </span>
              <span className="text-sm text-gray-600">{overview.year_established}</span>
            </div>
          )}
          {overview.total_employees && (
            <div className="mt-2">
              <span className="text-sm font-semibold text-gray-700">Total Employees: </span>
              <span className="text-sm text-gray-600">{overview.total_employees}</span>
            </div>
          )}
          {overview.annual_revenue && (
            <div className="mt-2">
              <span className="text-sm font-semibold text-gray-700">Annual Revenue: </span>
              <span className="text-sm text-gray-600">{overview.annual_revenue}</span>
            </div>
          )}
        </section>
      )}

      {/* Products Tab */}
      {activeTab === "products" && products.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-3">Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <div key={product.id} className="border rounded-lg p-4">
                {product.image && (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-40 object-cover rounded mb-3"
                  />
                )}
                <h3 className="font-semibold text-gray-900">{product.name}</h3>
                {product.description && (
                  <p className="text-sm text-gray-500 mt-1">{product.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FAQ Tab */}
      {activeTab === "faq" && faqs.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-3">FAQ</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-900">{faq.question}</h3>
                <p className="text-sm text-gray-600 mt-2">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Clients Tab */}
      {activeTab === "clients" && clients.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-3">Clients</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {clients.map((client) => (
              <div key={client.id} className="border rounded-lg p-4 text-center">
                {client.logo && (
                  <img
                    src={client.logo}
                    alt={client.name}
                    className="w-20 h-20 object-contain mx-auto mb-2"
                  />
                )}
                <p className="text-sm font-medium text-gray-700">{client.name}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Contact Tab */}
      {activeTab === "contact" && (
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-3">Contact</h2>
          {contact.email || contact.phone || contact.address || company.email || company.phone ? (
            <div className="space-y-3">
              {(contact.email || company.email) && (
                <div>
                  <span className="text-sm font-semibold text-gray-700">Email: </span>
                  <span className="text-sm text-gray-600">{contact.email || company.email}</span>
                </div>
              )}
              {(contact.phone || company.phone) && (
                <div>
                  <span className="text-sm font-semibold text-gray-700">Phone: </span>
                  <span className="text-sm text-gray-600">{contact.phone || company.phone}</span>
                </div>
              )}
              {(contact.address || company.address) && (
                <div>
                  <span className="text-sm font-semibold text-gray-700">Address: </span>
                  <span className="text-sm text-gray-600">{contact.address || company.address}</span>
                </div>
              )}
              {contact.website && (
                <div>
                  <span className="text-sm font-semibold text-gray-700">Website: </span>
                  <a
                    href={contact.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-brand-600 hover:underline"
                  >
                    {contact.website}
                  </a>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-400">No contact information available.</p>
          )}
        </section>
      )}

      {/* Decision Makers Tab */}
      {activeTab === "decision-makers" && decisionMakers.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-3">
            Decision Makers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {decisionMakers.map((dm) => (
              <div key={dm.id} className="border rounded-lg p-4 flex items-center gap-4">
                {dm.image && (
                  <img
                    src={dm.image}
                    alt={dm.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                )}
                <div>
                  <h3 className="font-semibold text-gray-900">{dm.name}</h3>
                  {dm.designation && (
                    <p className="text-sm text-gray-500">{dm.designation}</p>
                  )}
                  {dm.email && (
                    <p className="text-xs text-gray-400 mt-1">{dm.email}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default function CompanyDetailClient({ company }) {
  const [activeTab, setActiveTab] = useState("overview");

  const navItems = [
    { id: "overview", label: "Overview" },
    { id: "products", label: "Products" },
    { id: "faq", label: "FAQ" },
    { id: "clients", label: "Clients" },
    { id: "contact", label: "Contact" },
    { id: "decision-makers", label: "Decision Makers" },
  ];

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Link
          href="/company"
          className="text-sm text-brand-600 hover:underline inline-flex items-center gap-1"
        >
          &larr; Back to Companies
        </Link>
      </div>

      {/* Company Header */}
      <div className="border rounded-lg p-6 mb-6 bg-detailBennar">
        <div className="flex flex-col md:flex-row items-start gap-6">
          {company.logo && (
            <img
              src={company.logo}
              alt={company.name}
              className="w-24 h-24 rounded-lg object-contain border bg-white p-2"
            />
          )}
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
              {company.name}
            </h1>
            {company.moto && (
              <p className="text-gray-600 mt-2">{company.moto}</p>
            )}
            <div className="flex flex-wrap gap-3 mt-4">
              {company.location && (
                <span className="text-sm bg-white text-gray-600 px-3 py-1 rounded-full border">
                  {company.location.name || company.location}
                </span>
              )}
              {company.business_type && (
                <span className="text-sm bg-brand-50 text-brand-700 px-3 py-1 rounded-full border border-brand-200">
                  {company.business_type.name || company.business_type}
                </span>
              )}
              {company.established && (
                <span className="text-sm bg-white text-gray-600 px-3 py-1 rounded-full border">
                  Est. {company.established}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex gap-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={activeTab === item.id ? "py-3 px-0 text-sm font-medium bg-transparent border-b-2 text-gray-900 cursor-pointer hover:text-gray-800" : "py-3 px-0 text-sm font-medium bg-transparent border-b-2 border-transparent text-gray-500 cursor-pointer hover:text-gray-700"}
              style={{
                background: "transparent !important",
                color: activeTab === item.id ? "#111827" : "#6b7280",
                borderRadius: "0 !important",
                padding: "12px 0 !important",
                display: "block",
                fontSize: "14px",
                borderBottomColor: activeTab === item.id ? "#FF9800" : "transparent",
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <TabContent company={company} activeTab={activeTab} />
    </div>
  );
}

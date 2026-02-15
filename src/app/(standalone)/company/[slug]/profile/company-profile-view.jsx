"use client";

import { useCallback } from "react";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

function Section({ title, children }) {
  return (
    <section className="mb-12">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-brand-600 mb-5 flex items-center gap-3">
        <span className="w-8 h-0.5 bg-brand-600 rounded-full" aria-hidden />
        {title}
      </h2>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden print:shadow-none print:border print:rounded-lg">
        <div className="p-6 sm:p-8">{children}</div>
      </div>
    </section>
  );
}

function CertImage({ cert }) {
  const imageUrl = cert.image_url || cert.image;
  const fullUrl = imageUrl?.startsWith("/") ? `${apiUrl}${imageUrl}` : imageUrl;
  return (
    <div className="flex flex-col items-center text-center p-4 rounded-xl bg-gray-50/80 border border-gray-100 hover:border-brand-200 transition-colors">
      {fullUrl ? (
        <img src={fullUrl} alt={cert.name || ""} className="w-16 h-16 object-contain mb-3" />
      ) : (
        <div className="w-16 h-16 rounded-full bg-white border border-gray-100 flex items-center justify-center mb-3">
          <span className="text-gray-400 text-xs">—</span>
        </div>
      )}
      <span className="text-sm font-medium text-gray-700">{cert.name}</span>
    </div>
  );
}

export default function CompanyProfileView({ company }) {
  const products = company.products || [];
  const clients = company.clients || [];
  const certificates = company.certificates || [];
  const contact = company.contact || {};
  const decisionMakers = company.decision_makers || [];
  const faqs = company.faqs || [];
  const businessTypes = company.business_types || [];
  const businessCategories = company.business_categories || [];
  const overview = company.overview || {};
  const location = company.location || {};

  const handlePrint = useCallback(() => {
    if (typeof window !== "undefined") window.print();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 print:bg-white" style={{ fontFamily: "system-ui, sans-serif" }}>
      {/* Print / Save as PDF - hidden when printing */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-gray-200/80 py-4 px-6 print:hidden shadow-sm">
        <div className="max-w-4xl mx-auto flex justify-end">
          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors shadow-sm"
          >
            Print / Save as PDF
          </button>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-6 py-10 print:py-8 print:px-4">
        {/* Header: logo + name + meta */}
        <header className="text-center mb-12">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 sm:p-10 print:shadow-none print:rounded-lg">
            <div className="flex flex-col items-center gap-5">
              {company.thumbnail_url && (
                <div className="ring-4 ring-brand-50 rounded-full p-1">
                  <img
                    src={company.thumbnail_url}
                    alt={company.name}
                    className="w-28 h-28 rounded-full object-cover"
                  />
                </div>
              )}
              <div className="w-full max-w-xl">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{company.name}</h1>

                {businessTypes.length > 0 && (
                  <div className="mt-5">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Business type</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {businessTypes.map((t) => (
                        <span key={t.id} className="px-3 py-1.5 bg-brand-50 text-brand-700 rounded-full text-sm font-medium">
                          {t.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {businessCategories.length > 0 && (
                  <div className="mt-5">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Category</p>
                    <p className="text-gray-700 font-medium text-sm leading-relaxed">
                      {businessCategories.map((c) => c.name).join(", ")}
                    </p>
                  </div>
                )}

                <div className="mt-5 pt-5 border-t border-gray-100 flex flex-wrap justify-center gap-x-8 gap-y-4 sm:gap-x-12 text-sm">
                  {location?.name && (
                    <div className="text-center sm:text-left">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Location</p>
                      <p className="text-gray-700 font-medium inline-flex items-center gap-2">
                        {location.flag_path && (
                          <img src={location.flag_path} alt="" className="w-5 h-4 object-cover rounded-sm flex-shrink-0" aria-hidden />
                        )}
                        {location.name}
                      </p>
                    </div>
                  )}
                  {company.manpower && (
                    <div className="text-center sm:text-left">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Company size</p>
                      <p className="text-gray-700 font-medium">{company.manpower}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* About */}
        <Section title="About">
          <p className="text-gray-600 text-[15px] leading-7 whitespace-pre-wrap">
            {company.about || company.description || "No description available."}
          </p>
        </Section>

        {/* Overview */}
        {(overview.moq || overview.lead_time || overview.shipment_term || overview.payment_policy) && (
          <Section title="Overview">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {overview.moq && (
                <div className="rounded-xl bg-gray-50 p-4 border border-gray-100">
                  <div className="text-xs font-medium text-brand-600 uppercase tracking-wider mb-1">MOQ</div>
                  <div className="font-semibold text-gray-900">{overview.moq}</div>
                </div>
              )}
              {overview.lead_time && (
                <div className="rounded-xl bg-gray-50 p-4 border border-gray-100">
                  <div className="text-xs font-medium text-brand-600 uppercase tracking-wider mb-1">Lead Time</div>
                  <div className="font-semibold text-gray-900">
                    {overview.lead_time} {overview.lead_time_unit || "days"}
                  </div>
                </div>
              )}
              {overview.shipment_term && (
                <div className="rounded-xl bg-gray-50 p-4 border border-gray-100">
                  <div className="text-xs font-medium text-brand-600 uppercase tracking-wider mb-1">Delivery Terms</div>
                  <div className="font-semibold text-gray-900">{overview.shipment_term}</div>
                </div>
              )}
              {overview.payment_policy && (
                <div className="rounded-xl bg-gray-50 p-4 border border-gray-100">
                  <div className="text-xs font-medium text-brand-600 uppercase tracking-wider mb-1">Payment Policy</div>
                  <div className="font-semibold text-gray-900">{overview.payment_policy}</div>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* Products - grid, no slider */}
        {products.length > 0 && (
          <Section title="Products">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
              {products.map((p) => {
                const img = p.image || p.image_url;
                const name = p.title || p.name || "Product";
                const cat = p.category?.name || p.product_category?.name || "";
                const price = p.price_usd || p.price_range || p.price_inr || p.price_max || "—";
                return (
                  <div key={p.id} className="rounded-xl border border-gray-100 overflow-hidden bg-gray-50/50 hover:border-brand-200 transition-colors">
                    <div className="aspect-square flex items-center justify-center bg-white p-3">
                      {img ? (
                        <img src={img} alt={name} className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-gray-400 text-xs">No image</span>
                      )}
                    </div>
                    <div className="p-3 text-center">
                      {cat && <p className="text-xs font-medium text-brand-600 uppercase tracking-wide">{cat}</p>}
                      <p className="text-sm font-semibold text-gray-900 line-clamp-2 mt-0.5">{name}</p>
                      <p className="text-sm font-bold text-gray-800 mt-1">{price}</p>
                      {p.moq && <p className="text-xs text-gray-500 mt-0.5">MOQ: {p.moq}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {/* Clients - grid of images, no slider */}
        {clients.length > 0 && (
          <Section title="Clients & Partners">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {clients.map((c) => (
                <div
                  key={c.id}
                  className="aspect-square rounded-xl border border-gray-100 overflow-hidden bg-white flex items-center justify-center p-3 hover:border-brand-200 transition-colors"
                >
                  {c.image_url ? (
                    <img src={c.image_url} alt="Client" className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-gray-400 text-xs">—</span>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Certificates */}
        {certificates.length > 0 && (
          <Section title="Certificates">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {certificates.map((cert) => (
                <CertImage key={cert.id} cert={cert} />
              ))}
            </div>
          </Section>
        )}

        {/* Contact */}
        <Section title="Contact">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
            {contact.address && (
              <div className="flex gap-3">
                <span className="w-1 rounded-full bg-brand-600 flex-shrink-0" aria-hidden />
                <div>
                  <span className="text-xs font-medium text-brand-600 uppercase tracking-wider block mb-1">Address</span>
                  <span className="text-gray-700">{contact.address}</span>
                </div>
              </div>
            )}
            {contact.factory_address && (
              <div className="flex gap-3">
                <span className="w-1 rounded-full bg-brand-600 flex-shrink-0" aria-hidden />
                <div>
                  <span className="text-xs font-medium text-brand-600 uppercase tracking-wider block mb-1">Factory Address</span>
                  <span className="text-gray-700">{contact.factory_address}</span>
                </div>
              </div>
            )}
            {contact.email && (
              <div className="flex gap-3">
                <span className="w-1 rounded-full bg-brand-600 flex-shrink-0" aria-hidden />
                <div>
                  <span className="text-xs font-medium text-brand-600 uppercase tracking-wider block mb-1">Email</span>
                  <a href={`mailto:${contact.email}`} className="text-gray-700 hover:text-brand-600 transition-colors">{contact.email}</a>
                </div>
              </div>
            )}
            {(contact.phone || contact.phone_code) && (
              <div className="flex gap-3">
                <span className="w-1 rounded-full bg-brand-600 flex-shrink-0" aria-hidden />
                <div>
                  <span className="text-xs font-medium text-brand-600 uppercase tracking-wider block mb-1">Phone</span>
                  <span className="text-gray-700">
                    {contact.phone_code && contact.phone ? `${contact.phone_code} ${contact.phone}` : contact.phone}
                  </span>
                </div>
              </div>
            )}
            {(contact.whatsapp || contact.whatsapp_code) && (
              <div className="flex gap-3">
                <span className="w-1 rounded-full bg-brand-600 flex-shrink-0" aria-hidden />
                <div>
                  <span className="text-xs font-medium text-brand-600 uppercase tracking-wider block mb-1">WhatsApp</span>
                  <span className="text-gray-700">
                    {contact.whatsapp_code && contact.whatsapp
                      ? `${contact.whatsapp_code} ${contact.whatsapp}`
                      : contact.whatsapp}
                  </span>
                </div>
              </div>
            )}
            {contact.website && (
              <div className="flex gap-3">
                <span className="w-1 rounded-full bg-brand-600 flex-shrink-0" aria-hidden />
                <div>
                  <span className="text-xs font-medium text-brand-600 uppercase tracking-wider block mb-1">Website</span>
                  <a href={contact.website} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-brand-600 transition-colors">
                    {contact.website}
                  </a>
                </div>
              </div>
            )}
          </div>
        </Section>

        {/* Decision Makers */}
        {decisionMakers.length > 0 && (
          <Section title="Decision Makers">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {decisionMakers.map((dm) => {
                const phone = dm.phone_code && dm.phone ? `${dm.phone_code} ${dm.phone}` : dm.phone;
                const whatsapp = dm.whatsapp_code && dm.whatsapp ? `${dm.whatsapp_code} ${dm.whatsapp}` : dm.whatsapp;
                return (
                  <div key={dm.id} className="rounded-xl border border-gray-100 bg-gray-50/50 p-5 pl-5 border-l-4 border-l-brand-600">
                    <p className="font-semibold text-gray-900">{dm.name}</p>
                    {dm.designation && <p className="text-sm text-brand-600 font-medium mt-0.5">{dm.designation}</p>}
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      {dm.email && <p>{dm.email}</p>}
                      {phone && <p>{phone}</p>}
                      {whatsapp && <p>{whatsapp}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {/* FAQ */}
        {faqs.length > 0 && (
          <Section title="FAQ">
            <div className="space-y-3">
              {faqs.map((faq) => (
                <div key={faq.id} className="rounded-xl bg-gray-50/80 border border-gray-100 p-4">
                  <p className="font-semibold text-gray-900 text-sm">{faq.question}</p>
                  <p className="text-gray-600 text-sm mt-2 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        <footer className="mt-14 pt-8 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">Company profile</p>
          <p className="text-gray-900 font-medium mt-1">{company.name}</p>
        </footer>
      </div>
    </div>
  );
}

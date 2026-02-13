"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getMyFavsCompanies, getMyFavsSourcingProposals, delFavsCompanyFaq, toggleFavsSourcingProposal } from "@/services/company";
import { useToast } from "@/hooks/use-toast";

export default function FavoritesPage() {
  const [tab, setTab] = useState("companies");
  const [companies, setCompanies] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    Promise.all([
      getMyFavsCompanies().then((d) => setCompanies(d || [])),
      getMyFavsSourcingProposals().then((d) => setProposals(d || [])),
    ]).finally(() => setLoading(false));
  }, []);

  const removeFavCompany = async (slug) => {
    const success = await delFavsCompanyFaq(slug, toast);
    if (success) setCompanies(companies.filter((c) => c.slug !== slug));
  };

  const removeFavProposal = async (id) => {
    const success = await toggleFavsSourcingProposal(id, toast);
    if (success) setProposals(proposals.filter((p) => p.id !== id));
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Favorites</h2>
      <div className="flex mb-6 border-b border-gray-200">
        {["companies", "proposals"].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 rounded-none capitalize bg-transparent ${
              tab === t ? "border-brand-600 text-brand-600" : "border-transparent text-gray-500"
            }`}>
            {t}
          </button>
        ))}
      </div>
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <>
          {/* Favorite Companies - use same card as /company grid */}
          {tab === "companies" &&
            (companies.length === 0 ? (
              <p className="text-gray-500">No favorite companies</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {companies.map((company) => {
                  const categories = company.business_categories || [];
                  const businessType = company.business_types?.[0]?.name || null;

                  return (
                    <div
                      key={company.id}
                      className="border rounded-lg p-5 hover:shadow-card-shadow transition-shadow bg-white flex flex-col"
                    >
                      {/* Header */}
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden border flex-shrink-0 bg-gray-50 flex items-center justify-center">
                          {company.profile_pic_url || company.thumbnail_url ? (
                            <img
                              src={company.profile_pic_url || company.thumbnail_url}
                              alt={company.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <svg
                              className="w-6 h-6 text-brand-500"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          {businessType && (
                            <p className="text-xs font-medium text-brand-600 mb-0.5">
                              {businessType}
                            </p>
                          )}
                          <h3 className="text-base font-bold text-gray-900 truncate">
                            {company.name}
                          </h3>
                        </div>
                        <button
                          onClick={() => removeFavCompany(company.slug)}
                          className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full border border-[rgba(247,147,30,0.5)] hover:bg-[rgba(247,147,30,0.08)] transition-colors bg-white p-0 text-[rgb(247,147,30)]"
                          title="Remove from favorites"
                        >
                          <svg
                            className="w-4 h-4 fill-current"
                            viewBox="0 0 24 24"
                          >
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                          </svg>
                        </button>
                      </div>

                      {/* Business Categories */}
                      {categories.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {categories.slice(0, 8).map((cat) => (
                            <span
                              key={cat.id}
                              className="text-xs text-gray-700 border border-gray-300 rounded px-2 py-0.5"
                            >
                              {cat.name}
                            </span>
                          ))}
                          {categories.length > 8 && (
                            <span className="text-xs text-gray-400 px-1 py-0.5">
                              +{categories.length - 8}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Description */}
                      {(company.about || company.moto) && (
                        <p className="text-sm text-gray-500 line-clamp-3 mb-4">
                          {company.about || company.moto}
                        </p>
                      )}

                      {/* Location + buttons */}
                      <div className="mt-auto">
                        {company.location && (
                          <div className="flex items-center justify-end gap-1.5 mb-4 text-sm text-gray-700">
                            {company.location.flag_path && (
                              <img
                                src={company.location.flag_path}
                                alt=""
                                className="w-4 h-3 object-cover rounded-sm"
                              />
                            )}
                            <svg
                              className="w-4 h-4 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            <span>{company.location.name}</span>
                          </div>
                        )}

                        <div className="flex gap-3 border-t pt-4">
                          <Link
                            href={`/company/${company.slug}`}
                            className="flex-1 text-center py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                          >
                            View Profile
                          </Link>
                          <Link
                            href={`/company/${company.slug}?tab=contact`}
                            className="flex-1 text-center py-2 text-sm font-medium text-brand-600 border border-brand-400 rounded-md hover:bg-brand-50 transition-colors"
                          >
                            Contact
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}

          {/* Favorite Proposals - use same card as /sourcing grid */}
          {tab === "proposals" &&
            (proposals.length === 0 ? (
              <p className="text-gray-500">No favorite proposals</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {proposals.map((proposal) => {
                  const img = proposal.images_urls?.[0] || proposal.images?.[0];
                  const imgSrc = img?.url || img?.original_url || img?.image || img;
                  const categories = proposal.product_categories || [];

                  return (
                    <div
                      key={proposal.id}
                      className="border rounded-lg hover:shadow-card-shadow transition-shadow bg-white flex flex-col overflow-hidden"
                    >
                      {/* Top row - Location left, remove button right */}
                      <div className="flex items-center justify-between px-4 pt-3 pb-1">
                        {proposal.location ? (
                          <div className="flex items-center gap-1.5 text-sm text-gray-500">
                            {proposal.location.flag_path && (
                              <img
                                src={proposal.location.flag_path}
                                alt=""
                                className="w-4 h-3 object-cover rounded-sm"
                              />
                            )}
                            <span>{proposal.location.name}</span>
                          </div>
                        ) : (
                          <div />
                        )}
                        <button
                          onClick={() => removeFavProposal(proposal.id)}
                          className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full border border-[rgba(247,147,30,0.5)] hover:bg-[rgba(247,147,30,0.08)] transition-colors bg-white p-0 text-[rgb(247,147,30)]"
                          title="Remove from favorites"
                        >
                          <svg
                            className="w-4 h-4 fill-current"
                            viewBox="0 0 24 24"
                          >
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                          </svg>
                        </button>
                      </div>

                      {/* Image */}
                      <div className="mx-4 mb-1 overflow-hidden rounded-lg bg-gray-50 aspect-[4/1]">
                        {imgSrc ? (
                          <img
                            src={imgSrc}
                            alt={proposal.title}
                            className="w-full h-full object-cover block"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg
                              className="w-10 h-10 text-gray-200"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
                              />
                            </svg>
                          </div>
                        )}
                      </div>

                      <div className="p-4 flex flex-col flex-1">
                        <h3 className="text-base font-bold text-gray-900 truncate mb-1">
                          {proposal.title}
                        </h3>

                        {categories.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {categories.slice(0, 4).map((cat) => (
                              <span
                                key={cat.id}
                                className="text-xs text-gray-700 border border-gray-300 rounded px-2 py-0.5"
                              >
                                {cat.name}
                              </span>
                            ))}
                            {categories.length > 4 && (
                              <span className="text-xs text-gray-400 px-1 py-0.5">
                                +{categories.length - 4}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="mt-auto">
                          {/* Price */}
                          {proposal.price && (
                            <div className="flex items-center justify-end text-sm mb-3">
                              <span className="font-semibold text-gray-900">
                                {proposal.currency || "USD"} {proposal.price}
                              </span>
                            </div>
                          )}

                          {/* Footer buttons */}
                          <div className="flex gap-3 border-t pt-3">
                            <Link
                              href={`/sourcing/${proposal.id}`}
                              className="flex-1 text-center py-1.5 text-sm font-medium text-white bg-brand-500 rounded-md hover:bg-brand-600 transition-colors flex items-center justify-center gap-1.5"
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
                                  d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                              </svg>
                              View Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
        </>
      )}
    </div>
  );
}

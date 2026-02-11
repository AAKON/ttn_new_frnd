"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getMySourcingProposals, delSourcingProposal } from "@/services/company";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Pencil } from "lucide-react";

export default function MySourcingProposalsPage() {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    getMySourcingProposals().then((d) => { setProposals(d || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this proposal?")) return;
    const success = await delSourcingProposal(id, toast);
    if (success) setProposals(proposals.filter((p) => p.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">My Sourcing Proposals</h2>
        <Link href="/sourcing/create" className="bg-brand-600 text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2">
          <Plus size={16} /> Create
        </Link>
      </div>
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : proposals.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-500">No proposals yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {proposals.map((proposal) => {
            const img = proposal.images_urls?.[0] || proposal.images?.[0];
            const imgSrc = img?.url || img?.original_url || img?.image || img;
            const categories = proposal.product_categories || [];

            return (
              <div
                key={proposal.id}
                className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm ring-1 ring-transparent transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-100 hover:shadow-lg hover:ring-brand-50"
              >
                {/* Top row - Location left, Status right */}
                <div className="flex items-center justify-between px-3 pt-2 pb-1 gap-3">
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
                  {proposal.status && (
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${
                        proposal.status === "approved"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          : proposal.status === "pending"
                          ? "bg-red-50 text-red-700 border border-red-100"
                          : "bg-gray-100 text-gray-700 border border-gray-100"
                      }`}
                    >
                      {proposal.status}
                    </span>
                  )}
                </div>

                {/* Image */}
                <div className="mx-3 mb-1 overflow-hidden rounded-lg bg-gray-50 aspect-[3/1]">
                  {imgSrc ? (
                    <img
                      src={imgSrc}
                      alt={proposal.title}
                      className="block h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <svg
                        className="h-10 w-10 text-gray-200"
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

                <div className="flex flex-1 flex-col px-3 pb-3 pt-2">
                  <h3 className="mb-1 text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-brand-700">
                    {proposal.title}
                  </h3>

                  {categories.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-1.5">
                      {categories.slice(0, 4).map((cat) => (
                        <span
                          key={cat.id}
                          className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-700"
                        >
                          {cat.name}
                        </span>
                      ))}
                      {categories.length > 4 && (
                        <span className="px-1 py-0.5 text-xs text-gray-400">
                          +{categories.length - 4}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="mt-auto space-y-3">
                    {/* Company */}
                    {proposal.company_name && (
                      <div className="flex items-center justify-between text-[11px] text-gray-500">
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          <span className="font-medium text-gray-700">
                            {proposal.company_name}
                          </span>
                        </span>
                      </div>
                    )}

                    {/* Price */}
                    {proposal.price && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Budget</span>
                        <span className="font-semibold text-gray-900">
                          {proposal.currency || "USD"} {proposal.price}
                        </span>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-2 border-t border-dashed border-gray-200 pt-2">
                      <Link
                        href={`/sourcing/${proposal.id}/edit`}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md border border-brand-200 bg-brand-50 px-2 py-1 text-xs font-medium text-brand-700 transition-colors hover:bg-brand-100"
                      >
                        <Pencil size={14} />
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(proposal.id)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-100"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

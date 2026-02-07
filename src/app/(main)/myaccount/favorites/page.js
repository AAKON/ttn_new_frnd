"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getMyFavsCompanies, getMyFavsSourcingProposals, delFavsCompanyFaq, toggleFavsSourcingProposal } from "@/services/company";
import { useToast } from "@/hooks/use-toast";
import { Heart } from "lucide-react";

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
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {["companies", "proposals"].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px capitalize bg-transparent ${tab === t ? "border-brand-600 text-brand-600" : "border-transparent text-gray-500"}`}>
            {t}
          </button>
        ))}
      </div>
      {loading ? <p>Loading...</p> : (
        <>
          {tab === "companies" && (
            companies.length === 0 ? <p className="text-gray-500">No favorite companies</p> : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {companies.map((c) => (
                  <div key={c.id} className="bg-white rounded-lg border border-gray-200 p-4 flex justify-between items-start">
                    <div>
                      <Link href={`/company/${c.slug}`} className="font-semibold text-gray-900 hover:text-brand-600">{c.name}</Link>
                      <p className="text-sm mt-1">{c.moto}</p>
                    </div>
                    <button onClick={() => removeFavCompany(c.slug)} className="p-1.5 bg-transparent text-red-500 hover:bg-red-50 rounded"><Heart size={16} fill="currentColor" /></button>
                  </div>
                ))}
              </div>
            )
          )}
          {tab === "proposals" && (
            proposals.length === 0 ? <p className="text-gray-500">No favorite proposals</p> : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {proposals.map((p) => (
                  <div key={p.id} className="bg-white rounded-lg border border-gray-200 p-4 flex justify-between items-start">
                    <div>
                      <Link href={`/sourcing/${p.id}`} className="font-semibold text-gray-900 hover:text-brand-600">{p.title}</Link>
                      <p className="text-sm mt-1">{p.company_name}</p>
                    </div>
                    <button onClick={() => removeFavProposal(p.id)} className="p-1.5 bg-transparent text-red-500 hover:bg-red-50 rounded"><Heart size={16} fill="currentColor" /></button>
                  </div>
                ))}
              </div>
            )
          )}
        </>
      )}
    </div>
  );
}

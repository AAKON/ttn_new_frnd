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
      {loading ? <p>Loading...</p> : proposals.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-500">No proposals yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {proposals.map((p) => (
            <div key={p.id} className="bg-white rounded-lg border border-gray-200 p-4 flex justify-between items-center">
              <div>
                <Link href={`/sourcing/${p.id}`} className="font-semibold text-gray-900 hover:text-brand-600">{p.title}</Link>
                <p className="text-sm mt-1">{p.company_name} &middot; <span className="capitalize">{p.status}</span></p>
              </div>
              <div className="flex items-center gap-1">
                <Link href={`/sourcing/${p.id}/edit`} className="!p-1.5 !bg-transparent !text-gray-500 hover:!bg-gray-100 !rounded"><Pencil size={16} /></Link>
                <button onClick={() => handleDelete(p.id)} className="!p-1.5 !bg-transparent !text-red-500 hover:!bg-red-50 !rounded"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function FormWrapper({ title, backHref, children, onSubmit, loading = false, submitLabel = "Save" }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        {backHref && (
          <Link href={backHref} className="p-2 rounded-md hover:bg-gray-100 bg-transparent text-gray-500">
            <ArrowLeft size={20} />
          </Link>
        )}
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <form onSubmit={onSubmit} className="space-y-4">
          {children}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

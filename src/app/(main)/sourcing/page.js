"use client";

import { useState, useEffect, useCallback } from "react";
import { apiRequest } from "@/utils/api";
import { getSourcingFilterOptions } from "@/services/sourcing";
import Link from "next/link";
import InfiniteScroll from "react-infinite-scroll-component";

export default function SourcingListingPage() {
  const [proposals, setProposals] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [filterOptions, setFilterOptions] = useState({
    categories: [],
    locations: [],
  });

  const [filters, setFilters] = useState({
    keyword: "",
    categoryId: null,
    locationId: null,
  });

  const fetchFilterOptions = useCallback(async () => {
    try {
      const result = await getSourcingFilterOptions();
      if (result?.data) {
        setFilterOptions({
          categories: result.data.categories || [],
          locations: result.data.locations || [],
        });
      }
    } catch (error) {
      // Filter options will remain empty
    }
  }, []);

  const fetchProposals = useCallback(
    async (pageNum = 1, reset = false) => {
      try {
        setLoading(true);
        const payload = {
          keyword: filters.keyword,
          categoryId: filters.categoryId,
          locationId: filters.locationId,
          page: pageNum,
        };

        const result = await apiRequest("sourcing-proposals/list", {
          method: "POST",
          body: payload,
          cache: "no-store",
        });

        const newProposals = result?.data?.data || result?.data || [];
        const lastPage = result?.data?.last_page || 1;

        if (reset) {
          setProposals(newProposals);
        } else {
          setProposals((prev) => [...prev, ...newProposals]);
        }

        setHasMore(pageNum < lastPage);
        setPage(pageNum);
      } catch (error) {
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  useEffect(() => {
    fetchProposals(1, true);
  }, [fetchProposals]);

  const loadMore = () => {
    fetchProposals(page + 1, false);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      keyword: "",
      categoryId: null,
      locationId: null,
    });
  };

  return (
    <div className="container mx-auto py-10">
      <div className="text-center mb-10">
        <h1>Sourcing Proposals</h1>
        <p className="mt-3 text-lg max-w-2xl mx-auto">
          Browse sourcing proposals from buyers and suppliers worldwide
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filter Sidebar */}
        <aside className="w-full lg:w-72 shrink-0">
          <div className="border rounded-lg p-5 sticky top-4">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
              <button
                onClick={clearFilters}
                className="!bg-transparent !text-brand-600 text-sm !p-0 !font-normal hover:underline"
              >
                Clear all
              </button>
            </div>

            <div className="mb-5">
              <label className="formLabelClasses block mb-1.5">Search</label>
              <input
                type="text"
                value={filters.keyword}
                onChange={(e) => handleFilterChange("keyword", e.target.value)}
                placeholder="Search proposals..."
                className="input_style"
              />
            </div>

            {filterOptions.categories.length > 0 && (
              <div className="mb-5">
                <label className="formLabelClasses block mb-1.5">Category</label>
                <select
                  value={filters.categoryId || ""}
                  onChange={(e) =>
                    handleFilterChange(
                      "categoryId",
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  className="input_style"
                >
                  <option value="">All Categories</option>
                  {filterOptions.categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {filterOptions.locations.length > 0 && (
              <div className="mb-5">
                <label className="formLabelClasses block mb-1.5">Location</label>
                <select
                  value={filters.locationId || ""}
                  onChange={(e) =>
                    handleFilterChange(
                      "locationId",
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  className="input_style"
                >
                  <option value="">All Locations</option>
                  {filterOptions.locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </aside>

        {/* Proposal Cards */}
        <div className="flex-1">
          <div className="flex justify-end mb-4">
            <Link
              href="/sourcing/create"
              className="bg-brand-600 text-white px-5 py-2 rounded-md text-sm font-semibold hover:bg-brand-700 transition-colors inline-flex items-center gap-2"
            >
              + Create Proposal
            </Link>
          </div>

          {loading && proposals.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500">Loading proposals...</p>
            </div>
          ) : proposals.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No sourcing proposals found.</p>
            </div>
          ) : (
            <InfiniteScroll
              dataLength={proposals.length}
              next={loadMore}
              hasMore={hasMore}
              loader={
                <div className="text-center py-4">
                  <p className="text-gray-500">Loading more proposals...</p>
                </div>
              }
              endMessage={
                <div className="text-center py-4">
                  <p className="text-gray-400 text-sm">All proposals loaded</p>
                </div>
              }
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {proposals.map((proposal) => (
                  <Link
                    key={proposal.id}
                    href={`/sourcing/${proposal.id}`}
                    className="border rounded-lg p-5 hover:shadow-card-shadow transition-shadow block"
                  >
                    <div className="flex items-start gap-4">
                      {proposal.images && proposal.images.length > 0 && (
                        <img
                          src={proposal.images[0].image || proposal.images[0]}
                          alt={proposal.title}
                          className="w-20 h-20 rounded-lg object-cover border"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {proposal.title}
                        </h3>
                        {proposal.description && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {proposal.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2 mt-3">
                          {proposal.quantity && (
                            <span className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded">
                              Qty: {proposal.quantity}
                            </span>
                          )}
                          {proposal.category && (
                            <span className="text-xs bg-brand-50 text-brand-700 px-2 py-1 rounded">
                              {proposal.category.name || proposal.category}
                            </span>
                          )}
                          {proposal.created_at && (
                            <span className="text-xs text-gray-400">
                              {new Date(proposal.created_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </InfiniteScroll>
          )}
        </div>
      </div>
    </div>
  );
}

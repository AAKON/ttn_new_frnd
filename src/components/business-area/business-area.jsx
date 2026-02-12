"use client";

import { useRef } from "react";
import Link from "next/link";
import { Container, Section } from "@/components/shared";

const BusinessArea = ({ categories = [] }) => {
  const listRef = useRef(null);
  const safeCategories = Array.isArray(categories) ? categories : [];

  const scrollBy = (direction) => {
    const node = listRef.current;
    if (!node) return;
    const amount = node.clientWidth * 0.7;
    node.scrollBy({ left: direction * amount, behavior: "smooth" });
  };

  if (!safeCategories.length) return null;

  return (
    <Section className="bg-gray-50">
      <Container>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Business Area
          </h2>
          <p className="text-gray-600">
            Explore our extensive range of textile &amp; apparel products &
            services.
          </p>
        </div>

        <div className="relative">
          {/* Left arrow */}
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 h-9 w-9 rounded-full bg-white shadow-md border border-gray-200 items-center justify-center text-gray-500 hover:text-brand-600 hover:border-brand-300 z-10"
          >
            <span className="text-lg">&#8249;</span>
          </button>

          {/* Scrollable categories */}
          <div
            ref={listRef}
            className="overflow-x-auto no-scrollbar px-1"
          >
            <div className="flex gap-3 md:gap-4 py-2 justify-start">
              {safeCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/company?category=${cat.id}`}
                  className="flex-shrink-0 w-[140px] md:w-[160px]"
                >
                  <div className="h-full flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-gray-200 px-4 py-5 hover:border-brand-500 hover:shadow-md transition-all">
                    <div className="w-11 h-11 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden">
                      {cat.image ? (
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span className="text-2xl text-gray-500">🏷️</span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-gray-800 text-center leading-snug line-clamp-2">
                      {cat.name}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Right arrow */}
          <button
            type="button"
            onClick={() => scrollBy(1)}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 h-9 w-9 rounded-full bg-white shadow-md border border-gray-200 items-center justify-center text-gray-500 hover:text-brand-600 hover:border-brand-300 z-10"
          >
            <span className="text-lg">&#8250;</span>
          </button>
        </div>

        <div className="mt-8 flex justify-center">
          <Link
            href="/company/create"
            className="inline-flex items-center px-6 py-2.5 rounded-full bg-brand-600 text-white text-sm font-semibold shadow-sm hover:bg-brand-700 transition-colors"
          >
            + Add Business
          </Link>
        </div>
      </Container>
    </Section>
  );
};

export default BusinessArea;

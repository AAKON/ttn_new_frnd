"use client";
import React from "react";
import Link from "next/link";
import { Container } from "@/components/shared";

const Hero = ({ categories = [], locations = [] }) => {
  return (
    <section
      className="relative py-16 md:py-24 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=600&fit=crop')"
      }}
    >
      <Container>
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-6">
            Find Your <span className="text-brand-600">Apparel</span> Business Needs
          </h1>

          {/* Search Form */}
          <div className="bg-white p-4 rounded-lg shadow-lg mb-6">
            <form className="flex flex-col md:flex-row gap-4 items-stretch">
              <input
                type="text"
                placeholder="Search..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600"
              />
              <select className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600">
                <option>All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <select className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600">
                <option>Anywhere</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
              <button
                type="submit"
                className="px-8 py-3 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 transition-colors whitespace-nowrap"
              >
                Search
              </button>
            </form>
          </div>

          {/* Quick Tags */}
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/sourcing?keyword=Sports+Wear" className="px-4 py-2 bg-black/20 text-white rounded-lg text-sm hover:bg-black/30 transition">
              Sports Wear
            </Link>
            <Link href="/sourcing?keyword=Hoodie" className="px-4 py-2 bg-black/20 text-white rounded-lg text-sm hover:bg-black/30 transition">
              Hoodie
            </Link>
            <Link href="/sourcing?keyword=Tops" className="px-4 py-2 bg-black/20 text-white rounded-lg text-sm hover:bg-black/30 transition">
              Tops
            </Link>
            <Link href="/sourcing?keyword=Cotton+Yarn" className="px-4 py-2 bg-black/20 text-white rounded-lg text-sm hover:bg-black/30 transition">
              Cotton Yarn
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Hero;

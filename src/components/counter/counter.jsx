import { Container, Section } from "@/components/shared";
import Link from "next/link";

const Counter = ({ homeStats }) => {
  return (
    <Section className="bg-white">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Grow Your Business Network
            </h2>
            <div className="flex gap-4">
              <Link
                href="/contact"
                className="px-6 py-3 border-2 border-brand-600 text-brand-600 rounded-lg font-semibold hover:bg-brand-50 transition"
              >
                Get quote
              </Link>
              <Link
                href="/myaccount/companies/create"
                className="px-6 py-3 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 transition"
              >
                Add Company
              </Link>
            </div>
          </div>

          {/* Right Side - Stats Grid */}
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-brand-600">
                {homeStats?.partners}+
              </p>
              <p className="text-sm text-gray-600 mt-2">Partners</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-brand-600">
                {homeStats?.countries}+
              </p>
              <p className="text-sm text-gray-600 mt-2">Countries</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-brand-600">
                {homeStats?.factory_people}K+
              </p>
              <p className="text-sm text-gray-600 mt-2">Professionals</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-brand-600">
                {homeStats?.global_audience}K+
              </p>
              <p className="text-sm text-gray-600 mt-2">Global Audience</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-brand-600">
                {homeStats?.listed_business}+
              </p>
              <p className="text-sm text-gray-600 mt-2">Businesses</p>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default Counter;

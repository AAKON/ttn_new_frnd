import { Container, Section } from "@/components/shared";
import Link from "next/link";
import { Plus } from "lucide-react";

function StatCell({ homeStats, valueKey, label, suffix, leftAlign = false, compact = false }) {
  const value = homeStats?.[valueKey] ?? "0";
  return (
    <div
      className={`flex flex-col justify-center ${compact ? "py-4 px-3 sm:py-6 sm:px-5" : "py-6 px-5"} ${
        leftAlign ? "items-start text-left" : "items-center text-center"
      }`}
    >
      <p
        className={`font-bold tabular-nums ${compact ? "text-xl sm:text-2xl md:text-3xl" : "text-2xl md:text-3xl"}`}
        style={{ color: "rgb(247,147,30)" }}
      >
        {value}{suffix}
      </p>
      <p className={`text-gray-700 mt-1 ${compact ? "text-xs sm:text-sm" : "text-sm"}`}>{label}</p>
    </div>
  );
}

const Counter = ({ homeStats }) => {
  return (
    <Section className="bg-white">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center px-4 sm:px-0">
          {/* Left: Heading + CTAs */}
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-6 sm:mb-8 leading-tight">
              Grow Your Business Network
            </h2>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="h-10 px-4 sm:px-5 inline-flex items-center justify-center text-sm font-semibold text-gray-800 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors shrink-0"
              >
                Get quote
              </Link>
              <Link
                href="/company/create"
                className="h-10 px-4 sm:px-5 inline-flex items-center justify-center gap-2 text-sm font-semibold text-white rounded-md transition-colors bg-[rgb(247,147,30)] hover:bg-[rgb(230,130,20)] shrink-0"
              >
                <Plus size={18} />
                Add Company
              </Link>
            </div>
          </div>

          {/* Right: Stats – mobile: 2x2 + full-width row (no borders); desktop: 2x2 left + right panel with borders */}
          <div className="w-full overflow-hidden rounded-lg">
            {/* Mobile & tablet: 2 cols, then 5th stat full width */}
            <div className="grid grid-cols-2 lg:grid-cols-[1fr_1fr]">
              {/* First 4 stats: 2x2 grid */}
              <div className="grid grid-cols-2 col-span-2 lg:col-span-1 lg:border-b-0 lg:border-r-2 lg:border-gray-300">
                <div className="lg:border-b-2 lg:border-r-2 lg:border-gray-300">
                  <StatCell homeStats={homeStats} valueKey="partners" label="Partners" suffix="+" leftAlign compact />
                </div>
                <div className="lg:border-b-2 lg:border-gray-300">
                  <StatCell homeStats={homeStats} valueKey="countries" label="Countries" suffix="+" leftAlign compact />
                </div>
                <div className="lg:border-r-2 lg:border-gray-300">
                  <StatCell homeStats={homeStats} valueKey="global_audience" label="Global Audiences" suffix="K+" leftAlign compact />
                </div>
                <div>
                  <StatCell homeStats={homeStats} valueKey="listed_business" label="Business" suffix="+" leftAlign compact />
                </div>
              </div>
              {/* 5th stat: full width on mobile, right panel on desktop */}
              <div className="col-span-2 lg:col-span-1 flex flex-col justify-center min-h-[80px] sm:min-h-[100px] lg:min-h-[160px] lg:border-t-0 lg:border-gray-300">
                <StatCell homeStats={homeStats} valueKey="factory_people" label="Professionals Connected" suffix="K+" leftAlign compact />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default Counter;

import { Container, Section } from "@/components/shared";
import Link from "next/link";
import { Plus } from "lucide-react";

function StatCell({ homeStats, valueKey, label, suffix, leftAlign = false }) {
  const value = homeStats?.[valueKey] ?? "0";
  return (
    <div
      className={`flex flex-col justify-center py-6 px-5 ${
        leftAlign ? "items-start text-left" : "items-center text-center"
      }`}
    >
      <p
        className="text-2xl md:text-3xl font-bold tabular-nums"
        style={{ color: "rgb(247,147,30)" }}
      >
        {value}{suffix}
      </p>
      <p className="text-sm text-gray-700 mt-1">{label}</p>
    </div>
  );
}

const Counter = ({ homeStats }) => {
  return (
    <Section className="bg-white">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Heading + CTAs */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 leading-tight">
              Grow Your Business Network
            </h2>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="h-10 px-5 inline-flex items-center justify-center text-sm font-semibold text-gray-800 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Get quote
              </Link>
              <Link
                href="/company/create"
                className="h-10 px-5 inline-flex items-center justify-center gap-2 text-sm font-semibold text-white rounded-md transition-colors bg-[rgb(247,147,30)] hover:bg-[rgb(230,130,20)]"
              >
                <Plus size={18} />
                Add Company
              </Link>
            </div>
          </div>

          {/* Right: Stats – 2x2 left + right panel; inner borders only, slightly bold */}
          <div className="grid grid-cols-[1fr_1fr] gap-0 overflow-hidden">
            {/* Left: 2x2 grid – Partners, Countries | Global Audiences, Business */}
            <div className="grid grid-cols-2 grid-rows-2 border-r-2 border-gray-300">
              <div className="border-b-2 border-r-2 border-gray-300">
                <StatCell homeStats={homeStats} valueKey="partners" label="Partners" suffix="+" leftAlign />
              </div>
              <div className="border-b-2 border-gray-300">
                <StatCell homeStats={homeStats} valueKey="countries" label="Countries" suffix="+" leftAlign />
              </div>
              <div className="border-r-2 border-gray-300">
                <StatCell homeStats={homeStats} valueKey="global_audience" label="Global Audiences" suffix="K+" leftAlign />
              </div>
              <div>
                <StatCell homeStats={homeStats} valueKey="listed_business" label="Business" suffix="+" leftAlign />
              </div>
            </div>
            {/* Right: full-height panel, wider */}
            <div className="flex flex-col justify-center min-h-[160px]">
              <StatCell homeStats={homeStats} valueKey="factory_people" label="Professionals Connected" suffix="K+" leftAlign />
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default Counter;

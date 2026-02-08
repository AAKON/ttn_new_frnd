import { Container, Section } from "@/components/shared";
import Link from "next/link";

const RecentCompany = ({ data = [] }) => {
  if (!data || data.length === 0) return null;

  return (
    <Section>
      <Container>
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Recently Added
          </h2>
          <p className="text-gray-600">
            Discover newly joined textile and apparel businesses
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {data.slice(0, 5).map((company) => (
            <Link
              key={company.id}
              href={`/company/${company.slug || company.id}`}
              className="group"
            >
              <div className="bg-white border border-gray-200 rounded-lg p-6 text-center hover:shadow-lg transition-all group-hover:border-brand-600 h-full flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center mb-4 mx-auto group-hover:bg-brand-200 transition">
                  <span className="text-2xl">🏢</span>
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-brand-600 transition line-clamp-2">
                  {company.name}
                </h3>
                <button className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-semibold hover:bg-brand-700 transition">
                  View more
                </button>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Link href="/company" className="text-brand-600 hover:text-brand-700 font-semibold">
            Load Category for You →
          </Link>
        </div>
      </Container>
    </Section>
  );
};

export default RecentCompany;

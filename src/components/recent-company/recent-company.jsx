import { Container, Section } from "@/components/shared";
import Link from "next/link";

const RecentCompany = ({ data = [] }) => {
  if (!data || data.length === 0) return null;

  return (
    <Section>
      <Container>
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">
              Recently Added
            </h2>
            <p className="mt-1 text-sm md:text-base text-gray-500">
              Discover newly joined textile and apparel businesses.
            </p>
          </div>
          <Link
            href="/company"
            className="hidden md:inline-flex items-center text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            View all businesses
            <span className="ml-1">↗</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-5 mb-6">
          {data.slice(0, 5).map((company) => (
            <Link
              key={company.id}
              href={`/company/${company.slug || company.id}`}
              className="group"
            >
              <div className="bg-white border border-gray-100 rounded-2xl px-5 py-6 text-center hover:shadow-md hover:border-brand-200 transition-all h-full flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center mb-4 mx-auto overflow-hidden group-hover:bg-orange-100 transition-colors">
                  {company.profile_pic_url ? (
                    <img
                      src={company.profile_pic_url}
                      alt={company.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xl text-orange-500">🏢</span>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-gray-900 group-hover:text-brand-600 transition-colors line-clamp-2 min-h-[2.5rem]">
                  {company.name}
                </h3>
                {company.location?.name && (
                  <p className="mt-1 text-[11px] text-gray-500">
                    {company.location.name}
                  </p>
                )}
                {company.business_category?.name && (
                  <span className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium text-gray-700 bg-gray-50 border border-gray-200">
                    {company.business_category.name}
                  </span>
                )}
                <div className="mt-4">
                  <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-medium text-brand-600 bg-orange-50 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                    View company
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </Container>
    </Section>
  );
};

export default RecentCompany;

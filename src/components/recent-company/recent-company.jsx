import { Container, Section } from "@/components/shared";
import Link from "next/link";

const RecentCompany = ({ data = [] }) => {
  if (!data || data.length === 0) return null;

  return (
    <Section>
      <Container>
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 px-4 sm:px-0">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900">
              Recently Added
            </h2>
            <p className="mt-1 text-xs sm:text-sm md:text-base text-gray-500">
              Discover newly joined textile and apparel businesses.
            </p>
          </div>
          <Link
            href="/company"
            className="hidden sm:inline-flex items-center text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            View all businesses
            <span className="ml-1">↗</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5 mb-6 px-4 sm:px-0">
          {data.slice(0, 5).map((company) => {
            const categories = Array.isArray(company.business_categories)
              ? company.business_categories
              : company.business_category
              ? [company.business_category]
              : [];

            return (
            <Link
              key={company.id}
              href={`/company/${company.slug || company.id}`}
              className="group"
            >
              <div className="bg-white border border-gray-100 rounded-2xl px-6 py-8 text-center hover:shadow-md hover:border-brand-200 transition-all h-full flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center mb-5 mx-auto overflow-hidden group-hover:bg-orange-100 transition-colors">
                  {company.profile_pic_url ? (
                    <img
                      src={company.profile_pic_url}
                      alt={company.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl text-orange-500">🏢</span>
                  )}
                </div>
                <h3 className="text-base font-semibold text-gray-900 group-hover:text-brand-600 transition-colors line-clamp-2 min-h-[3rem]">
                  {company.name}
                </h3>
                {company.location?.name && (
                  <div className="mt-2 flex items-center justify-center gap-1.5 text-sm text-gray-500">
                    {company.location.flag_path && (
                      <img
                        src={company.location.flag_path}
                        alt={company.location.name}
                        className="w-5 h-4 object-cover rounded-sm"
                      />
                    )}
                    <span className="truncate max-w-[140px]">
                      {company.location.name}
                    </span>
                  </div>
                )}
                {categories.length > 0 && (
                  <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                    {categories.slice(0, 3).map((cat) => (
                      <span
                        key={cat.id}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200"
                      >
                        {cat.name}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-5">
                  <span className="inline-flex items-center px-5 py-2 rounded-full text-sm font-medium text-brand-600 bg-orange-50 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                    View company
                  </span>
                </div>
              </div>
            </Link>
          )})}
        </div>

      </Container>
    </Section>
  );
};

export default RecentCompany;

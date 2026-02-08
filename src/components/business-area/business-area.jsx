import { Container, Section } from "@/components/shared";

const BusinessArea = () => {
  const businessTypes = [
    { id: 1, name: "Manufacture", icon: "🏭" },
    { id: 2, name: "Export", icon: "📦" },
    { id: 3, name: "Services", icon: "🛠️" },
    { id: 4, name: "Supplier", icon: "🔗" },
    { id: 5, name: "Trading", icon: "🤝" },
    { id: 6, name: "Wholesaler", icon: "🏪" },
  ];

  return (
    <Section className="bg-gray-50">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Business Area</h2>
          <p className="text-gray-600">Explore our diverse range of textile & apparel services</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          {businessTypes.map((type) => (
            <div
              key={type.id}
              className="flex flex-col items-center p-6 bg-white rounded-lg border border-gray-200 hover:shadow-lg hover:border-brand-600 transition"
            >
              <div className="text-4xl mb-3">{type.icon}</div>
              <p className="text-sm font-semibold text-gray-900 text-center">{type.name}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button className="px-8 py-3 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 transition">
            Let&apos;s Category
          </button>
        </div>
      </Container>
    </Section>
  );
};

export default BusinessArea;

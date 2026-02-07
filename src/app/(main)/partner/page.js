import { getPartnerList } from "@/services/partner";

export default async function PartnerPage() {
  let partners = [];
  try {
    partners = (await getPartnerList()) || [];
  } catch (e) {}

  const marketing = partners.filter((p) => p.type === "marketing");
  const b2b = partners.filter((p) => p.type === "b2b");

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-center mb-4">Our Partners</h1>
      <p className="text-center max-w-xl mx-auto mb-12">We collaborate with leading companies in the textile industry</p>

      {marketing.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Marketing Partners</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {marketing.map((p) => (
              <a key={p.id} href={p.url || "#"} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center p-4 bg-white rounded-lg border border-gray-200 hover:shadow-card-shadow transition-shadow h-24">
                {p.image ? <img src={p.image} alt={p.name} className="max-h-12 object-contain" /> : <span className="text-sm font-medium text-gray-700">{p.name}</span>}
              </a>
            ))}
          </div>
        </section>
      )}

      {b2b.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">B2B Partners</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {b2b.map((p) => (
              <a key={p.id} href={p.url || "#"} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center p-4 bg-white rounded-lg border border-gray-200 hover:shadow-card-shadow transition-shadow h-24">
                {p.image ? <img src={p.image} alt={p.name} className="max-h-12 object-contain" /> : <span className="text-sm font-medium text-gray-700">{p.name}</span>}
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

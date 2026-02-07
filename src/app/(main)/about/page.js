import { getAboutData } from "@/services/about";
import { getTeams } from "@/services/contact";

export default async function AboutPage() {
  let aboutData = null;
  let teams = [];
  try {
    [aboutData, teams] = await Promise.all([getAboutData(), getTeams()]);
  } catch (e) {}

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-center mb-8">About Us</h1>
      {aboutData && (
        <div className="max-w-3xl mx-auto">
          <div className="paragraph" dangerouslySetInnerHTML={{ __html: aboutData?.about?.description || "" }} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
            {[
              { label: "Partners", value: aboutData?.about?.partners },
              { label: "Countries", value: aboutData?.about?.countries },
              { label: "Listed Business", value: aboutData?.about?.listed_business },
              { label: "Factory People", value: aboutData?.about?.factory_people },
            ].map((s) => (
              <div key={s.label} className="text-center p-4 bg-brand-50 rounded-lg">
                <p className="text-3xl font-bold text-brand-600">{s.value || "0"}</p>
                <p className="text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {teams?.length > 0 && (
        <section className="mt-16">
          <h2 className="text-center mb-8">Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {teams.map((m) => (
              <div key={m.id} className="text-center p-6 bg-white rounded-lg border border-gray-200">
                {m.image && <img src={m.image} alt={m.name} className="w-24 h-24 rounded-full mx-auto mb-4 object-cover" />}
                <h3 className="font-semibold text-gray-900">{m.name}</h3>
                <p className="text-sm">{m.designation}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

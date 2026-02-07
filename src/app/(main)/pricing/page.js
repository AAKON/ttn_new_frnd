import { getPricingList } from "@/services/pricing";
import { Check } from "lucide-react";

export default async function PricingPage() {
  let pricings = [];
  try {
    const result = await getPricingList();
    pricings = result?.data || [];
  } catch (e) {}

  return (
    <div className="container mx-auto py-12">
      <div className="text-center mb-12">
        <h1>Pricing Plans</h1>
        <p className="mt-4 max-w-xl mx-auto">Choose the right plan for your business needs</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {pricings.map((plan) => {
          const benefits = typeof plan.benefits === "string" ? JSON.parse(plan.benefits || "[]") : plan.benefits || [];
          return (
            <div key={plan.id} className={`p-8 rounded-xl border ${plan.is_popular ? "border-brand-600 shadow-hover-pricing-card-shadow" : "border-gray-200 shadow-pricing-card-shadow"} bg-white relative`}>
              {plan.is_popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-xs font-semibold px-3 py-1 rounded-full">Popular</span>
              )}
              <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
              <div className="mt-4">
                <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                <span className="text-gray-500">/{plan.type}</span>
              </div>
              <ul className="mt-6 space-y-3">
                {benefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check size={16} className="text-brand-600 mt-0.5 shrink-0" />
                    <span className="text-sm text-gray-600">{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

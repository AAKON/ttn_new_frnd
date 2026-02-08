"use client";
import { Container, Section } from "@/components/shared";

const SocialSlider = ({ webAds = [] }) => {
  if (!webAds || webAds.length === 0) return null;

  return (
    <Section>
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {webAds.slice(0, 3).map((ad) => (
            <div
              key={ad.id}
              className="relative rounded-lg overflow-hidden h-32 bg-gradient-to-r from-gray-200 to-gray-300 flex items-center justify-center hover:shadow-lg transition"
            >
              {ad.image ? (
                <img
                  src={ad.image}
                  alt={ad.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center">
                  <p className="font-semibold text-gray-700">{ad.title}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
};

export default SocialSlider;

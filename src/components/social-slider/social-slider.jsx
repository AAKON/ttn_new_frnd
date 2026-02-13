"use client";
import { useEffect, useMemo, useState, useRef } from "react";
import { Container, Section } from "@/components/shared";

const ITEMS_PER_SLIDE = 3;

const SocialSlider = ({ webAds = [] }) => {
  const ads = Array.isArray(webAds) ? webAds.filter((a) => a.image) : [];
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef(null);

  const slides = useMemo(() => {
    if (!ads.length) return [];
    const groups = [];
    const slideCount = Math.ceil(ads.length / ITEMS_PER_SLIDE);

    for (let s = 0; s < slideCount; s++) {
      const start = s * ITEMS_PER_SLIDE;
      let group = ads.slice(start, start + ITEMS_PER_SLIDE);

      // If last group has less than 3 items, fill with items from start
      if (group.length < ITEMS_PER_SLIDE) {
        const needed = ITEMS_PER_SLIDE - group.length;
        group = group.concat(ads.slice(0, needed));
      }
      groups.push(group);
    }

    return groups;
  }, [ads]);

  const [current, setCurrent] = useState(0);
  const total = slides.length;

  if (!total) return null;

  const goTo = (index) => {
    if (!total) return;
    const next = ((index % total) + total) % total;
    setCurrent(next);
  };

  // Autoplay between slides - pauses on hover
  useEffect(() => {
    if (total <= 1) return;
    
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Only start interval if not hovered
    if (!isHovered) {
      intervalRef.current = setInterval(() => {
        setCurrent((prev) => ((prev + 1) % total));
      }, 5000);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [total, isHovered]);

  const handleAdClick = (e, ad) => {
    if (!ad.link || !ad.link.trim()) {
      e.preventDefault();
      return;
    }
    // Link will open in new tab via target="_blank"
  };

  return (
    <Section>
      <Container>
        <div
          className="overflow-hidden"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div
            className="flex transition-transform duration-700 ease-in-out will-change-transform"
            style={{ transform: `translateX(-${current * 100}%)` }}
          >
            {slides.map((group, slideIndex) => (
              <div
                key={slideIndex}
                className="w-full shrink-0 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 px-1"
              >
                {group.map((ad, idx) => {
                  const hasLink = ad.link && ad.link.trim() && ad.link !== "#";
                  const Component = hasLink ? "a" : "div";
                  const props = hasLink
                    ? {
                        href: ad.link,
                        target: "_blank",
                        rel: "noopener noreferrer",
                        onClick: (e) => handleAdClick(e, ad),
                      }
                    : {};

                  return (
                    <Component
                      key={`${ad.id}-${idx}`}
                      {...props}
                      className={`relative block w-full rounded-2xl overflow-hidden h-24 md:h-28 lg:h-32 bg-gray-100 hover:shadow-lg transition-shadow ${
                        hasLink ? "cursor-pointer" : "cursor-default"
                      }`}
                    >
                      <img
                        src={ad.image}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover object-center"
                        style={{ objectFit: "cover", width: "100%", height: "100%" }}
                      />
                    </Component>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Navigation dots */}
          {total > 1 && (
            <div className="mt-4 flex justify-center gap-2">
              {Array.from({ length: total }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goTo(i)}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    i === current ? "bg-orange-400" : "bg-gray-300"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
};

export default SocialSlider;

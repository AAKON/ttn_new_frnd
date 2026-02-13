"use client";
import { useEffect, useMemo, useState, useRef } from "react";
import { Container, Section } from "@/components/shared";

const ITEMS_PER_SLIDE_DESKTOP = 3;
const ITEMS_PER_SLIDE_MOBILE = 1;

const SocialSlider = ({ webAds = [] }) => {
  const ads = Array.isArray(webAds) ? webAds.filter((a) => a.image) : [];
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    const check = () => setIsMobile(typeof window !== "undefined" && window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const itemsPerSlide = isMobile ? ITEMS_PER_SLIDE_MOBILE : ITEMS_PER_SLIDE_DESKTOP;

  const slides = useMemo(() => {
    if (!ads.length) return [];
    const groups = [];
    const slideCount = Math.ceil(ads.length / itemsPerSlide) || 1;

    for (let s = 0; s < slideCount; s++) {
      const start = s * itemsPerSlide;
      let group = ads.slice(start, start + itemsPerSlide);

      if (group.length < itemsPerSlide) {
        const needed = itemsPerSlide - group.length;
        group = group.concat(ads.slice(0, needed));
      }
      groups.push(group);
    }

    return groups;
  }, [ads, itemsPerSlide]);

  const [current, setCurrent] = useState(0);
  const total = slides.length;

  useEffect(() => {
    if (total > 0 && current >= total) setCurrent(total - 1);
  }, [total, current]);

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
                className="w-full shrink-0 grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 px-2 sm:px-1"
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
                      className={`relative block w-full rounded-2xl overflow-hidden bg-gray-100 hover:shadow-lg transition-shadow ${
                        hasLink ? "cursor-pointer" : "cursor-default"
                      } h-44 sm:h-32 md:h-28 lg:h-32`}
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

          {/* Navigation dots - pill style on mobile */}
          {total > 1 && (
            <div className="mt-4 flex justify-center gap-2">
              {Array.from({ length: total }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goTo(i)}
                  className={`transition-colors sm:rounded-full rounded-md ${
                    i === current ? "bg-[rgb(247,147,30)]" : "bg-gray-300"
                  } w-6 h-2 sm:w-2 sm:h-2`}
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

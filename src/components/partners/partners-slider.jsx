"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export default function PartnersSlider({ partners = [] }) {
  const items = useMemo(
    () =>
      Array.isArray(partners)
        ? partners.filter((p) => p && (p.image || p.name))
        : [],
    [partners]
  );

  // Duplicate the list so we can scroll seamlessly through all items
  // right-to-left without gaps and loop the whole list.
  const loopItems = useMemo(() => {
    if (!items.length) return [];
    return [...items, ...items];
  }, [items]);

  const trackRef = useRef(null);
  const animationRef = useRef(null);
  const lastTimeRef = useRef(null);
  const offsetRef = useRef(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!loopItems.length) return undefined;

    const speed = 40; // pixels per second (slow, smooth)

    const animate = (time) => {
      const track = trackRef.current;
      if (!track) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      if (isHovered) {
        // Pause while hovered
        lastTimeRef.current = time;
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      if (lastTimeRef.current == null) {
        lastTimeRef.current = time;
      }

      const delta = time - lastTimeRef.current;
      lastTimeRef.current = time;

      const totalWidth = track.scrollWidth / 2; // width of one full list
      if (totalWidth <= 0) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      // Move left over time
      offsetRef.current -= (delta * speed) / 1000;

      // When we've scrolled past one full list, reset offset
      if (-offsetRef.current >= totalWidth) {
        offsetRef.current += totalWidth;
      }

      track.style.transform = `translateX(${offsetRef.current}px)`;

      animationRef.current = requestAnimationFrame(animate);
    };

    // Reset offset when items change
    offsetRef.current = 0;
    lastTimeRef.current = null;
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      animationRef.current = null;
      lastTimeRef.current = null;
    };
  }, [loopItems, isHovered]);

  if (!loopItems.length) return null;

  return (
    <div
      className="overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        ref={trackRef}
        className="flex items-center will-change-transform"
        style={{ transform: "translateX(0px)" }}
      >
        {loopItems.map((partner, idx) => {
          const hasLink = partner.link && partner.link.trim();
          const Component = hasLink ? "a" : "div";
          const props = hasLink
            ? {
                href: partner.link,
                target: "_blank",
                rel: "noopener noreferrer",
              }
            : {};

          return (
            <Component
              key={`${partner.id}-${idx}`}
              {...props}
              className="relative h-20 sm:h-24 lg:h-28 min-w-[140px] sm:min-w-[160px] lg:min-w-[170px] bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex items-center justify-center cursor-pointer mr-2 sm:mr-3"
            >
              {partner.image ? (
                <img
                  src={partner.image}
                  alt={partner.name || ""}
                  className="absolute inset-0 w-full h-full object-cover object-center"
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <span className="text-gray-600 text-xs px-2 text-center z-10">
                  {partner.name}
                </span>
              )}
            </Component>
          );
        })}
      </div>
    </div>
  );
}


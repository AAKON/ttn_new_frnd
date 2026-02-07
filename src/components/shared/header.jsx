"use client";
import { useEffect, useRef, useState } from "react";
import { Nav } from "./nav";
import { usePathname } from "next/navigation";

export const Header = () => {
  const pathname = usePathname();
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [sticky, setSticky] = useState(false);
  const nav = useRef(null);

  useEffect(() => {
    window.onscroll = () => {
      if (window.scrollY > 100) {
        nav.current?.classList.add("header_style");
        setSticky(true);
      } else {
        setSticky(false);
        if (showMobileNav) {
          nav.current?.classList.add("header_style");
        } else {
          nav.current?.classList.remove("header_style");
        }
      }
    };
  }, [showMobileNav]);

  return (
    <header
      className={`py-5 h-[76px] lg:h-[88px] top-0 left-0 right-0 z-10 w-full ${
        pathname === "/" ? "bg-transparent fixed" : "bg-white"
      } ${sticky && "fixed"}`}
      ref={nav}
    >
      <Nav
        showMobileNav={showMobileNav}
        setShowMobileNav={setShowMobileNav}
        isSticky={sticky}
      />
    </header>
  );
};

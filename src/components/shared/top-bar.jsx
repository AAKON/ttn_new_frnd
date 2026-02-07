"use client";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { X } from "lucide-react";

export function TopBar(props) {
  const [show, setShow] = useState(true);
  const pathname = usePathname();

  return (
    <>
      {show && (
        <div
          className={`py-3 bg-gradient-to-l from-[#F7931E] to-[#DF861E] relative ${
            pathname.includes("blog") ? "hidden md:block" : "hidden"
          }`}
        >
          <div className="container">
            <div className="flex justify-center items-center">
              <p className="text-white">{props.title}</p>
            </div>
          </div>
          <span
            onClick={() => setShow(false)}
            className="absolute top-1/2 -translate-y-1/2 right-3 cursor-pointer p-2"
          >
            <X size={16} color="#fff" />
          </span>
        </div>
      )}
    </>
  );
}

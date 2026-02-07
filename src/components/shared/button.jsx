import React, { forwardRef } from "react";

const Button = forwardRef(
  (
    {
      TagName = "button",
      secondary = false,
      primaryOutline = false,
      deleteOutline = false,
      icon = false,
      children,
      className = "",
      ...props
    },
    ref
  ) => {
    let dynamicClasses = "";
    if (secondary) {
      dynamicClasses =
        "bg-white text-gray-700 border border-gray-200 hover:bg-gradient-to-r from-gray-50 to-gray-200";
    } else if (primaryOutline) {
      dynamicClasses =
        "bg-white text-brand-600 border border-brand-600 hover:bg-gradient-to-r from-brand-600 to-brand-700 hover:text-white";
    } else if (deleteOutline) {
      dynamicClasses =
        "bg-white text-brand-600 border border-brand-600 hover:bg-red-600 hover:text-white";
    } else {
      dynamicClasses =
        "bg-brand-600 text-white border border-brand-600 hover:bg-gradient-to-r from-brand-600 to-brand-700";
    }
    return (
      <TagName
        ref={ref}
        className={`group transition-all flex items-center gap-2 justify-center rounded-[8px] px-4 py-[9px] text-md leading-[24px] font-semibold h-9 lg:h-11 whitespace-nowrap ${className} ${dynamicClasses}`}
        {...props}
      >
        {icon && (
          <svg
            width={14}
            height={14}
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6.99999 1.16666V12.8333M1.16666 6.99999H12.8333"
              stroke="none"
              strokeWidth="1.66667"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`${
                primaryOutline
                  ? "stroke-brand-600 group-hover:!stroke-white"
                  : secondary && icon
                  ? "stroke-gray-700"
                  : "stroke-white"
              }`}
            />
          </svg>
        )}
        {children}
      </TagName>
    );
  }
);
Button.displayName = "Button";

export default Button;

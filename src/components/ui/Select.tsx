"use client";

import * as React from "react";
import { cn } from "@/utils/cn";

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  size?: "sm" | "md" | "lg" | "none";
  unstyled?: boolean;
  theme?: "orange" | "blue";
  wrapperClassName?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, size = "md", unstyled = false, theme = "orange", wrapperClassName, ...props }, ref) => {
    if (unstyled) {
      return (
        <select
          className={className}
          ref={ref}
          {...props}
        >
          {children}
        </select>
      );
    }

    const focusColors = {
      orange: "focus:border-orange-500",
      blue: "focus:border-blue-500",
    };

    const baseStyles =
      "w-full bg-gray-50/50 border-2 border-gray-100 outline-none transition-all text-gray-700 font-bold focus:bg-white cursor-pointer disabled:opacity-50 disabled:pointer-events-none appearance-none pr-10";

    const sizes = {
      sm: "h-9 px-3 text-xs rounded-xl",
      md: "h-10 sm:h-11 px-4 text-xs sm:text-sm rounded-xl",
      lg: "h-11 sm:h-12 px-4 text-sm sm:text-base rounded-2xl",
      none: "",
    };

    return (
      <div className={cn("relative w-full", wrapperClassName)}>
        <select
          className={cn(baseStyles, focusColors[theme], sizes[size], className)}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none flex items-center text-gray-400">
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;

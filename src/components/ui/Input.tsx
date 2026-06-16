"use client";

import * as React from "react";
import { cn } from "@/utils/cn";

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  size?: "sm" | "md" | "lg" | "none";
  unstyled?: boolean;
  theme?: "orange" | "blue";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", size = "md", unstyled = false, theme = "orange", ...props }, ref) => {
    if (unstyled) {
      return (
        <input
          type={type}
          className={className}
          ref={ref}
          {...props}
        />
      );
    }

    const focusColors = {
      orange: "focus:border-orange-500",
      blue: "focus:border-blue-500",
    };

    const baseStyles =
      "w-full bg-gray-50/50 border-2 border-gray-100 outline-none transition-all placeholder-gray-400 text-gray-700 font-bold focus:bg-white disabled:opacity-50 disabled:pointer-events-none";

    const sizes = {
      sm: "h-9 px-3 text-xs rounded-xl",
      md: "h-10 sm:h-11 px-4 text-xs sm:text-sm rounded-xl",
      lg: "h-11 sm:h-12 px-4 text-sm sm:text-base rounded-2xl",
      none: "",
    };

    return (
      <input
        type={type}
        className={cn(baseStyles, focusColors[theme], sizes[size], className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export default Input;

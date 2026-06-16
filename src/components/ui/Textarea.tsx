"use client";

import * as React from "react";
import { cn } from "@/utils/cn";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  unstyled?: boolean;
  theme?: "orange" | "blue";
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, unstyled = false, theme = "orange", ...props }, ref) => {
    if (unstyled) {
      return (
        <textarea
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

    return (
      <textarea
        className={cn(
          "w-full bg-gray-50/50 border-2 border-gray-100 rounded-xl px-4 py-3 outline-none transition-all placeholder-gray-400 text-gray-700 font-medium focus:bg-white resize-none text-xs sm:text-sm disabled:opacity-50 disabled:pointer-events-none",
          focusColors[theme],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";

export default Textarea;

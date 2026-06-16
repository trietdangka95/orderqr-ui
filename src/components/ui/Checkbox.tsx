"use client";

import * as React from "react";
import { cn } from "@/utils/cn";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  unstyled?: boolean;
  theme?: "orange" | "blue";
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, unstyled = false, theme = "orange", ...props }, ref) => {
    const generatedId = React.useId();
    const checkboxId = id || generatedId;

    if (unstyled) {
      return (
        <div className="flex items-center gap-2 select-none">
          <input
            type="checkbox"
            id={checkboxId}
            className={className}
            ref={ref}
            {...props}
          />
          {label && (
            <label htmlFor={checkboxId} className="cursor-pointer">
              {label}
            </label>
          )}
        </div>
      );
    }

    const themeColors = {
      orange: "checked:border-primary checked:bg-primary focus-visible:ring-primary/20",
      blue: "checked:border-blue-600 checked:bg-blue-600 focus-visible:ring-blue-600/20",
    };

    return (
      <div className="flex items-center gap-2.5 select-none">
        <div className="relative flex items-center justify-center">
          <input
            type="checkbox"
            id={checkboxId}
            className={cn(
              "peer h-5 w-5 shrink-0 appearance-none rounded-lg border-2 border-gray-200 bg-white transition-all hover:border-gray-300 focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
              themeColors[theme],
              className
            )}
            ref={ref}
            {...props}
          />
          <svg
            className="absolute h-3 w-3 pointer-events-none stroke-white stroke-2 fill-none stroke-linecap-round stroke-linejoin-round opacity-0 peer-checked:opacity-100 transition-opacity"
            viewBox="0 0 24 24"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        {label && (
          <label
            htmlFor={checkboxId}
            className="text-xs sm:text-sm font-semibold text-gray-700 cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export default Checkbox;

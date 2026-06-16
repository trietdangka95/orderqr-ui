"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  as?: React.ElementType;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "primary-blue" | "outline-blue" | "ghost-blue" | "none";
  size?: "sm" | "md" | "lg" | "none";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  unstyled?: boolean;
  [key: string]: any; // Allow motion or other library-specific props
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      as,
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      type = "button",
      unstyled = false,
      ...props
    },
    ref
  ) => {
    const Component = as || "button";

    if (unstyled) {
      return (
        <Component
          type={Component === "button" ? type : undefined}
          className={className}
          disabled={disabled || isLoading}
          ref={ref}
          {...props}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin shrink-0 inline-block mr-2" />
          ) : (
            leftIcon
          )}
          {children}
          {!isLoading && rightIcon}
        </Component>
      );
    }

    const baseStyles =
      "inline-flex items-center justify-center font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:pointer-events-none disabled:opacity-50 active:scale-95 cursor-pointer select-none";

    const variants: Record<string, string> = {
      primary:
        "bg-primary text-white hover:bg-orange-600 shadow-md shadow-orange-500/10 active:bg-orange-700",
      "primary-blue":
        "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/10 active:bg-blue-800",
      secondary:
        "bg-gray-100 hover:bg-gray-200 text-gray-700 active:bg-gray-300",
      outline:
        "border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700 active:bg-gray-100",
      "outline-blue":
        "border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-300 text-blue-700 active:bg-blue-100",
      ghost:
        "hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200",
      "ghost-blue":
        "hover:bg-blue-50 hover:text-blue-700 active:bg-blue-100 text-blue-600",
      danger:
        "bg-red-50 text-white hover:bg-red-600 shadow-md shadow-red-500/10 active:bg-red-700",
      none: "",
    };

    const sizes: Record<string, string> = {
      sm: "h-9 px-3.5 text-xs rounded-xl gap-1.5",
      md: "h-10 sm:h-11 px-4.5 text-xs sm:text-sm rounded-xl gap-2",
      lg: "h-11 sm:h-12 px-6 text-sm sm:text-base rounded-2xl gap-2.5",
      none: "",
    };

    return (
      <Component
        type={Component === "button" ? type : undefined}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        ref={ref}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        {children}
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </Component>
    );
  }
);

Button.displayName = "Button";

export default Button;

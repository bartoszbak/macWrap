"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:pointer-events-none disabled:opacity-50",
          variant === "default" && "bg-white text-black hover:bg-neutral-200",
          variant === "ghost" && "hover:bg-white/10 text-neutral-300 hover:text-white",
          variant === "outline" && "border border-white/20 text-neutral-300 hover:bg-white/10",
          size === "default" && "h-9 px-4 py-2 text-sm",
          size === "sm" && "h-7 px-3 text-xs",
          size === "icon" && "h-8 w-8",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };

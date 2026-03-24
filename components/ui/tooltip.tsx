"use client";

import * as React from "react";
import * as TooltipPrimitives from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

const TooltipProvider = TooltipPrimitives.Provider;
const Tooltip = TooltipPrimitives.Root;
const TooltipTrigger = TooltipPrimitives.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitives.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitives.Content>
>(({ className, sideOffset = 6, ...props }, ref) => (
  <TooltipPrimitives.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md bg-neutral-800 px-2.5 py-1 text-xs text-neutral-100 shadow-md animate-in fade-in-0 zoom-in-95",
      className
    )}
    {...props}
  />
));
TooltipContent.displayName = TooltipPrimitives.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };

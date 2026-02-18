import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-glow-sm active:scale-[0.97]",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:scale-[0.97]",
        outline:
          "border border-border bg-transparent text-foreground hover:bg-secondary hover:border-primary/30 active:scale-[0.97]",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:scale-[0.97]",
        ghost:
          "text-muted-foreground hover:bg-secondary hover:text-foreground active:scale-[0.97]",
        link: "text-primary underline-offset-4 hover:underline",
        /* ── Premium hero button ── */
        hero:
          "bg-gradient-to-r from-[hsl(263,70%,58%)] to-[hsl(217,91%,55%)] text-white font-semibold shadow-glow-sm hover:shadow-glow-md hover:scale-[1.03] active:scale-[0.97] transition-all duration-200 relative overflow-hidden",
        "hero-outline":
          "border border-primary/30 text-primary bg-transparent hover:bg-primary/8 hover:border-primary/60 hover:shadow-glow-sm active:scale-[0.97] transition-all duration-200",
        /* ── Session CTA — animated border ── */
        "hero-animated":
          "border-gradient-animated text-white font-semibold bg-gradient-to-r from-[hsl(263,70%,58%)] to-[hsl(217,91%,55%)] hover:scale-[1.03] hover:shadow-glow-md active:scale-[0.97] transition-all duration-200",
        accent:
          "bg-accent text-accent-foreground hover:bg-accent/90 hover:shadow-glow-blue active:scale-[0.97]",
        warning:
          "bg-warning text-warning-foreground hover:bg-warning/90 active:scale-[0.97]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-11 px-8",
        xl: "h-14 rounded-2xl px-10 text-base",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };

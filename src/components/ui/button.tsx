import React from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "glass" | "whatsapp";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  pill?: boolean;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      pill = false,
      className = "",
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

    const shape = pill ? "rounded-full" : "rounded-xl";

    const sizes = {
      sm: "h-9 px-3.5 text-xs gap-1.5",
      md: "h-11 px-5 text-sm gap-2",
      lg: "h-13 px-7 text-base font-semibold gap-2.5",
      icon: "h-10 w-10 p-0 text-sm",
    };

    const variants = {
      primary:
        "bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/20 dark:bg-blue-600 dark:hover:bg-blue-500",
      secondary:
        "bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700",
      outline:
        "border border-slate-200 bg-transparent text-slate-800 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900/60",
      ghost:
        "bg-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/60",
      danger:
        "bg-red-600 text-white hover:bg-red-700 shadow-sm shadow-red-600/20 dark:bg-red-600 dark:hover:bg-red-500",
      glass:
        "bg-white/70 backdrop-blur-md border border-white/40 text-slate-900 hover:bg-white/90 shadow-sm dark:bg-slate-900/70 dark:border-slate-800 dark:text-white dark:hover:bg-slate-900/90",
      whatsapp:
        "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 dark:bg-emerald-600 dark:hover:bg-emerald-500 font-semibold",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${shape} ${sizes[size]} ${variants[variant]} ${className}`}
        {...props}
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin shrink-0" /> : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

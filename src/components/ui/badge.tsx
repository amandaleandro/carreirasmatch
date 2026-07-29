import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "brand" | "outline";
  size?: "sm" | "md";
  dot?: boolean;
  children: React.ReactNode;
}

export function Badge({
  variant = "default",
  size = "md",
  dot = false,
  className = "",
  children,
  ...props
}: BadgeProps) {
  const sizes = {
    sm: "px-2.5 py-0.5 text-[11px]",
    md: "px-3 py-1 text-xs",
  };

  const variants = {
    default:
      "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60",
    success:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-900/60",
    warning:
      "bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200/80 dark:border-amber-900/60",
    danger:
      "bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-400 border border-red-200/80 dark:border-red-900/60",
    brand:
      "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/60",
    outline:
      "bg-transparent text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800",
  };

  const dotColors = {
    default: "bg-slate-400",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-red-500",
    brand: "bg-blue-500",
    outline: "bg-slate-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full tracking-tight shrink-0 ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {dot && (
        <span className={`h-1.5 w-1.5 rounded-full ${dotColors[variant]} shrink-0`} />
      )}
      {children}
    </span>
  );
}

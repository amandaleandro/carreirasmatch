import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "subtle" | "interactive";
  children: React.ReactNode;
}

export function Card({
  variant = "default",
  className = "",
  children,
  ...props
}: CardProps) {
  const base = "rounded-2xl transition-all duration-200";

  const variants = {
    default:
      "bg-white border border-slate-200/80 shadow-xs dark:bg-slate-900 dark:border-slate-800",
    glass:
      "bg-white/70 backdrop-blur-md border border-slate-200/60 shadow-xs dark:bg-slate-900/70 dark:border-slate-800/60",
    subtle:
      "bg-slate-50/80 border border-slate-200/60 dark:bg-slate-900/40 dark:border-slate-800/40",
    interactive:
      "bg-white border border-slate-200/80 shadow-xs hover:border-blue-500/40 hover:shadow-md hover:-translate-y-0.5 dark:bg-slate-900 dark:border-slate-800 dark:hover:border-blue-500/40",
  };

  return (
    <div className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-6 pb-3 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={`text-lg font-bold tracking-tight text-slate-900 dark:text-white ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={`text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed ${className}`}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-6 pt-3 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`p-6 pt-0 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

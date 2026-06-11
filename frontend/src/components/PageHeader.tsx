"use client";

import React from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  overline?: string;
  action?: React.ReactNode;
  className?: string;
}

function cn(classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export default function PageHeader({
  title,
  subtitle,
  overline,
  action,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn(["mb-6 flex items-start justify-between gap-4", className])}>
      <div className="min-w-0">
        {overline && (
          <p className="text-sm uppercase tracking-[0.2em] text-primary-600 dark:text-primary-400 font-medium mb-1">
            {overline}
          </p>
        )}
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
          {title}
        </h1>
        {subtitle && (
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
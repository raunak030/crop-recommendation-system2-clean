"use client";

import React from "react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

function cn(classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn([
        "flex flex-col items-center justify-center text-center p-12 min-h-[300px]",
        className,
      ])}
    >
      {icon && (
        <div className="w-20 h-20 rounded-2xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center mb-5">
          <div className="text-primary-400 dark:text-primary-500 opacity-60">
            {icon}
          </div>
        </div>
      )}
      <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">
          {description}
        </p>
      )}
      {action}
      {actionLabel && onAction && !action && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-700 to-primary-600 hover:from-primary-800 hover:to-primary-700 text-white font-semibold text-sm shadow-lg shadow-primary-700/25 transition-all"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
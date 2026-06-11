"use client";

import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  message: string;
  details?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

function cn(classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export default function ErrorState({
  message,
  details,
  onRetry,
  retryLabel = "Retry",
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn([
        "flex flex-col items-center justify-center text-center p-8 min-h-[200px]",
        className,
      ])}
    >
      <div className="w-14 h-14 rounded-2xl bg-danger-bg dark:bg-red-900/20 flex items-center justify-center mb-4">
        <AlertCircle size={28} className="text-danger" />
      </div>
      <p className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-1">
        {message}
      </p>
      {details && (
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-4">
          {details}
        </p>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium transition-all"
        >
          <RefreshCw size={12} />
          {retryLabel}
        </button>
      )}
    </div>
  );
}
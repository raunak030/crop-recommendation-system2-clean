"use client";

import React from "react";
import { Zap } from "lucide-react";

type ResponseTimeVariant = "pill" | "badge";

interface ResponseTimeProps {
  timeMs: number;
  variant?: ResponseTimeVariant;
  className?: string;
}

function cn(classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

function getTimeColor(timeMs: number): string {
  if (timeMs < 500) return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
  if (timeMs < 1500) return "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800";
  return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
}

function formatTime(timeMs: number): string {
  if (timeMs >= 1000) {
    return `${(timeMs / 1000).toFixed(1)}s`;
  }
  return `${Math.round(timeMs)}ms`;
}

export default function ResponseTime({
  timeMs,
  variant = "badge",
  className,
}: ResponseTimeProps) {
  const colorClasses = getTimeColor(timeMs);
  const formatted = formatTime(timeMs);

  if (variant === "pill") {
    return (
      <span
        className={cn([
          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border",
          colorClasses,
          className,
        ])}
      >
        <Zap size={12} />
        {formatted}
      </span>
    );
  }

  return (
    <span
      className={cn([
        "inline-flex items-center gap-1 text-xs font-medium",
        timeMs < 500
          ? "text-green-600 dark:text-green-400"
          : timeMs < 1500
          ? "text-amber-600 dark:text-amber-400"
          : "text-red-600 dark:text-red-400",
        className,
      ])}
    >
      <Zap size={10} />
      {formatted}
    </span>
  );
}
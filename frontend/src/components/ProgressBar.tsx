"use client";

import React, { useEffect, useState } from "react";

type ProgressBarSize = "sm" | "md" | "lg";

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  size?: ProgressBarSize;
  animated?: boolean;
  label?: string;
  showValue?: boolean;
  className?: string;
}

function cn(classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

const sizeStyles: Record<ProgressBarSize, string> = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
};

export default function ProgressBar({
  value,
  max = 100,
  color,
  size = "md",
  animated = false,
  label,
  showValue = false,
  className,
}: ProgressBarProps) {
  const [width, setWidth] = useState(0);
  const clampedValue = Math.max(0, Math.min(value, max));
  const percent = max > 0 ? (clampedValue / max) * 100 : 0;

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => setWidth(percent), 50);
      return () => clearTimeout(timer);
    } else {
      setWidth(percent);
    }
  }, [percent, animated]);

  const barColor =
    color ||
    (percent >= 70
      ? "bg-gradient-to-r from-primary-500 to-primary-600"
      : percent >= 40
      ? "bg-gradient-to-r from-yellow-500 to-yellow-400"
      : "bg-gradient-to-r from-red-500 to-red-400");

  return (
    <div className={cn(["space-y-1", className])}>
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && (
            <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">
              {label}
            </span>
          )}
          {showValue && (
            <span className="text-sm font-semibold text-primary-600 dark:text-primary-400 tabular-nums">
              {Math.round(percent)}%
            </span>
          )}
        </div>
      )}
      <div
        className={cn([
          "w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden",
          sizeStyles[size],
        ])}
      >
        <div
          className={cn([
            "h-full rounded-full transition-all",
            animated ? "duration-1000 ease-out" : "duration-300",
            barColor,
          ])}
          style={{ width: `${animated ? width : percent}%` }}
        />
      </div>
    </div>
  );
}
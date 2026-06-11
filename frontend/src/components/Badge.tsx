"use client";

import React from "react";

type BadgeVariant = "success" | "warning" | "danger" | "info" | "primary";
type BadgeSize = "sm" | "md";

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  pulse?: boolean;
  children: React.ReactNode;
  className?: string;
}

function cn(classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

const variantStyles: Record<BadgeVariant, string> = {
  success:
    "bg-success-bg text-success border-success/20 dark:border-green-800",
  warning:
    "bg-warning-bg text-warning border-warning/20 dark:border-amber-800",
  danger:
    "bg-danger-bg text-danger border-danger/20 dark:border-red-800",
  info:
    "bg-info-bg text-info border-info/20 dark:border-blue-800",
  primary:
    "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 border-primary-200 dark:border-primary-800",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-2.5 py-1 text-xs",
};

export default function Badge({
  variant = "primary",
  size = "md",
  pulse = false,
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn([
        "inline-flex items-center gap-1 rounded-full font-medium border",
        variantStyles[variant],
        sizeStyles[size],
        pulse ? "animate-pulse" : "",
        className,
      ])}
    >
      {pulse && (
        <span
          className={cn([
            "w-1.5 h-1.5 rounded-full inline-flex",
            variant === "success" ? "bg-success" : "",
            variant === "warning" ? "bg-warning" : "",
            variant === "danger" ? "bg-danger" : "",
            variant === "info" ? "bg-info" : "",
            variant === "primary" ? "bg-primary-500" : "",
          ])}
        />
      )}
      {children}
    </span>
  );
}
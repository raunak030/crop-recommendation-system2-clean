"use client";

import React from "react";

type CardVariant = "default" | "glass" | "bordered" | "hover";
type CardPadding = "none" | "sm" | "md" | "lg";

interface CardProps {
  variant?: CardVariant;
  padding?: CardPadding;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

function cn(classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

const variantStyles: Record<CardVariant, string> = {
  default:
    "bg-white dark:bg-slate-800 shadow-[var(--shadow-card)] rounded-xl",
  glass: "glass-card",
  bordered:
    "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl",
  hover:
    "bg-white dark:bg-slate-800 shadow-[var(--shadow-card)] rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200",
};

const paddingStyles: Record<CardPadding, string> = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

export default function Card({
  variant = "default",
  padding = "md",
  children,
  className,
  style,
}: CardProps) {
  return (
    <div
      className={cn([
        variantStyles[variant],
        paddingStyles[padding],
        className,
      ])}
      style={style}
    >
      {children}
    </div>
  );
}
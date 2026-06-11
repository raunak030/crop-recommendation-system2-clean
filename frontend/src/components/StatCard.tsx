"use client";

import { ReactNode } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  trend?: string;
  trendDirection?: "up" | "down";
}

export default function StatCard({
  icon,
  label,
  value,
  trend,
  trendDirection = "up",
}: StatCardProps) {
  const isUp = trendDirection === "up";

  return (
    <div className="glass-card p-5 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
      <div className="flex items-start justify-between mb-3">
        <div className="p-2.5 rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
          {icon}
        </div>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
        {label}
      </p>
      <p className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
        {value}
      </p>
      {trend && (
        <div className="flex items-center gap-1">
          {isUp ? (
            <TrendingUp size={14} className="text-success" />
          ) : (
            <TrendingDown size={14} className="text-danger" />
          )}
          <span
            className={`text-xs font-medium ${
              isUp
                ? "text-success"
                : "text-danger"
            }`}
          >
            {trend}
          </span>
        </div>
      )}
    </div>
  );
}
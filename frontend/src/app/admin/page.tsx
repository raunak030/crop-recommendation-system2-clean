"use client";

import {
  BarChart3,
  Satellite,
  FlaskConical,
  Users,
  ArrowUpRight,
  Activity,
  Clock,
} from "lucide-react";
import StatCard from "../../components/StatCard";

const kpiData = [
  {
    icon: <BarChart3 size={20} />,
    label: "Total Analyses",
    value: "1,247",
    trend: "↑ 12.5% this month",
    trendDirection: "up" as const,
  },
  {
    icon: <Satellite size={20} />,
    label: "NDVI Requests",
    value: "892",
    trend: "↑ 8.3% this month",
    trendDirection: "up" as const,
  },
  {
    icon: <FlaskConical size={20} />,
    label: "Fertilizer Recommendations",
    value: "456",
    trend: "↑ 15.2% this month",
    trendDirection: "up" as const,
  },
  {
    icon: <Users size={20} />,
    label: "Active Users",
    value: "284",
    trend: "↑ 22.1% this month",
    trendDirection: "up" as const,
  },
];

const weeklyData = [
  { day: "Mon", value: 40 },
  { day: "Tue", value: 65 },
  { day: "Wed", value: 55 },
  { day: "Thu", value: 80 },
  { day: "Fri", value: 90 },
  { day: "Sat", value: 45 },
  { day: "Sun", value: 30 },
];

const recentActivity = [
  {
    time: "2 min ago",
    action: "Prediction",
    crop: "Rice",
    user: "Farmer #1234",
  },
  {
    time: "8 min ago",
    action: "NDVI Analysis",
    crop: "Wheat",
    user: "Anonymous",
  },
  {
    time: "15 min ago",
    action: "Fertilizer Recommendation",
    crop: "Maize",
    user: "Farmer #5678",
  },
  {
    time: "32 min ago",
    action: "Prediction",
    crop: "Sugarcane",
    user: "Demo User",
  },
  {
    time: "1 hour ago",
    action: "NDVI Analysis",
    crop: "Cotton",
    user: "Farmer #9012",
  },
];

const topCrops = [
  { rank: 1, name: "Rice", pct: 85 },
  { rank: 2, name: "Wheat", pct: 72 },
  { rank: 3, name: "Maize", pct: 58 },
  { rank: 4, name: "Sugarcane", pct: 45 },
  { rank: 5, name: "Cotton", pct: 32 },
];

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Platform analytics and activity overview
          </p>
        </div>

        {/* ─── Section 1: KPI Row ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiData.map((kpi) => (
            <StatCard
              key={kpi.label}
              icon={kpi.icon}
              label={kpi.label}
              value={kpi.value}
              trend={kpi.trend}
              trendDirection={kpi.trendDirection}
            />
          ))}
        </div>

        {/* ─── Section 2: Weekly Activity Chart ─── */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <Activity size={16} className="text-primary-500" />
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Weekly Activity
            </h2>
          </div>
          <div className="relative h-48 md:h-56">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 bottom-6 w-8 flex flex-col justify-between text-[10px] text-slate-400 dark:text-slate-500 font-medium pointer-events-none">
              <span>100</span>
              <span>75</span>
              <span>50</span>
              <span>25</span>
              <span>0</span>
            </div>
            {/* Bars */}
            <div className="ml-10 h-full flex items-end justify-between gap-2">
              {weeklyData.map((item) => (
                <div
                  key={item.day}
                  className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end"
                >
                  <div className="relative w-full flex justify-center group">
                    <div
                      className="w-full max-w-[40px] rounded-t-lg bg-gradient-to-t from-primary-600 to-primary-400 hover:from-primary-500 hover:to-primary-300 transition-all duration-200 cursor-pointer"
                      style={{ height: `${item.value}%` }}
                    >
                      {/* Tooltip */}
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 dark:bg-slate-700 text-white text-[10px] px-2 py-1 rounded-md whitespace-nowrap pointer-events-none z-10 shadow-lg">
                        {item.value} analyses
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    {item.day}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Section 3: Recent Activity Table ─── */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={16} className="text-primary-500" />
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Recent Activity
            </h2>
          </div>
          <div className="overflow-x-auto -mx-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Time
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Action
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Crop
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    User
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((row, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-6 py-3.5 text-slate-500 dark:text-slate-400 text-xs whitespace-nowrap">
                      {row.time}
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400">
                        {row.action}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-slate-700 dark:text-slate-300 font-medium text-sm whitespace-nowrap">
                      {row.crop}
                    </td>
                    <td className="px-6 py-3.5 text-slate-500 dark:text-slate-400 text-xs whitespace-nowrap">
                      {row.user}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ─── Section 4: Top Recommended Crops ─── */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <ArrowUpRight size={16} className="text-primary-500" />
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Top Recommended Crops
            </h2>
          </div>
          <div className="space-y-4">
            {topCrops.map((crop) => (
              <div key={crop.name} className="flex items-center gap-4">
                <span className="w-6 text-xs font-bold text-slate-400 dark:text-slate-500 text-right tabular-nums">
                  #{crop.rank}
                </span>
                <span className="w-20 text-sm font-medium text-slate-700 dark:text-slate-300 shrink-0">
                  {crop.name}
                </span>
                <div className="flex-1 h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-400 transition-all duration-1000"
                    style={{ width: `${crop.pct}%` }}
                  />
                </div>
                <span className="w-10 text-sm font-semibold text-slate-600 dark:text-slate-400 text-right tabular-nums">
                  {crop.pct}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
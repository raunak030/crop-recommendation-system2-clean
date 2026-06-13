"use client";

import { BarChart3, Construction } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Card from "../../components/Card";

export default function AdminPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-8 space-y-8">
        <PageHeader
          overline="Administration"
          title="Analytics Dashboard"
          subtitle="Real-time platform analytics and monitoring"
        />

        <Card variant="glass" padding="lg">
          <div className="flex flex-col items-center text-center py-12 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Construction size={32} className="text-slate-400 dark:text-slate-500" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Analytics Dashboard — Coming Soon
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
              Real-time analytics tracking will be available once the backend tracking API is implemented.
              This dashboard will display crop prediction counts, NDVI analysis metrics, user activity trends,
              and system performance data.
            </p>
            <div className="w-24 h-1 rounded-full bg-slate-200 dark:bg-slate-700 mt-2"></div>
          </div>
        </Card>
      </div>
    </div>
  );
}
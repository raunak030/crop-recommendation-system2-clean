"use client";

import Link from "next/link";
import {
  Sprout,
  Satellite,
  FlaskConical,
  ArrowRight,
  Leaf,
  ChevronRight,
  BarChart3,
  MapPin,
  CloudSun,
  Server,
  Braces,
  Globe,
  Scan,
  Cloud,
  Users,
  Building2,
  Landmark,
  Factory,
} from "lucide-react";
import Badge from "../components/Badge";
import Card from "../components/Card";
import Button from "../components/Button";

const features = [
  {
    icon: <Sprout size={28} />,
    title: "Crop Recommendation Engine",
    description:
      "Enterprise-grade AI predictions based on soil NPK, weather telemetry, and satellite-derived vegetation indices to optimize large-scale crop planning.",
    href: "/recommend",
    color: "text-primary-600 dark:text-primary-400",
    bg: "bg-primary-50 dark:bg-primary-900/30",
    target: "FPOs · NGOs · Government Programs",
  },
  {
    icon: <Satellite size={28} />,
    title: "NDVI Intelligence",
    description:
      "Automated vegetation health surveillance across thousands of hectares using Sentinel-2 imagery with historical trend analysis and anomaly detection.",
    href: "/ndvi",
    color: "text-primary-600 dark:text-primary-400",
    bg: "bg-primary-50 dark:bg-primary-900/30",
    target: "Agri-Business · Research · Government",
  },
  {
    icon: <FlaskConical size={28} />,
    title: "Fertilizer Advisory System",
    description:
      "Data-driven nutrient management plans tailored to crop genetics, soil profiles, and yield targets — reducing input costs while maximizing output.",
    href: "/fertilizer",
    color: "text-primary-600 dark:text-primary-400",
    bg: "bg-primary-50 dark:bg-primary-900/30",
    target: "FPOs · Seed Companies · Extension Services",
  },
];

const steps = [
  {
    icon: <MapPin size={20} />,
    title: "Configure Parameters",
    description: "Input soil composition, weather data, and field coordinates. Bulk import supported for enterprise deployments.",
  },
  {
    icon: <CloudSun size={20} />,
    title: "AI Processing Pipeline",
    description: "Ensemble models analyze your data against historical patterns, satellite NDVI, and weather forecasts in real time.",
  },
  {
    icon: <Leaf size={20} />,
    title: "Actionable Intelligence",
    description: "Receive crop recommendations, fertilizer schedules, and health assessments with full audit trails and exportable reports.",
  },
];

const infrastructure = [
  {
    icon: <Server size={24} />,
    name: "FastAPI",
    description: "High-performance async Python backend with automatic OpenAPI documentation.",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
  },
  {
    icon: <Braces size={24} />,
    name: "Scikit-Learn",
    description: "Production-tested ML models for crop classification and regression analysis.",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    icon: <Globe size={24} />,
    name: "Google Earth Engine",
    description: "Petabyte-scale satellite imagery processing for NDVI and vegetation analytics.",
    color: "text-yellow-600 dark:text-yellow-400",
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
  },
  {
    icon: <Scan size={24} />,
    name: "Sentinel-2",
    description: "ESA satellite constellation providing 10m resolution multispectral imagery every 5 days.",
    color: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-50 dark:bg-sky-900/20",
  },
  {
    icon: <Cloud size={24} />,
    name: "Render",
    description: "Cloud-native hosting with auto-scaling, SSL, and global CDN for low-latency access.",
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-50 dark:bg-indigo-900/20",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-900/50">
      {/* ─── Hero Section ─── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-100/40 via-transparent to-earth-100/30 dark:from-primary-900/20 dark:via-transparent dark:to-earth-900/20 pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 pt-20 pb-16 md:pt-28 md:pb-24 relative z-10">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-400 text-xs font-medium mb-6 border border-primary-200 dark:border-primary-800">
              <BarChart3 size={14} />
              Enterprise Agri Intelligence Platform
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
              Data-Driven Decisions for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">
                Large-Scale Agriculture
              </span>
            </h1>
            <p className="mt-5 text-lg text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
              AI-powered crop intelligence platform serving agricultural organizations,
              government programs, and agri-businesses with satellite-driven insights
              and machine learning predictions.
            </p>

            {/* Target Audience Badges */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium border border-slate-200 dark:border-slate-700">
                <Building2 size={12} /> FPOs
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium border border-slate-200 dark:border-slate-700">
                <Landmark size={12} /> NGOs
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium border border-slate-200 dark:border-slate-700">
                <Users size={12} /> Government Programs
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium border border-slate-200 dark:border-slate-700">
                <Factory size={12} /> Agri-Business
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Link
                href="/recommend"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-700 to-primary-600 hover:from-primary-800 hover:to-primary-700 text-white font-semibold text-sm shadow-lg shadow-primary-700/25 hover:shadow-xl hover:shadow-primary-700/30 transition-all"
              >
                Explore Platform
                <ArrowRight size={16} />
              </Link>
              <a
                href="https://github.com/your-org/smart-crop-engine#readme"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium text-sm transition-all"
              >
                <Satellite size={16} />
                View Documentation
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats Bar ─── */}
      <section className="border-y border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
        <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: "Recommendations", value: "10K+" },
            { label: "NDVI Analyses", value: "5K+" },
            { label: "Fertilizer Plans", value: "3K+" },
            { label: "Organizations Served", value: "200+" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-primary-600 dark:text-primary-400">
                {stat.value}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Feature Cards ─── */}
      <section className="max-w-6xl mx-auto px-4 py-16 md:py-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            Enterprise-Grade Agricultural Intelligence
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
            Purpose-built tools for organizations managing agricultural operations at scale
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Link
              key={feature.title}
              href={feature.href}
              className="group glass-card p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
            >
              <div
                className={`w-12 h-12 rounded-xl ${feature.bg} ${feature.color} flex items-center justify-center mb-4`}
              >
                {feature.icon}
              </div>
              <Badge variant="info" size="sm" className="mb-3">
                Targeted For: {feature.target}
              </Badge>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                {feature.description}
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 dark:text-primary-400">
                Explore Dashboard
                <ChevronRight size={12} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
        <div className="max-w-5xl mx-auto px-4 py-16 md:py-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
              How It Works
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
              From field data to actionable intelligence in three steps
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, idx) => (
              <div key={step.title} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center mx-auto mb-4 relative">
                  {step.icon}
                  {idx < steps.length - 1 && (
                    <div className="hidden md:block absolute left-full top-1/2 -translate-y-1/2 w-8 h-px bg-slate-300 dark:bg-slate-600" />
                  )}
                </div>
                <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary-600 text-white text-xs font-bold mb-3">
                  {idx + 1}
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1.5">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Infrastructure Section ─── */}
      <section className="max-w-6xl mx-auto px-4 py-16 md:py-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            Built on Real Infrastructure
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
            Production-grade technology stack powering every prediction and analysis
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {infrastructure.map((tech) => (
            <Card key={tech.name} variant="hover" padding="md" className="text-center">
              <div
                className={`w-12 h-12 rounded-xl ${tech.bg} ${tech.color} flex items-center justify-center mx-auto mb-3`}
              >
                {tech.icon}
              </div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                {tech.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
                {tech.description}
              </p>
              <Badge variant="success" size="sm" pulse>
                PRODUCTION
              </Badge>
            </Card>
          ))}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="max-w-4xl mx-auto px-4 py-16 md:py-20 text-center">
        <div className="glass-card p-10 md:p-14">
          <Leaf
            size={36}
            className="text-primary-500 mx-auto mb-4"
          />
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-3">
            Ready to Scale Your Agricultural Operations?
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto mb-6">
            Join 200+ organizations leveraging AI-powered crop intelligence.
            Start with a free recommendation analysis — no commitment required.
          </p>
          <Link
            href="/recommend"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-700 to-primary-600 hover:from-primary-800 hover:to-primary-700 text-white font-semibold text-sm shadow-lg shadow-primary-700/25 hover:shadow-xl transition-all"
          >
            <Sprout size={16} />
            Start Free Analysis
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
"use client";

import {
  Target,
  Code2,
  Users,
  Cpu,
  Satellite,
  Globe,
  BarChart3,
  Leaf,
  Smartphone,
  FlaskConical,
} from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Card from "../../components/Card";

const techStack = [
  { name: "FastAPI", icon: <Cpu size={24} />, desc: "High-performance Python backend framework" },
  { name: "Scikit-Learn", icon: <BarChart3 size={24} />, desc: "ML model training and inference pipeline" },
  { name: "Google Earth Engine", icon: <Globe size={24} />, desc: "Satellite imagery and geospatial analysis" },
  { name: "Sentinel-2", icon: <Satellite size={24} />, desc: "ESA satellite providing 10m multispectral data" },
  { name: "Next.js", icon: <Code2 size={24} />, desc: "React framework with SSR and static optimization" },
  { name: "Tailwind CSS", icon: <Cpu size={24} />, desc: "Utility-first CSS framework for rapid UI" },
  { name: "Render", icon: <Globe size={24} />, desc: "Cloud hosting for the backend API service" },
  { name: "Vercel", icon: <Globe size={24} />, desc: "Frontend deployment and edge network" },
];

const capabilities = [
  { icon: <Cpu size={16} />, text: "ML-powered crop prediction with multi-factor confidence scoring" },
  { icon: <Satellite size={16} />, text: "Satellite NDVI analysis via Google Earth Engine integration" },
  { icon: <FlaskConical size={16} />, text: "AI-driven fertilizer recommendation based on soil NPK levels" },
  { icon: <BarChart3 size={16} />, text: "Real-time response time monitoring on all prediction endpoints" },
  { icon: <Leaf size={16} />, text: "Environmental parameter fusion (soil, weather, pH, rainfall)" },
  { icon: <Globe size={16} />, text: "GPS-based location detection with automated weather data" },
  { icon: <Smartphone size={16} />, text: "Fully responsive design — mobile, tablet, and desktop" },
  { icon: <Code2 size={16} />, text: "Modern Next.js architecture with TypeScript and Tailwind CSS" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-6 md:py-8 space-y-8">
        {/* Header */}
        <PageHeader
          title="About Smart Crop Engine"
          subtitle="Leveraging machine learning and satellite data to deliver intelligent, data-driven crop recommendations for modern agriculture."
        />

        {/* Mission Section */}
        <Card variant="glass" padding="lg">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
              <Target size={24} className="text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                Built for Real Agriculture
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Agriculture is the backbone of our civilization, yet many farmers still rely on 
                guesswork for critical decisions about what to plant and how to nurture their crops. 
                Smart Crop Engine aims to democratize AI-powered agricultural intelligence — making 
                precision farming accessible to everyone from smallholder farmers to large agri-businesses.
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mt-3">
                By combining machine learning models with real-time satellite imagery from Sentinel-2 
                and environmental data, we provide actionable recommendations that improve yield, 
                reduce waste, and promote sustainable farming practices.
              </p>
            </div>
          </div>
        </Card>

        {/* Tech Stack */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
            Technology Stack
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {techStack.map((tech) => (
              <Card
                key={tech.name}
                variant="hover"
                padding="md"
                className="flex flex-col items-center text-center gap-2"
              >
                <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
                  {tech.icon}
                </div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  {tech.name}
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  {tech.desc}
                </p>
              </Card>
            ))}
          </div>
        </div>

        {/* Capabilities Section */}
        <Card variant="glass" padding="lg">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
              <Leaf size={24} className="text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                Platform Capabilities
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Smart Crop Engine integrates machine learning, satellite data, and environmental
                sensing into a unified platform that delivers actionable agricultural intelligence:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {capabilities.map((cap, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50"
                  >
                    <span className="text-primary-600 dark:text-primary-400 shrink-0">
                      {cap.icon}
                    </span>
                    <span className="text-xs text-slate-700 dark:text-slate-300">
                      {cap.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
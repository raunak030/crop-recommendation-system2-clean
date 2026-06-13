import { GitBranch, Cpu, Satellite, Globe, BarChart3 } from "lucide-react";
import Link from "next/link";

const techStack = [
  { name: "FastAPI", icon: <Cpu size={14} /> },
  { name: "Scikit-Learn", icon: <BarChart3 size={14} /> },
  { name: "Earth Engine", icon: <Globe size={14} /> },
  { name: "Sentinel-2", icon: <Satellite size={14} /> },
  { name: "Next.js", icon: <Cpu size={14} /> },
  { name: "Tailwind CSS", icon: <BarChart3 size={14} /> },
];

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Grid layout: stack on mobile, grid on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1: Brand & Copyright */}
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl">🌾</span>
              <span className="font-bold text-base text-primary-700 dark:text-primary-400">
                Smart Crop Engine
              </span>
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              AI-powered crop recommendation platform leveraging machine learning and satellite data for modern agriculture.
            </p>
          </div>

          {/* Column 2: Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Links
            </h3>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <Link
                href="/about"
                className="text-sm text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-colors"
              >
                About
              </Link>
              <Link
                href="/faq"
                className="text-sm text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-colors"
              >
                FAQ
              </Link>
              <Link
                href="/contact"
                className="text-sm text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>

          {/* Column 3: Tech Stack */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Tech Stack
            </h3>
            <div className="flex flex-wrap gap-2">
              {techStack.map((tech) => (
                <span
                  key={tech.name}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                >
                  {tech.icon}
                  {tech.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-400 dark:text-slate-500">
            © 2026 Smart Crop Engine. Powered by AI &amp; Satellite Data.
          </p>
          <Link
            href="https://github.com/raunak030/crop-recommendation-system2-clean"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            aria-label="GitHub"
          >
            <GitBranch size={18} />
          </Link>
        </div>
      </div>
    </footer>
  );
}
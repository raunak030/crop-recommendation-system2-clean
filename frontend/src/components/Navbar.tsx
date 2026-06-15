"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Sprout,
  Satellite,
  FlaskConical,
  Info,
  HelpCircle,
  Mail,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const navLinks = [
  { href: "/", label: "Home", mobileIcon: LayoutDashboard },
  { href: "/recommend", label: "Recommend", mobileIcon: Sprout },
  { href: "/ndvi", label: "NDVI", mobileIcon: Satellite },
  { href: "/fertilizer", label: "Fertilizer", mobileIcon: FlaskConical },
  { href: "/about", label: "About", mobileIcon: Info },
  { href: "/faq", label: "FAQ", mobileIcon: HelpCircle },
  { href: "/contact", label: "Contact", mobileIcon: Mail },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* ─── Desktop Top Navbar (md+) ─── */}
      <nav className="hidden md:flex sticky top-0 z-50 glass border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto w-full px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl">🌾</span>
            <span className="font-bold text-lg text-primary-700 dark:text-primary-400 group-hover:text-primary-600 transition-colors">
              Smart Crop Engine
            </span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-400"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />
        </div>
      </nav>

      {/* ─── Mobile Bottom Tab Bar (<md) ─── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-slate-200/50 dark:border-slate-700/50 safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-2 overflow-x-auto">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.mobileIcon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-200 min-w-[56px] ${
                  isActive
                    ? "text-primary-600 dark:text-primary-400"
                    : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400"
                }`}
              >
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 1.5}
                  className={isActive ? "drop-shadow-sm" : ""}
                />
                <span
                  className={`text-[10px] font-medium ${
                    isActive ? "opacity-100" : "opacity-70"
                  }`}
                >
                  {link.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
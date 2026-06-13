"use client";

import { Mail, GitBranch, MapPin, Send } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Card from "../../components/Card";
import Button from "../../components/Button";

const contactInfo = [
  {
    icon: <Mail size={20} />,
    label: "Email",
    value: "Use the link below to send us a message",
    href: "mailto:?subject=Smart%20Crop%20Engine%20Inquiry",
  },
  {
    icon: <GitBranch size={20} />,
    label: "GitHub",
    value: "github.com/raunak030",
    href: "https://github.com/raunak030/crop-recommendation-system2-clean",
  },
  {
    icon: <MapPin size={20} />,
    label: "Location",
    value: "Built for global agriculture",
    href: null,
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-8 space-y-8">
        {/* Header */}
        <PageHeader
          title="Get In Touch"
          subtitle="Have questions or feedback? We'd love to hear from you."
        />

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {contactInfo.map((info) => (
            <Card key={info.label} variant="glass" padding="md" className="text-center">
              {info.href ? (
                <a
                  href={info.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform">
                    {info.icon}
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {info.label}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {info.value}
                  </p>
                </a>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
                    {info.icon}
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {info.label}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {info.value}
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Honest Contact Section */}
        <Card variant="glass" padding="lg">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-5">
            Send Us a Message
          </h2>

          <div className="flex flex-col items-center text-center py-6 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center mb-2">
              <Mail size={24} className="text-primary-600 dark:text-primary-400" />
            </div>
            <p className="text-base font-medium text-slate-700 dark:text-slate-300">
              Reach out via email
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
              We currently don&apos;t have a backend contact form. Please use the email link below — your
              default email client will open with a pre-addressed message.
            </p>
            <a
              href="mailto:?subject=Smart%20Crop%20Engine%20Inquiry&body=I%20have%20a%20question%20about%20Smart%20Crop%20Engine..."
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium transition-colors"
            >
              <Send size={16} />
              Open Email Client
            </a>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              Or report an issue on{" "}
              <a
                href="https://github.com/raunak030/crop-recommendation-system2-clean"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-primary-600"
              >
                GitHub
              </a>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
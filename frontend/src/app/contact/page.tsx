"use client";

import { useState } from "react";
import { Mail, GitBranch, MapPin, Send } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Card from "../../components/Card";
import Input from "../../components/Input";
import Button from "../../components/Button";

const contactInfo = [
  {
    icon: <Mail size={20} />,
    label: "Email",
    value: "hello@smartcropengine.dev",
    href: "mailto:hello@smartcropengine.dev",
  },
  {
    icon: <GitBranch size={20} />,
    label: "GitHub",
    value: "github.com/smartcropengine",
    href: "https://github.com",
  },
  {
    icon: <MapPin size={20} />,
    label: "Location",
    value: "Built for global agriculture",
    href: null,
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "General",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate brief loading state (no actual backend submission)
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setForm({ name: "", email: "", subject: "General", message: "" });
      setTimeout(() => setSubmitted(false), 4000);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-900/50">
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

        {/* Contact Form */}
        <Card variant="glass" padding="lg">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-5">
            Send Us a Message
          </h2>

          {submitted ? (
            <div className="flex flex-col items-center justify-center text-center py-8">
              <div className="w-14 h-14 rounded-2xl bg-success-bg flex items-center justify-center mb-4">
                <Send size={24} className="text-success" />
              </div>
              <p className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-1">
                Message Sent!
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Thank you for reaching out. We&apos;ll get back to you soon.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Your Name"
                  type="text"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(val) => handleChange("name", val)}
                  required
                />
                <Input
                  label="Email Address"
                  type="text"
                  placeholder="john@example.com"
                  value={form.email}
                  onChange={(val) => handleChange("email", val)}
                  required
                />
              </div>

              <Input
                label="Subject"
                type="select"
                value={form.subject}
                onChange={(val) => handleChange("subject", val)}
                options={[
                  { value: "General", label: "General Inquiry" },
                  { value: "Technical", label: "Technical Support" },
                  { value: "Feedback", label: "Feedback" },
                  { value: "Other", label: "Other" },
                ]}
              />

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Message
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) => handleChange("message", e.target.value)}
                  required
                  placeholder="How can we help you?"
                  rows={5}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none"
                />
              </div>

              <Button
                type="submit"
                fullWidth
                loading={submitting}
                disabled={submitting}
                icon={<Send size={16} />}
              >
                {submitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
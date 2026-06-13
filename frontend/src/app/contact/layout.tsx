import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us — Smart Crop Engine",
  description:
    "Get in touch with the Smart Crop Engine team. Have questions or feedback about our AI-powered crop recommendation platform? Reach out today.",
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
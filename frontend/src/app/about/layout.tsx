import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — Smart Crop Engine",
  description:
    "Learn about Smart Crop Engine — an AI-powered crop intelligence platform combining machine learning, satellite data, and environmental sensing for precision agriculture.",
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
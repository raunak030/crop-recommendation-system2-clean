import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ — Smart Crop Engine",
  description:
    "Frequently asked questions about Smart Crop Engine's crop prediction, NDVI analysis, and fertilizer advisory features.",
};

export default function FaqLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
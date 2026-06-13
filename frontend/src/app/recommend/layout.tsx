import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crop Recommendation — Smart Crop Engine",
  description:
    "Get AI-powered crop recommendations based on soil NPK, weather parameters, and satellite data. Smart Crop Engine helps farmers choose the best crops for their land.",
};

export default function RecommendLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
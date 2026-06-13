import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fertilizer Advisory — Smart Crop Engine",
  description:
    "Get AI-driven fertilizer recommendations based on your crop type and soil NPK levels. Optimize nutrient management and reduce input costs with Smart Crop Engine.",
};

export default function FertilizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
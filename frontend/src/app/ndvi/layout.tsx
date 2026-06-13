import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NDVI Analysis — Smart Crop Engine",
  description:
    "Analyze vegetation health using Sentinel-2 satellite imagery and NDVI (Normalized Difference Vegetation Index). Powered by Google Earth Engine integration.",
};

export default function NdvILayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
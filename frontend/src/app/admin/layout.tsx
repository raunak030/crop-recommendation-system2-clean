import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard — Smart Crop Engine",
  description:
    "Smart Crop Engine administration panel. Platform analytics and monitoring tools for administrators.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
import type { Metadata } from "next";
import { DashboardPage } from "@/components/pages/dashboard-page";

export const metadata: Metadata = {
  title: "Dashboard — PDF Squeeze",
  description: "View your PDF compression statistics, recent activity, and quick upload.",
};

export default function HomePage() {
  return <DashboardPage />;
}

import type { Metadata } from "next";
import { HistoryPage } from "@/components/pages/history-page";

export const metadata: Metadata = {
  title: "History — PDF Squeeze",
  description: "View all your PDF compression history. Search, sort, paginate, download, and delete past compressions.",
};

export default function HistoryRoute() {
  return <HistoryPage />;
}

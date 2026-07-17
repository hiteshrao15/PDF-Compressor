import type { Metadata } from "next";
import { ResultPage } from "@/components/pages/result-page";

export const metadata: Metadata = {
  title: "Compression Result — PDF Squeeze",
  description: "View your PDF compression results, download the compressed file, and see how much storage you saved.",
};

export default function ResultRoute() {
  return <ResultPage />;
}
